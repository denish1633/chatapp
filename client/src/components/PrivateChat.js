import React, { Component } from "react";
import api from "./axiosConfig";
import queryString from "query-string";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  InputBase,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  ListItemButton,
  AvatarGroup,
  CircularProgress,
} from "@mui/material";
import {
  IoHome,
  IoSearchCircle,
  IoHelpCircle,
  IoSettings,
  IoNotifications,
  IoChatbubbleEllipsesOutline,
  IoEllipsisVertical,
  IoAdd,
  IoSend,
  IoPieChart,
  IoCalendar,
  IoDownload,
  IoLogOut,
  IoPersonAdd,
  IoPeople,
  IoVideocam,
  IoCall,
  IoDocument,
  IoImage,
  IoHappy,
  IoAttach,
  IoCheckmark,
  IoCheckmarkDone,
  IoClose,
  IoPencil,
  IoTrash,
  IoPushOutline,
  IoFlag,
  IoArchive,
  IoTime,
  IoInformationCircle,
} from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";
import { getToken, getUser, isAuthenticated, logout } from "./authUtils";
import SidebarNav from "./NavBar";

export default class ChatHomeScreen extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      usersCollection: [],
      oldMessages: [],
      currentUser: {},
      targetUser: {},
      roomId: "",
      activeChat: null,
      friends: [],
      groups: [],
      pendingRequests: [],
      
      // Enhanced features
      searchQuery: "",
      chatFilter: "all", // all, direct, groups, unread
      onlineUsers: new Set(),
      typingUsers: new Map(), // roomId -> Set of user IDs
      editingMessageId: null,
      replyToMessage: null,
      pinnedMessages: new Map(), // roomId -> array of messages
      isRecording: false,
      showEmojiPicker: false,
      selectedFiles: [],
      
      // Dialog states
      openAddFriend: false,
      openCreateGroup: false,
      openFriendRequests: false,
      openChatInfo: false,
      openScheduleMessage: false,
      
      // Form states
      friendEmail: "",
      groupName: "",
      groupDescription: "",
      selectedMembers: [],
      scheduledTime: null,
      
      // Menu states
      messageMenuAnchor: null,
      selectedMessageForMenu: null,
      chatOptionsAnchor: null,
      
      // Loading states
      isLoadingMessages: false,
      isSendingMessage: false,
    };

    this.messagesEndRef = React.createRef();
    this.fileInputRef = React.createRef();
    this.typingTimeout = null;
  }

  async componentDidMount() {
    if (!isAuthenticated()) {
      window.location = "/SignIn";
      return;
    }

    await this.getUserData();
    this.connectWebSocket();
    this.startPresenceHeartbeat();
  }

  componentWillUnmount() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect();
    }
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Auto-scroll to bottom when new messages arrive
    if (prevState.oldMessages.length !== this.state.oldMessages.length) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  connectWebSocket() {
    const socket = new SockJS(process.env.REACT_APP_WS_URL);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      (frame) => {
        console.log("Connected to WebSocket:", frame);

        // Subscribe to user's presence updates
        this.stompClient.subscribe("/topic/presence", (message) => {
          const presenceData = JSON.parse(message.body);
          this.updateUserPresence(presenceData);
        });

        // Subscribe to typing indicators
        this.stompClient.subscribe("/topic/typing", (message) => {
          const typingData = JSON.parse(message.body);
          this.updateTypingIndicator(typingData);
        });

        if (this.state.roomId) {
          this.subscribeToRoom(this.state.roomId);
        }

        // Send initial presence
        this.sendPresence("online");
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        setTimeout(() => this.connectWebSocket(), 5000);
      }
    );
  }

  subscribeToRoom(roomId) {
    if (this.stompClient && this.stompClient.connected) {
      if (this.roomSubscription) {
        this.roomSubscription.unsubscribe();
      }

      this.roomSubscription = this.stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message) => {
          const messageData = JSON.parse(message.body);
          this.handleIncomingMessage(messageData);
        }
      );
    }
  }

  handleIncomingMessage(messageData) {
    if (messageData.type === "message") {
      this.getOldChat(this.state.roomId);
    } else if (messageData.type === "messageDeleted") {
      this.setState(prevState => ({
        oldMessages: prevState.oldMessages.filter(m => m.id !== messageData.messageId)
      }));
    } else if (messageData.type === "messageEdited") {
      this.setState(prevState => ({
        oldMessages: prevState.oldMessages.map(m => 
          m.id === messageData.messageId ? { ...m, text: messageData.text, edited: true } : m
        )
      }));
    }
  }

  updateUserPresence(presenceData) {
    this.setState(prevState => {
      const onlineUsers = new Set(prevState.onlineUsers);
      if (presenceData.status === "online") {
        onlineUsers.add(presenceData.userId);
      } else {
        onlineUsers.delete(presenceData.userId);
      }
      return { onlineUsers };
    });
  }

  updateTypingIndicator(typingData) {
    const { roomId, userId, isTyping } = typingData;
    
    this.setState(prevState => {
      const typingUsers = new Map(prevState.typingUsers);
      let roomTyping = typingUsers.get(roomId) || new Set();
      
      if (isTyping) {
        roomTyping.add(userId);
      } else {
        roomTyping.delete(userId);
      }
      
      typingUsers.set(roomId, roomTyping);
      return { typingUsers };
    });
  }

  sendPresence(status) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send("/app/presence", {}, JSON.stringify({
        userId: this.state.currentUser.id,
        status: status
      }));
    }
  }

  startPresenceHeartbeat() {
    this.presenceInterval = setInterval(() => {
      this.sendPresence("online");
    }, 30000); // Every 30 seconds
  }

  sendTypingIndicator(isTyping) {
    if (this.stompClient && this.stompClient.connected && this.state.roomId) {
      this.stompClient.send("/app/typing", {}, JSON.stringify({
        roomId: this.state.roomId,
        userId: this.state.currentUser.id,
        isTyping: isTyping
      }));
    }
  }

  handleMessageChange = (e) => {
    const value = e.target.value;
    this.setState({ message: value });

    // Send typing indicator
    if (value.length > 0) {
      this.sendTypingIndicator(true);
      
      // Clear previous timeout
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      // Stop typing after 2 seconds of inactivity
      this.typingTimeout = setTimeout(() => {
        this.sendTypingIndicator(false);
      }, 2000);
    } else {
      this.sendTypingIndicator(false);
    }
  };

  async getUserData() {
    const queryParams = queryString.parse(window.location.search);
    const token = getToken();

    try {
      const res = await api.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = res.data.find(
        (user) => user.id === (queryParams.id || getUser()?.id)
      );
      
      this.setState(
        {
          usersCollection: res.data,
          currentUser: currentUser || {},
          pendingRequests: currentUser?.pendingRequest || [],
        },
        () => {
          this.loadFriends();
          this.loadGroups();
        }
      );
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  }

  async loadFriends() {
    if (!this.state.currentUser?.id) return;

    try {
      const friendsList = [];
      for (const friend of this.state.currentUser.userFriend || []) {
        const user = this.state.usersCollection.find(
          (u) => u.id === friend.friendId
        );
        if (user) {
          friendsList.push({
            ...user,
            roomId: friend.roomId,
            type: 'direct'
          });
        }
      }
      this.setState({ friends: friendsList });
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  }

  async loadGroups() {
    if (!this.state.currentUser?.id) return;

    const token = getToken();
    try {
      const res = await api.get(
        `/group/user/${this.state.currentUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const groupsWithType = res.data.map(g => ({ ...g, type: 'group' }));
      this.setState({ groups: groupsWithType });
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  }

  async addFriend() {
    const token = getToken();
    try {
      await api.post(
        "/user/friend-request",
        {
          currentUserId: this.state.currentUser.id,
          targetEmail: this.state.friendEmail,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      this.setState({ 
        openAddFriend: false, 
        friendEmail: "" 
      });
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert(error.response?.data?.message || "Failed to send friend request");
    }
  }

  async acceptRequest(friendId) {
    const token = getToken();
    try {
      await api.post(
        `/user/accept-friend/${this.state.currentUser.id}/${friendId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await this.getUserData();
      await this.loadFriends();
      alert("Friend request accepted!");
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("Failed to accept friend request");
    }
  }

  async declineRequest(friendId) {
    const token = getToken();
    try {
      await api.post(
        `/user/decline-friend/${this.state.currentUser.id}/${friendId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await this.getUserData();
      alert("Friend request declined");
    } catch (error) {
      console.error("Error declining friend request:", error);
      alert("Failed to decline friend request");
    }
  }

  async createGroup() {
    if (!this.state.groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    const token = getToken();
    try {
      await api.post(
        `/group?userId=${this.state.currentUser.id}`,
        {
          name: this.state.groupName,
          description: this.state.groupDescription,
          memberIds: this.state.selectedMembers,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await this.loadGroups();
      this.setState({
        openCreateGroup: false,
        groupName: "",
        groupDescription: "",
        selectedMembers: [],
      });
      alert("Group created successfully!");
    } catch (error) {
      console.error("Error creating group:", error);
      alert(error.response?.data?.message || "Failed to create group");
    }
  }

  async startChat(chat) {
    this.setState({ isLoadingMessages: true });
    
    const roomId = chat.roomId;

    this.setState(
      {
        activeChat: chat,
        targetUser: chat,
        roomId: roomId,
      },
      () => {
        this.subscribeToRoom(roomId);
      }
    );

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send("/app/joinRoom", {}, JSON.stringify(roomId));
    }

    await this.getOldChat(roomId);
    this.setState({ isLoadingMessages: false });
  }

  async getOldChat(roomId) {
    const token = getToken();
    try {
      const res = await api.get(`/message/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      this.setState({ oldMessages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  async sendMessage() {
    if (!this.state.message.trim() && this.state.selectedFiles.length === 0) return;
    if (!this.state.roomId) return;

    this.setState({ isSendingMessage: true });

    const messageData = {
      id: uuidv4(),
      text: this.state.message,
      from: {
        id: this.state.currentUser.id,
        firstName: this.state.currentUser.firstName,
        lastName: this.state.currentUser.lastName,
        email: this.state.currentUser.email,
      },
      to: this.state.targetUser.type === 'group' ? null : {
        id: this.state.targetUser.id,
        firstName: this.state.targetUser.firstName,
        lastName: this.state.targetUser.lastName,
        email: this.state.targetUser.email,
      },
      roomId: this.state.roomId,
      timestamp: new Date().toISOString(),
      replyTo: this.state.replyToMessage?.id || null,
      files: this.state.selectedFiles.map(f => ({ name: f.name, type: f.type })),
    };

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send(
        "/app/sendMessage",
        {},
        JSON.stringify(messageData)
      );
    }

    this.setState({ 
      message: "",
      replyToMessage: null,
      selectedFiles: [],
      isSendingMessage: false
    });
    this.sendTypingIndicator(false);
  }

  async editMessage(messageId, newText) {
    const token = getToken();
    try {
      await api.put(
        `/message/${messageId}`,
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send("/app/editMessage", {}, JSON.stringify({
          messageId,
          text: newText,
          roomId: this.state.roomId
        }));
      }

      this.setState({ editingMessageId: null, message: "" });
    } catch (error) {
      console.error("Error editing message:", error);
      alert("Failed to edit message");
    }
  }

  async deleteMessage(messageId) {
    const token = getToken();
    try {
      await api.delete(`/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send("/app/deleteMessage", {}, JSON.stringify({
          messageId,
          roomId: this.state.roomId
        }));
      }

      this.setState(prevState => ({
        oldMessages: prevState.oldMessages.filter(m => m.id !== messageId)
      }));
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    
    if (this.state.editingMessageId) {
      this.editMessage(this.state.editingMessageId, this.state.message);
    } else {
      this.sendMessage();
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    this.setState(prevState => ({
      selectedFiles: [...prevState.selectedFiles, ...files]
    }));
  };

  handleRemoveFile = (index) => {
    this.setState(prevState => ({
      selectedFiles: prevState.selectedFiles.filter((_, i) => i !== index)
    }));
  };

  getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  getUserStatus = (userId) => {
    return this.state.onlineUsers.has(userId) ? "online" : "offline";
  };

  getStatusColor = (status) => {
    switch (status) {
      case "online": return "#10b981";
      case "away": return "#f59e0b";
      case "busy": return "#ef4444";
      default: return "#6b7280";
    }
  };

  formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMins = Math.floor((now - date) / (1000 * 60));
      return diffInMins < 1 ? "Just now" : `${diffInMins}m ago`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  getFilteredChats = () => {
    const allChats = [
      ...this.state.friends,
      ...this.state.groups
    ];

    return allChats.filter(chat => {
      const name = chat.name || `${chat.firstName} ${chat.lastName}`;
      const matchesSearch = name.toLowerCase().includes(this.state.searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      switch (this.state.chatFilter) {
        case "direct":
          return chat.type === 'direct';
        case "groups":
          return chat.type === 'group';
        default:
          return true;
      }
    });
  };

  renderTypingIndicator = () => {
    const typingSet = this.state.typingUsers.get(this.state.roomId);
    if (!typingSet || typingSet.size === 0) return null;

    const typingUserIds = Array.from(typingSet).filter(id => id !== this.state.currentUser.id);
    if (typingUserIds.length === 0) return null;

    const typingNames = typingUserIds.map(id => {
      const user = this.state.usersCollection.find(u => u.id === id);
      return user ? user.firstName : "Someone";
    });

    const text = typingNames.length === 1 
      ? `${typingNames[0]} is typing...`
      : `${typingNames.join(", ")} are typing...`;

    return (
      <Typography 
        variant="caption" 
        sx={{ 
          px: 3, 
          py: 1, 
          color: "#6b7280",
          fontStyle: "italic",
          display: "flex",
          alignItems: "center",
          gap: 1
        }}
      >
        {text}
        <span className="typing-dots">
          <span>.</span><span>.</span><span>.</span>
        </span>
      </Typography>
    );
  };

  render() {
    const {
      currentUser,
      oldMessages,
      activeChat,
      pendingRequests,
      searchQuery,
      chatFilter,
      isLoadingMessages,
      isSendingMessage,
      editingMessageId,
      replyToMessage,
      selectedFiles,
    } = this.state;

    const filteredChats = this.getFilteredChats();

    return (
      <Box
        sx={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fb" }}
      >
        {/* Sidebar */}
        <SidebarNav
          currentUser={currentUser}
          pendingRequestsCount={pendingRequests.length}
          onOpenFriendRequests={() =>
            this.setState({ openFriendRequests: true })
          }
          onLogout={logout}
        />

        {/* Chat List Panel */}
        <Box
          sx={{
            width: 320,
            backgroundColor: "white",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search and Header */}
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Chat
              </Typography>
              <Box>
                <Tooltip title="Add Friend">
                  <IconButton
                    size="small"
                    onClick={() => this.setState({ openAddFriend: true })}
                  >
                    <IoPersonAdd />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Create Group">
                  <IconButton
                    size="small"
                    onClick={() => this.setState({ openCreateGroup: true })}
                  >
                    <IoPeople />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Paper
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                backgroundColor: "#f3f4f6",
                boxShadow: "none",
                borderRadius: 2,
              }}
            >
              <IoSearchCircle size={20} color="#6b7280" />
              <InputBase
                placeholder="Search chats..."
                fullWidth
                value={searchQuery}
                onChange={(e) => this.setState({ searchQuery: e.target.value })}
                sx={{ ml: 1, fontSize: 14 }}
              />
            </Paper>
          </Box>

          {/* Filter Tabs */}
          <Tabs
            value={chatFilter}
            onChange={(e, value) => this.setState({ chatFilter: value })}
            sx={{ 
              borderBottom: 1, 
              borderColor: "#e5e7eb",
              minHeight: 40,
              px: 2
            }}
          >
            <Tab label="All" value="all" sx={{ minHeight: 40, fontSize: 13 }} />
            <Tab label="Direct" value="direct" sx={{ minHeight: 40, fontSize: 13 }} />
            <Tab label="Groups" value="groups" sx={{ minHeight: 40, fontSize: 13 }} />
          </Tabs>

          {/* Chat List */}
          <List sx={{ flexGrow: 1, overflow: "auto", p: 0 }}>
            {filteredChats.map((chat) => {
              const isActive = activeChat?.id === chat.id;
              const name = chat.name || `${chat.firstName} ${chat.lastName}`;
              const isOnline = chat.type === 'direct' && this.getUserStatus(chat.id) === 'online';

              return (
                <ListItemButton
                  key={chat.id}
                  onClick={() => this.startChat(chat)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    backgroundColor: isActive ? "#f0f4ff" : "transparent",
                    borderLeft: isActive ? "3px solid #4f46e5" : "3px solid transparent",
                    "&:hover": { backgroundColor: "#f9fafb" },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: isOnline ? '#10b981' : '#d1d5db',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          border: '2px solid white',
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: chat.type === 'group' ? "#fbbf24" : "#6264a7",
                          width: 40,
                          height: 40
                        }}
                      >
                        {this.getInitials(name)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={name}
                    secondary={chat.type === 'group' ? `${chat.members?.length || 0} members` : chat.email}
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400, 
                      fontSize: 14,
                      noWrap: true
                    }}
                    secondaryTypographyProps={{ 
                      fontSize: 12,
                      noWrap: true
                    }}
                  />
                </ListItemButton>
              );
            })}
            
            {filteredChats.length === 0 && (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? "No chats found" : "No conversations yet"}
                </Typography>
              </Box>
            )}
          </List>
        </Box>

        {/* Main Chat Area */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: activeChat.type === 'group' ? "#fbbf24" : "#6264a7",
                      width: 40,
                      height: 40
                    }}
                  >
                    {this.getInitials(
                      activeChat.name ||
                        `${activeChat.firstName} ${activeChat.lastName}`
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 15 }}>
                      {activeChat.name ||
                        `${activeChat.firstName} ${activeChat.lastName}`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      {activeChat.type === 'group' 
                        ? `${activeChat.members?.length || 0} members`
                        : this.getUserStatus(activeChat.id)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Video Call">
                    <IconButton size="small">
                      <IoVideocam />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Audio Call">
                    <IconButton size="small">
                      <IoCall />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Chat Info">
                    <IconButton 
                      size="small"
                      onClick={() => this.setState({ openChatInfo: true })}
                    >
                      <IoInformationCircle />
                    </IconButton>
                  </Tooltip>
                  <IconButton 
                    size="small"
                    onClick={(e) => this.setState({ chatOptionsAnchor: e.currentTarget })}
                  >
                    <IoEllipsisVertical />
                  </IconButton>
                </Box>
              </Box>

              {/* Messages Area */}
              <Box 
                sx={{ 
                  flexGrow: 1, 
                  overflow: "auto", 
                  p: 3,
                  backgroundColor: "#fafafa"
                }}
              >
                {isLoadingMessages ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : (
                  <>
                    {oldMessages.map((msg, index) => {
                      const isSent = msg.from?.id === currentUser.id;
                      const showAvatar = !isSent && (
                        index === 0 || 
                        oldMessages[index - 1].from?.id !== msg.from?.id
                      );

                      return (
                        <Box
                          key={msg.id || index}
                          sx={{
                            mb: 2,
                            display: "flex",
                            flexDirection: isSent ? "row-reverse" : "row",
                            alignItems: "flex-start",
                            gap: 1,
                          }}
                        >
                          {!isSent && (
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32,
                                bgcolor: "#6264a7",
                                visibility: showAvatar ? "visible" : "hidden"
                              }}
                            >
                              {msg.from?.firstName?.[0]}
                            </Avatar>
                          )}

                          <Box sx={{ maxWidth: "60%", position: "relative" }}>
                            {!isSent && showAvatar && (
                              <Typography 
                                variant="caption" 
                                sx={{ ml: 1, color: "#6b7280", display: "block", mb: 0.5 }}
                              >
                                {msg.from?.firstName} {msg.from?.lastName}
                              </Typography>
                            )}
                            
                            <Paper
                              sx={{
                                px: 2,
                                py: 1.5,
                                backgroundColor: isSent ? "#4f46e5" : "#ffffff",
                                color: isSent ? "white" : "#111827",
                                borderRadius: isSent ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                position: "relative",
                                "&:hover .message-actions": {
                                  opacity: 1
                                }
                              }}
                            >
                              {msg.replyTo && (
                                <Box
                                  sx={{
                                    borderLeft: "3px solid",
                                    borderColor: isSent ? "rgba(255,255,255,0.3)" : "#e5e7eb",
                                    pl: 1,
                                    mb: 1,
                                    opacity: 0.7
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontSize: 11 }}>
                                    Reply to message
                                  </Typography>
                                </Box>
                              )}

                              <Typography variant="body2" sx={{ wordWrap: "break-word" }}>
                                {msg.text}
                              </Typography>
                              
                              {msg.files && msg.files.length > 0 && (
                                <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                  {msg.files.map((file, idx) => (
                                    <Chip
                                      key={idx}
                                      label={file.name}
                                      size="small"
                                      icon={file.type?.startsWith('image/') ? <IoImage /> : <IoDocument />}
                                      sx={{ height: 24 }}
                                    />
                                  ))}
                                </Box>
                              )}

                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: 10,
                                    opacity: 0.7
                                  }}
                                >
                                  {this.formatTimestamp(msg.timestamp || msg.createdAt)}
                                  {msg.edited && " (edited)"}
                                </Typography>
                                
                                {isSent && (
                                  <IoCheckmarkDone 
                                    size={14} 
                                    style={{ opacity: 0.7 }}
                                  />
                                )}
                              </Box>

                              <Box
                                className="message-actions"
                                sx={{
                                  position: "absolute",
                                  top: -10,
                                  right: isSent ? "auto" : -40,
                                  left: isSent ? -40 : "auto",
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => this.setState({
                                    messageMenuAnchor: e.currentTarget,
                                    selectedMessageForMenu: msg
                                  })}
                                  sx={{ 
                                    bgcolor: "white", 
                                    boxShadow: 1,
                                    width: 28,
                                    height: 28,
                                    "&:hover": { bgcolor: "#f3f4f6" }
                                  }}
                                >
                                  <IoEllipsisVertical size={16} />
                                </IconButton>
                              </Box>
                            </Paper>
                          </Box>
                        </Box>
                      );
                    })}
                    <div ref={this.messagesEndRef} />
                  </>
                )}
                
                {this.renderTypingIndicator()}
              </Box>

              {/* Message Input Area */}
              <Box sx={{ p: 2, backgroundColor: "white", borderTop: "1px solid #e5e7eb" }}>
                {/* Reply Preview */}
                {replyToMessage && (
                  <Box
                    sx={{
                      mb: 1,
                      p: 1.5,
                      backgroundColor: "#f3f4f6",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "#6b7280" }}>
                        Replying to {replyToMessage.from?.firstName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: 12 }} noWrap>
                        {replyToMessage.text}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => this.setState({ replyToMessage: null })}
                    >
                      <IoClose />
                    </IconButton>
                  </Box>
                )}

                {/* File Previews */}
                {selectedFiles.length > 0 && (
                  <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {selectedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => this.handleRemoveFile(index)}
                        icon={file.type.startsWith('image/') ? <IoImage /> : <IoDocument />}
                        size="small"
                      />
                    ))}
                  </Box>
                )}

                {/* Editing Indicator */}
                {editingMessageId && (
                  <Box sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <IoPencil size={14} color="#6b7280" />
                    <Typography variant="caption" sx={{ color: "#6b7280" }}>
                      Editing message
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => this.setState({ editingMessageId: null, message: "" })}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}

                {/* Input Form */}
                <Paper
                  component="form"
                  onSubmit={this.handleSubmit}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1,
                    backgroundColor: "#f9fafb",
                    boxShadow: "none",
                    borderRadius: 2,
                    border: "1px solid #e5e7eb"
                  }}
                >
                  <input
                    type="file"
                    ref={this.fileInputRef}
                    style={{ display: 'none' }}
                    onChange={this.handleFileSelect}
                    multiple
                  />
                  
                  <Tooltip title="Attach File">
                    <IconButton
                      size="small"
                      onClick={() => this.fileInputRef.current?.click()}
                    >
                      <IoAttach />
                    </IconButton>
                  </Tooltip>

                  <InputBase
                    placeholder={editingMessageId ? "Edit message..." : "Type a message..."}
                    fullWidth
                    name="message"
                    value={this.state.message}
                    onChange={this.handleMessageChange}
                    sx={{ mx: 1, fontSize: 14 }}
                    multiline
                    maxRows={4}
                  />

                  <Tooltip title="Emoji">
                    <IconButton
                      size="small"
                      onClick={() => this.setState(prev => ({ showEmojiPicker: !prev.showEmojiPicker }))}
                    >
                      <IoHappy />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={editingMessageId ? "Save" : "Send"}>
                    <IconButton
                      type="submit"
                      size="small"
                      disabled={isSendingMessage || (!this.state.message.trim() && selectedFiles.length === 0)}
                      sx={{ 
                        color: "#4f46e5",
                        ml: 1,
                        "&:disabled": { color: "#d1d5db" }
                      }}
                    >
                      {isSendingMessage ? <CircularProgress size={20} /> : <IoSend />}
                    </IconButton>
                  </Tooltip>
                </Paper>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280"
              }}
            >
              <IoChatbubbleEllipsesOutline size={64} style={{ opacity: 0.3, marginBottom: 16 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                Select a conversation
              </Typography>
              <Typography variant="body2">
                Choose a friend or group to start chatting
              </Typography>
            </Box>
          )}
        </Box>

        {/* Message Context Menu */}
        <Menu
          anchorEl={this.state.messageMenuAnchor}
          open={Boolean(this.state.messageMenuAnchor)}
          onClose={() => this.setState({ messageMenuAnchor: null, selectedMessageForMenu: null })}
        >
          <MenuItem
            onClick={() => {
              this.setState({ 
                replyToMessage: this.state.selectedMessageForMenu,
                messageMenuAnchor: null,
                selectedMessageForMenu: null
              });
            }}
          >
            <IoAdd style={{ marginRight: 8 }} /> Reply
          </MenuItem>
          
          {this.state.selectedMessageForMenu?.from?.id === currentUser.id && (
            <MenuItem
              onClick={() => {
                const msg = this.state.selectedMessageForMenu;
                this.setState({ 
                  editingMessageId: msg.id,
                  message: msg.text,
                  messageMenuAnchor: null,
                  selectedMessageForMenu: null
                });
              }}
            >
              <IoPencil style={{ marginRight: 8 }} /> Edit
            </MenuItem>
          )}
          
          {this.state.selectedMessageForMenu?.from?.id === currentUser.id && (
            <MenuItem
              onClick={() => {
                if (window.confirm("Delete this message?")) {
                  this.deleteMessage(this.state.selectedMessageForMenu.id);
                  this.setState({ messageMenuAnchor: null, selectedMessageForMenu: null });
                }
              }}
            >
              <IoTrash style={{ marginRight: 8 }} /> Delete
            </MenuItem>
          )}
          
          <MenuItem
            onClick={() => {
              // Implement pin functionality
              this.setState({ messageMenuAnchor: null, selectedMessageForMenu: null });
            }}
          >
            <IoPushOutline style={{ marginRight: 8 }} /> Pin
          </MenuItem>
        </Menu>

        {/* Chat Options Menu */}
        <Menu
          anchorEl={this.state.chatOptionsAnchor}
          open={Boolean(this.state.chatOptionsAnchor)}
          onClose={() => this.setState({ chatOptionsAnchor: null })}
        >
          <MenuItem onClick={() => this.setState({ openChatInfo: true, chatOptionsAnchor: null })}>
            <IoInformationCircle style={{ marginRight: 8 }} /> Chat Info
          </MenuItem>
          <MenuItem onClick={() => this.setState({ chatOptionsAnchor: null })}>
            <IoArchive style={{ marginRight: 8 }} /> Archive Chat
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => this.setState({ chatOptionsAnchor: null })} sx={{ color: "#ef4444" }}>
            <IoTrash style={{ marginRight: 8 }} /> Delete Chat
          </MenuItem>
        </Menu>

        {/* Add Friend Dialog */}
        <Dialog
          open={this.state.openAddFriend}
          onClose={() => this.setState({ openAddFriend: false, friendEmail: "" })}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Add Friend</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Friend's Email"
              type="email"
              fullWidth
              variant="outlined"
              name="friendEmail"
              value={this.state.friendEmail}
              onChange={this.handleChange}
              placeholder="Enter email address"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openAddFriend: false, friendEmail: "" })}>
              Cancel
            </Button>
            <Button onClick={this.addFriend} variant="contained" disabled={!this.state.friendEmail.trim()}>
              Send Request
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Group Dialog */}
        <Dialog
          open={this.state.openCreateGroup}
          onClose={() => this.setState({ openCreateGroup: false, groupName: "", groupDescription: "", selectedMembers: [] })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create Group</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Group Name"
              fullWidth
              variant="outlined"
              name="groupName"
              value={this.state.groupName}
              onChange={this.handleChange}
              placeholder="Enter group name"
            />
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              name="groupDescription"
              value={this.state.groupDescription}
              onChange={this.handleChange}
              placeholder="What's this group about?"
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
              Select Members:
            </Typography>
            <Box sx={{ maxHeight: 200, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 1, p: 1 }}>
              {this.state.friends.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No friends available. Add friends first!
                </Typography>
              ) : (
                this.state.friends.map((friend) => (
                  <FormControlLabel
                    key={friend.id}
                    control={
                      <Checkbox
                        checked={this.state.selectedMembers.includes(friend.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            this.setState({
                              selectedMembers: [
                                ...this.state.selectedMembers,
                                friend.id,
                              ],
                            });
                          } else {
                            this.setState({
                              selectedMembers: this.state.selectedMembers.filter(
                                (id) => id !== friend.id
                              ),
                            });
                          }
                        }}
                      />
                    }
                    label={`${friend.firstName} ${friend.lastName}`}
                    sx={{ display: "flex", mb: 0.5 }}
                  />
                ))
              )}
            </Box>
            {this.state.selectedMembers.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {this.state.selectedMembers.length} member(s) selected
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openCreateGroup: false, groupName: "", groupDescription: "", selectedMembers: [] })}>
              Cancel
            </Button>
            <Button 
              onClick={this.createGroup} 
              variant="contained"
              disabled={!this.state.groupName.trim()}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Friend Requests Dialog */}
        <Dialog
          open={this.state.openFriendRequests}
          onClose={() => this.setState({ openFriendRequests: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            Friend Requests
            {pendingRequests.length > 0 && (
              <Chip 
                label={pendingRequests.length} 
                size="small" 
                sx={{ ml: 1 }} 
                color="primary"
              />
            )}
          </DialogTitle>

          <DialogContent dividers sx={{ maxHeight: 400, overflowY: "auto" }}>
            {pendingRequests.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <IoNotifications size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                <Typography color="text.secondary">
                  No pending requests
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {pendingRequests.map((requestId) => {
                  const user = this.state.usersCollection.find(
                    (u) => u.id === requestId
                  );
                  if (!user) return null;

                  return (
                    <ListItem
                      key={requestId}
                      sx={{
                        py: 2,
                        borderBottom: "1px solid #f3f4f6",
                        "&:last-child": { borderBottom: "none" }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "#6264a7", width: 48, height: 48 }}>
                          {this.getInitials(
                            `${user.firstName} ${user.lastName}`
                          )}
                        </Avatar>
                      </ListItemAvatar>

                      <ListItemText
                        primary={`${user.firstName} ${user.lastName}`}
                        secondary={user.email}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<IoCheckmark />}
                          onClick={() => this.acceptRequest(requestId)}
                        >
                          Accept
                        </Button>

                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<IoClose />}
                          onClick={() => this.declineRequest(requestId)}
                        >
                          Decline
                        </Button>
                      </Box>
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => this.setState({ openFriendRequests: false })}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Chat Info Dialog */}
        <Dialog
          open={this.state.openChatInfo}
          onClose={() => this.setState({ openChatInfo: false })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {activeChat?.type === 'group' ? 'Group Info' : 'Contact Info'}
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: activeChat?.type === 'group' ? "#fbbf24" : "#6264a7",
                  mb: 2
                }}
              >
                {this.getInitials(
                  activeChat?.name ||
                    `${activeChat?.firstName} ${activeChat?.lastName}`
                )}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {activeChat?.name ||
                  `${activeChat?.firstName} ${activeChat?.lastName}`}
              </Typography>
              {activeChat?.type === 'direct' && (
                <Typography variant="body2" color="text.secondary">
                  {activeChat?.email}
                </Typography>
              )}
            </Box>

            {activeChat?.type === 'group' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Members ({activeChat.members?.length || 0})
                </Typography>
                <List dense>
                  {(activeChat.members || []).slice(0, 5).map((memberId) => {
                    const member = this.state.usersCollection.find(u => u.id === memberId);
                    if (!member) return null;
                    return (
                      <ListItem key={memberId}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#6264a7" }}>
                            {member.firstName[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${member.firstName} ${member.lastName}`}
                          secondary={member.email}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openChatInfo: false })}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        <style>{`
          .typing-dots span {
            animation: typing 1.4s infinite;
            opacity: 0;
          }
          .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
          }
          .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
          }
          @keyframes typing {
            0%, 60%, 100% {
              opacity: 0;
            }
            30% {
              opacity: 1;
            }
          }
        `}</style>
      </Box>
    );
  }
}