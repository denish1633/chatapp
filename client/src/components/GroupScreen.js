import React, { Component } from "react";
import axios from "./axiosConfig";
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
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
  Divider,
  Chip,
  ListItemButton,
  AvatarGroup,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  IoEllipsisVertical,
  IoSend,
  IoPersonAdd,
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
  IoInformationCircle,
  IoExitOutline,
  IoPersonRemove,
  IoShieldCheckmark,
  IoChatbubbleEllipsesOutline,
  IoSearchCircle,
  IoNotifications,
  IoAdd,
} from "react-icons/io5";
import { v4 as uuidv4 } from "uuid";
import { getToken, getUser, isAuthenticated, logout } from "./authUtils";

export default class GroupChatScreen extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      usersCollection: [],
      groupMessages: [],
      currentUser: {},
      currentGroup: null,
      searchQuery: "",
      
      // Group members and admin info
      groupMembers: [],
      groupAdmins: [],
      onlineMembers: new Set(),
      typingMembers: new Map(), // userId -> userName
      
      // Enhanced features
      editingMessageId: null,
      replyToMessage: null,
      selectedFiles: [],
      mentionedUser: null,
      showEmojiPicker: false,
      
      // Dialog states
      openGroupInfo: false,
      openAddMembers: false,
      openManageMembers: false,
      openLeaveGroup: false,
      openEditGroup: false,
      
      // Form states
      groupName: "",
      groupDescription: "",
      selectedNewMembers: [],
      
      // Menu states
      messageMenuAnchor: null,
      selectedMessageForMenu: null,
      groupOptionsAnchor: null,
      memberMenuAnchor: null,
      selectedMemberForMenu: null,
      
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
    await this.loadGroup();
    this.connectWebSocket();
  }

  componentWillUnmount() {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.groupMessages.length !== this.state.groupMessages.length) {
      this.scrollToBottom();
    }
  }

  scrollToBottom = () => {
    this.messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  connectWebSocket() {
    const socket = new SockJS("http://localhost:5001/ws");
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      (frame) => {
        console.log("Connected to WebSocket:", frame);

        if (this.state.currentGroup?.roomId) {
          this.subscribeToGroup(this.state.currentGroup.roomId);
        }

        // Subscribe to typing indicators
        this.stompClient.subscribe("/topic/typing", (message) => {
          const typingData = JSON.parse(message.body);
          this.updateTypingIndicator(typingData);
        });

        // Subscribe to member presence
        this.stompClient.subscribe("/topic/presence", (message) => {
          const presenceData = JSON.parse(message.body);
          this.updateMemberPresence(presenceData);
        });
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        setTimeout(() => this.connectWebSocket(), 5000);
      }
    );
  }

  subscribeToGroup(roomId) {
    if (this.stompClient && this.stompClient.connected) {
      if (this.groupSubscription) {
        this.groupSubscription.unsubscribe();
      }

      this.groupSubscription = this.stompClient.subscribe(
        `/topic/room/${roomId}`,
        (message) => {
          const messageData = JSON.parse(message.body);
          this.handleIncomingMessage(messageData);
        }
      );

      // Notify joining
      this.stompClient.send("/app/joinRoom", {}, JSON.stringify(roomId));
    }
  }

  handleIncomingMessage(messageData) {
    if (messageData.type === "message") {
      this.loadGroupMessages();
    } else if (messageData.type === "messageDeleted") {
      this.setState(prevState => ({
        groupMessages: prevState.groupMessages.filter(m => m.id !== messageData.messageId)
      }));
    } else if (messageData.type === "messageEdited") {
      this.setState(prevState => ({
        groupMessages: prevState.groupMessages.map(m => 
          m.id === messageData.messageId ? { ...m, text: messageData.text, edited: true } : m
        )
      }));
    } else if (messageData.type === "memberAdded" || messageData.type === "memberRemoved") {
      this.loadGroupMembers();
    }
  }

  updateTypingIndicator(typingData) {
    const { roomId, userId, userName, isTyping } = typingData;
    
    if (roomId === this.state.currentGroup?.roomId && userId !== this.state.currentUser.id) {
      this.setState(prevState => {
        const typingMembers = new Map(prevState.typingMembers);
        
        if (isTyping) {
          typingMembers.set(userId, userName);
        } else {
          typingMembers.delete(userId);
        }
        
        return { typingMembers };
      });
    }
  }

  updateMemberPresence(presenceData) {
    this.setState(prevState => {
      const onlineMembers = new Set(prevState.onlineMembers);
      if (presenceData.status === "online") {
        onlineMembers.add(presenceData.userId);
      } else {
        onlineMembers.delete(presenceData.userId);
      }
      return { onlineMembers };
    });
  }

  sendTypingIndicator(isTyping) {
    if (this.stompClient && this.stompClient.connected && this.state.currentGroup) {
      this.stompClient.send("/app/typing", {}, JSON.stringify({
        roomId: this.state.currentGroup.roomId,
        userId: this.state.currentUser.id,
        userName: `${this.state.currentUser.firstName} ${this.state.currentUser.lastName}`,
        isTyping: isTyping
      }));
    }
  }

  async getUserData() {
    const token = getToken();
    try {
      const res = await axios.get("http://localhost:5001/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = res.data.find(user => user.id === getUser()?.id);
      
      this.setState({
        usersCollection: res.data,
        currentUser: currentUser || {},
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  }

  async loadGroup() {
    // Get group ID from URL or props
    const groupId = this.props.groupId || new URLSearchParams(window.location.search).get('groupId');
    
    if (!groupId) {
      console.error("No group ID provided");
      return;
    }

    const token = getToken();
    try {
      const res = await axios.get(`http://localhost:5001/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.setState({ currentGroup: res.data }, () => {
        this.loadGroupMembers();
        this.loadGroupMessages();
      });
    } catch (error) {
      console.error("Error loading group:", error);
    }
  }

  async loadGroupMembers() {
    if (!this.state.currentGroup?.id) return;

    const members = this.state.currentGroup.members || [];
    const memberDetails = members
      .map(memberId => this.state.usersCollection.find(u => u.id === memberId))
      .filter(Boolean);

    const admins = this.state.currentGroup.admins || [this.state.currentGroup.createdBy];

    this.setState({
      groupMembers: memberDetails,
      groupAdmins: admins,
    });
  }

  async loadGroupMessages() {
    if (!this.state.currentGroup?.roomId) return;

    this.setState({ isLoadingMessages: true });
    const token = getToken();
    
    try {
      const res = await axios.get(
        `http://localhost:5001/message/${this.state.currentGroup.roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      this.setState({ groupMessages: res.data });
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      this.setState({ isLoadingMessages: false });
    }
  }

  async sendMessage() {
    if (!this.state.message.trim() && this.state.selectedFiles.length === 0) return;
    if (!this.state.currentGroup?.roomId) return;

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
      roomId: this.state.currentGroup.roomId,
      groupId: this.state.currentGroup.id,
      timestamp: new Date().toISOString(),
      replyTo: this.state.replyToMessage?.id || null,
      mentionedUser: this.state.mentionedUser?.id || null,
      files: this.state.selectedFiles.map(f => ({ name: f.name, type: f.type })),
    };

    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send("/app/sendMessage", {}, JSON.stringify(messageData));
    }

    this.setState({ 
      message: "",
      replyToMessage: null,
      mentionedUser: null,
      selectedFiles: [],
      isSendingMessage: false
    });
    this.sendTypingIndicator(false);
  }

  async addMembers() {
    if (this.state.selectedNewMembers.length === 0) return;

    const token = getToken();
    try {
      await axios.post(
        `http://localhost:5001/group/${this.state.currentGroup.id}/members`,
        { memberIds: this.state.selectedNewMembers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Notify via WebSocket
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send("/app/memberAdded", {}, JSON.stringify({
          roomId: this.state.currentGroup.roomId,
          members: this.state.selectedNewMembers
        }));
      }

      await this.loadGroup();
      this.setState({ openAddMembers: false, selectedNewMembers: [] });
      alert("Members added successfully!");
    } catch (error) {
      console.error("Error adding members:", error);
      alert("Failed to add members");
    }
  }

  async removeMember(memberId) {
    const token = getToken();
    try {
      await axios.delete(
        `http://localhost:5001/group/${this.state.currentGroup.id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send("/app/memberRemoved", {}, JSON.stringify({
          roomId: this.state.currentGroup.roomId,
          memberId: memberId
        }));
      }

      await this.loadGroup();
      alert("Member removed successfully!");
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  }

  async makeAdmin(memberId) {
    const token = getToken();
    try {
      await axios.post(
        `http://localhost:5001/group/${this.state.currentGroup.id}/admins`,
        { userId: memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await this.loadGroup();
      alert("Member is now an admin!");
    } catch (error) {
      console.error("Error making admin:", error);
      alert("Failed to make admin");
    }
  }

  async leaveGroup() {
    const token = getToken();
    try {
      await axios.post(
        `http://localhost:5001/group/${this.state.currentGroup.id}/leave`,
        { userId: this.state.currentUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirect to chat home
      window.location = "/chat";
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave group");
    }
  }

  async editMessage(messageId, newText) {
    const token = getToken();
    try {
      await axios.put(
        `http://localhost:5001/message/${messageId}`,
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send("/app/editMessage", {}, JSON.stringify({
          messageId,
          text: newText,
          roomId: this.state.currentGroup.roomId
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
      await axios.delete(`http://localhost:5001/message/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send("/app/deleteMessage", {}, JSON.stringify({
          messageId,
          roomId: this.state.currentGroup.roomId
        }));
      }

      this.setState(prevState => ({
        groupMessages: prevState.groupMessages.filter(m => m.id !== messageId)
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

  handleMessageChange = (e) => {
    const value = e.target.value;
    this.setState({ message: value });

    // Check for mentions (@)
    const lastWord = value.split(' ').pop();
    if (lastWord.startsWith('@')) {
      // Show mention suggestions (implement autocomplete)
    }

    // Send typing indicator
    if (value.length > 0) {
      this.sendTypingIndicator(true);
      
      if (this.typingTimeout) {
        clearTimeout(this.typingTimeout);
      }
      
      this.typingTimeout = setTimeout(() => {
        this.sendTypingIndicator(false);
      }, 2000);
    } else {
      this.sendTypingIndicator(false);
    }
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
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  isAdmin = (userId) => {
    return this.state.groupAdmins.includes(userId);
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

  renderTypingIndicator = () => {
    if (this.state.typingMembers.size === 0) return null;

    const typingNames = Array.from(this.state.typingMembers.values());
    
    let text;
    if (typingNames.length === 1) {
      text = `${typingNames[0]} is typing...`;
    } else if (typingNames.length === 2) {
      text = `${typingNames[0]} and ${typingNames[1]} are typing...`;
    } else {
      text = `${typingNames[0]}, ${typingNames[1]} and ${typingNames.length - 2} others are typing...`;
    }

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
      currentGroup,
      groupMembers,
      groupMessages,
      groupAdmins,
      onlineMembers,
      isLoadingMessages,
      isSendingMessage,
      editingMessageId,
      replyToMessage,
      selectedFiles,
      searchQuery,
    } = this.state;

    if (!currentGroup) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
          <CircularProgress />
        </Box>
      );
    }

    const availableUsersToAdd = this.state.usersCollection.filter(
      user => !currentGroup.members?.includes(user.id) && user.id !== currentUser.id
    );

    return (
      <Box sx={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fb" }}>
        {/* Main Chat Area */}
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          {/* Group Header */}
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
                  bgcolor: "#fbbf24",
                  width: 48,
                  height: 48,
                  fontSize: 18,
                  fontWeight: 600
                }}
              >
                {this.getInitials(currentGroup.name)}
              </Avatar>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: 16 }}>
                    {currentGroup.name}
                  </Typography>
                  {this.isAdmin(currentUser.id) && (
                    <Chip 
                      label="Admin" 
                      size="small" 
                      color="primary"
                      sx={{ height: 20, fontSize: 11 }}
                    />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                  {groupMembers.length} members · {onlineMembers.size} online
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
              <Tooltip title="Group Info">
                <IconButton 
                  size="small"
                  onClick={() => this.setState({ openGroupInfo: true })}
                >
                  <IoInformationCircle />
                </IconButton>
              </Tooltip>
              <IconButton 
                size="small"
                onClick={(e) => this.setState({ groupOptionsAnchor: e.currentTarget })}
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
                {groupMessages.map((msg, index) => {
                  const isSent = msg.from?.id === currentUser.id;
                  const showAvatar = index === 0 || 
                    groupMessages[index - 1].from?.id !== msg.from?.id;
                  const sender = groupMembers.find(m => m.id === msg.from?.id);

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
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1, mb: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ color: "#6b7280", fontWeight: 600 }}
                            >
                              {msg.from?.firstName} {msg.from?.lastName}
                            </Typography>
                            {this.isAdmin(msg.from?.id) && (
                              <Chip 
                                label="Admin" 
                                size="small"
                                sx={{ height: 16, fontSize: 9, fontWeight: 600 }}
                                color="primary"
                              />
                            )}
                          </Box>
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
                                Replying to message
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
                            <Typography variant="caption" sx={{ fontSize: 10, opacity: 0.7 }}>
                              {this.formatTimestamp(msg.timestamp || msg.createdAt)}
                              {msg.edited && " (edited)"}
                            </Typography>
                            
                            {isSent && (
                              <IoCheckmarkDone size={14} style={{ opacity: 0.7 }} />
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
                placeholder={editingMessageId ? "Edit message..." : "Type a message... Use @ to mention"}
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
        </Box>

        {/* Group Info Sidebar */}
        {this.state.openGroupInfo && (
          <Box
            sx={{
              width: 350,
              backgroundColor: "white",
              borderLeft: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
              overflow: "auto",
            }}
          >
            {/* Close Button */}
            <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Group Info
              </Typography>
              <IconButton size="small" onClick={() => this.setState({ openGroupInfo: false })}>
                <IoClose />
              </IconButton>
            </Box>

            {/* Group Details */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#fbbf24",
                    fontSize: 28,
                    fontWeight: 600,
                    margin: "0 auto",
                    mb: 2
                  }}
                >
                  {this.getInitials(currentGroup.name)}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {currentGroup.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {currentGroup.description || "No description"}
                </Typography>
                
                {this.isAdmin(currentUser.id) && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<IoPencil />}
                    onClick={() => this.setState({ openEditGroup: true })}
                  >
                    Edit Group
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Members Section */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Members ({groupMembers.length})
                  </Typography>
                  {this.isAdmin(currentUser.id) && (
                    <Button
                      size="small"
                      startIcon={<IoPersonAdd />}
                      onClick={() => this.setState({ openAddMembers: true })}
                    >
                      Add
                    </Button>
                  )}
                </Box>

                <List dense sx={{ p: 0 }}>
                  {groupMembers.map((member) => {
                    const isOnline = onlineMembers.has(member.id);
                    const isMemberAdmin = this.isAdmin(member.id);
                    
                    return (
                      <ListItem
                        key={member.id}
                        secondaryAction={
                          this.isAdmin(currentUser.id) && member.id !== currentUser.id && (
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={(e) => this.setState({
                                memberMenuAnchor: e.currentTarget,
                                selectedMemberForMenu: member
                              })}
                            >
                              <IoEllipsisVertical />
                            </IconButton>
                          )
                        }
                        sx={{ px: 0, py: 1 }}
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
                            <Avatar sx={{ width: 36, height: 36, bgcolor: "#6264a7" }}>
                              {member.firstName[0]}
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {member.firstName} {member.lastName}
                              </Typography>
                              {isMemberAdmin && (
                                <Chip 
                                  label="Admin" 
                                  size="small" 
                                  color="primary"
                                  sx={{ height: 18, fontSize: 10 }}
                                />
                              )}
                              {member.id === currentUser.id && (
                                <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                  (You)
                                </Typography>
                              )}
                            </Box>
                          }
                          secondary={member.email}
                          secondaryTypographyProps={{ fontSize: 11 }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Group Actions */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<IoExitOutline />}
                  onClick={() => this.setState({ openLeaveGroup: true })}
                  fullWidth
                >
                  Leave Group
                </Button>
              </Box>
            </Box>
          </Box>
        )}

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
            <IoChatbubbleEllipsesOutline style={{ marginRight: 8 }} /> Reply
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
          
          {(this.state.selectedMessageForMenu?.from?.id === currentUser.id || this.isAdmin(currentUser.id)) && (
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
              this.setState({ messageMenuAnchor: null, selectedMessageForMenu: null });
            }}
          >
            <IoPushOutline style={{ marginRight: 8 }} /> Pin
          </MenuItem>
        </Menu>

        {/* Group Options Menu */}
        <Menu
          anchorEl={this.state.groupOptionsAnchor}
          open={Boolean(this.state.groupOptionsAnchor)}
          onClose={() => this.setState({ groupOptionsAnchor: null })}
        >
          <MenuItem onClick={() => this.setState({ openGroupInfo: true, groupOptionsAnchor: null })}>
            <IoInformationCircle style={{ marginRight: 8 }} /> Group Info
          </MenuItem>
          {this.isAdmin(currentUser.id) && (
            <MenuItem onClick={() => this.setState({ openAddMembers: true, groupOptionsAnchor: null })}>
              <IoPersonAdd style={{ marginRight: 8 }} /> Add Members
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={() => this.setState({ openLeaveGroup: true, groupOptionsAnchor: null })} sx={{ color: "#ef4444" }}>
            <IoExitOutline style={{ marginRight: 8 }} /> Leave Group
          </MenuItem>
        </Menu>

        {/* Member Options Menu */}
        <Menu
          anchorEl={this.state.memberMenuAnchor}
          open={Boolean(this.state.memberMenuAnchor)}
          onClose={() => this.setState({ memberMenuAnchor: null, selectedMemberForMenu: null })}
        >
          {!this.isAdmin(this.state.selectedMemberForMenu?.id) && (
            <MenuItem
              onClick={() => {
                this.makeAdmin(this.state.selectedMemberForMenu.id);
                this.setState({ memberMenuAnchor: null, selectedMemberForMenu: null });
              }}
            >
              <IoShieldCheckmark style={{ marginRight: 8 }} /> Make Admin
            </MenuItem>
          )}
          <MenuItem
            onClick={() => {
              if (window.confirm(`Remove ${this.state.selectedMemberForMenu?.firstName} from group?`)) {
                this.removeMember(this.state.selectedMemberForMenu.id);
                this.setState({ memberMenuAnchor: null, selectedMemberForMenu: null });
              }
            }}
            sx={{ color: "#ef4444" }}
          >
            <IoPersonRemove style={{ marginRight: 8 }} /> Remove from Group
          </MenuItem>
        </Menu>

        {/* Add Members Dialog */}
        <Dialog
          open={this.state.openAddMembers}
          onClose={() => this.setState({ openAddMembers: false, selectedNewMembers: [] })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Members to {currentGroup.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ maxHeight: 300, overflow: "auto", mt: 1 }}>
              {availableUsersToAdd.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  All users are already members of this group
                </Typography>
              ) : (
                availableUsersToAdd.map((user) => (
                  <FormControlLabel
                    key={user.id}
                    control={
                      <Checkbox
                        checked={this.state.selectedNewMembers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            this.setState(prev => ({
                              selectedNewMembers: [...prev.selectedNewMembers, user.id]
                            }));
                          } else {
                            this.setState(prev => ({
                              selectedNewMembers: prev.selectedNewMembers.filter(id => id !== user.id)
                            }));
                          }
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2">{user.firstName} {user.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    }
                    sx={{ display: "flex", mb: 1, width: "100%" }}
                  />
                ))
              )}
            </Box>
            {this.state.selectedNewMembers.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
                {this.state.selectedNewMembers.length} member(s) selected
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openAddMembers: false, selectedNewMembers: [] })}>
              Cancel
            </Button>
            <Button 
              onClick={this.addMembers.bind(this)} 
              variant="contained"
              disabled={this.state.selectedNewMembers.length === 0}
            >
              Add Members
            </Button>
          </DialogActions>
        </Dialog>

        {/* Leave Group Confirmation */}
        <Dialog
          open={this.state.openLeaveGroup}
          onClose={() => this.setState({ openLeaveGroup: false })}
        >
          <DialogTitle>Leave Group?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to leave <strong>{currentGroup.name}</strong>? 
              You won't receive messages from this group anymore.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ openLeaveGroup: false })}>
              Cancel
            </Button>
            <Button onClick={this.leaveGroup.bind(this)} color="error" variant="contained">
              Leave Group
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