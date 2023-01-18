import React, { Component } from "react";
import axios from "axios";
import queryString from "query-string";
import "whatwg-fetch";
import { MdSearch} from "react-icons/md";
import { io } from "socket.io-client";
import PersonAddIcon from "@mui/icons-material/Person";
import PersonRemoveIcon from "@mui/icons-material/Person";
import {BsChatLeftTextFill} from "react-icons/bs";
import InputEmoji from "react-input-emoji";

import {
  Box,
  Avatar,
  Typography,
  Button,
  Modal,
  TextField,
  ListItemAvatar,
  List,
  InputAdornment,
  Input,
  ListItem,
  ListItemText,
} from "@mui/material";

import { v4 as uuidv4 } from "uuid";
import TimeAgo from "react-timeago";
import NavBar from "./NavBar";
export default class Contacts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      messageHistory: [],
      roomId: "",
      targetUser: {},
      usersCollection: [],
      requestedFriend: "",
      currentUser: {},
      openMenu: false,
      openAddFriend: false,
      openRemoveFriend: false,
      openAccountSetting: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.startChat = this.startChat.bind(this);
    this.getOldChat = this.getOldChat.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);



  }

  async getUserData() {
    const queryParams = queryString.parse(window.location.search);

    await axios
      .get("http://localhost:5000/user")
      .then((res) => {
        this.setState({
          usersCollection: res.data,
          currentUser: res.data.filter((user) => {
            return user._id === queryParams.id;
          })[0],
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  getUser(id) {
    return this.state.usersCollection.filter((user) => {
      return user._id === id;
    })[0];
  }
  async updateUser(userObject) {
    await axios
      .post(`http://localhost:5000/user/update/${userObject._id}`, userObject)
      .then((res) => console.log(res.data));
  }
  addFriend() {
    var isAlreadyFriend = false;
    var isInSystem = false;
    var targetUser = {};

    //user is in the system check
    targetUser = this.state.usersCollection.filter((userFriend) => {
      console.log("user friend found");
      isInSystem = true;

      return userFriend.email === this.state.requestedFriend;
    })[0];

    // already a friend validation
    this.state.currentUser.userFriend.filter((currentUserFriend) => {
      if (currentUserFriend.email === this.state.requestedFriend) {
        console.log("user is already a friend");
        isAlreadyFriend = true;
      }
      return currentUserFriend.email === this.state.requestedFriend;
    });
    if (!isAlreadyFriend && isInSystem) {
      targetUser.pendingRequest.push(this.state.currentUser._id);
      this.updateUser(targetUser);

      console.log("done");
    }
  }
  removeFriend() {
    var isAlreadyFriend = false;

    this.state.currentUser.userFriend.filter((currentUserFriend) => {
      if (currentUserFriend.email === this.state.requestedFriend) {
        console.log("user is a friend");
        isAlreadyFriend = true;
      }
      return currentUserFriend.email === this.state.requestedFriend;
    });

    if (isAlreadyFriend) {
      this.updateUser(this.state.currentUser);

      console.log("done");
    }
  }
  acceptRequest(e, friendId) {
    var targetUser = this.getUser(friendId);
    var host = this.state.currentUser;

    var newPendingFriends = host.pendingRequest.filter(
      (currentPendingFriend) => {
        return currentPendingFriend !== friendId;
      }
    );
    var roomId = uuidv4();
    host.userFriend.push({
      friendId: targetUser._id,
      roomId: roomId,
    });
    host.pendingRequest = newPendingFriends;
    this.setState({
      currentUser: host,
    });
    this.updateUser(host);
    targetUser.userFriend.push({
      friendId: this.state.currentUser._id,
      roomId: roomId,
    });
    this.updateUser(targetUser);
    var data={_id:roomId,chatHistory:[]};
    axios
      .post("http://localhost:5000/message/new", data)
      .then((res) => console.log(res.data));
    console.log("message added");
  }
  declineRequest(e, friendId) {
    e.preventDefault();

    var newPendingFriends = this.state.currentUser.pendingRequest.filter(
      (currentPendingFriend) => {
        return currentPendingFriend._id !== friendId;
      }
    )[0];

    this.setState((prevState) => ({
      currentUser: {
        ...prevState.currentUser,
        pendingRequest: newPendingFriends,
      },
    }));
    this.updateUser(this.state.currentUser);
  }
  handleChange(e) {
    this.setState({
      message: e,
    });
  }
  async startChat(friendUser, friend) {
    this.socket.emit("joinRoom", {
      senderUser: this.state.currentUser,
      recieverUser: friendUser,
      roomId: friend.roomId,
    });
    this.setState({
      roomId: friend.roomId,
    });
    this.getOldChat(friend.roomId);
    console.log("room joined!!!");
  }
  componentDidMount() {
    this.getUserData();
    this.socket = io.connect("ws://localhost:8900");

    this.socket.on("getMessage", (data) => {
      this.getOldChat(data.roomId);
    });
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentUser._id !== prevState.currentUser._id) {
      this.getUserData();
      console.log("usercollection", this.state.usersCollection);
      console.log("current user", this.state.currentUser);
    }
     if (this.state.roomId) {
      this.getOldChat(this.state.roomId);
    }
  }
  async getOldChat(roomId) {
    return await axios
      .get(`http://localhost:5000/message/${roomId}`)
      .then((res) => {
        this.setState({
          messageHistory: res.data[0].messageHistory,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  async addMessage(data) {
    await axios
      .post(`http://localhost:5000/message/update/${this.state.roomId}`, data)
      .then((res) => console.log(res.data));
    console.log("message added");
  }
  handleSubmit(e) {
    this.socket.emit("sendMessage", {
      text: this.state.message,
      from: this.state.currentUser,
      to: this.state.targetUser,
      roomId: this.state.roomId,
    });
    var history = this.state.messageHistory;
    history.push({
      text: this.state.message,
      from: this.state.currentUser,
      to: this.state.targetUser,
      date: new Date(),
    });
    this.setState({
      messageHistory: history,
    });
    console.log(this.state.messageHistory);
    this.addMessage(this.state.messageHistory);
  }
  render() {
    var styleToMe = {
      backgroundColor: "#e5e5ea",
      borderRadius: "1.15rem",
      lineHeight: "1.25",
      width: "fit-content",
      padding: "0.5rem .875rem",
      wordWrap: "break-word",
      color: "#000",
      float: "left",
    };
    var styleFromMe = {
      backgroundColor: "#248bf5",
      borderRadius: "1.15rem",
      lineHeight: "1.25",
      width: "fit-content",
      padding: "0.5rem .875rem",
      wordWrap: "break-word",
      color: "#fff",
      float: "right",
    };
    return (
      <Box
        sx={{
          display: "inline-flex",
          width: "100%",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <NavBar currentUser={this.state.currentUser} />
        <Box sx={{ display: "inline-flex", width: "100%" }}>
          <List
            sx={{
              width: "322px",
              height: "100vh",
              backgroundColor: "rgb(48,56,65)",
            }}
          >
            <Typography color="white">Contacts</Typography>
            <Box>
              <Input
                startAdornment={
                  <InputAdornment position="start">
                    <MdSearch />
                  </InputAdornment>
                }
              />
              <Button
                onClick={() => {
                  this.setState({ openAddFriend: true });
                }}
              >
                Add Friend
              </Button>
              <Modal
                open={this.state.openAddFriend}
                onClose={() => {
                  this.setState({ openAddFriend: false });
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 400,
                    bgcolor: "background.paper",
                    border: "2px solid #000",
                    boxShadow: 24,
                    p: 4,
                  }}
                >
                  <Typography
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                  >
                    Search for a friend
                  </Typography>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    placeholder="Enter Your Friends Email"
                    label="Email Address"
                    name="requestedFriend"
                    autoComplete="email"
                    autoFocus
                    onChange={this.handleChange}
                  />
                  <Button onClick={this.addFriend}>Hello</Button>
                </Box>
              </Modal>
            </Box>

            {this.state.currentUser.pendingRequest?.map((id) => {
              var user = this.getUser(id);
              return (
                <ListItem>
                  <ListItemAvatar>
                    <Avatar
                      alt="Remy Sharp"
                      src="/static/images/avatar/1.jpg"
                      sx={{ height: 46, width: 46 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                  />
                  <Box
                    sx={{
                      display: "inline-flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Button
                      edge="end"
                      aria-label="add"
                      variant="contained"
                      onClick={(e) => this.acceptRequest(e, user._id)}
                    >
                      <PersonAddIcon />
                    </Button>
                    <Button
                      edge="end"
                      aria-label="add"
                      variant="contained"
                      onClick={(e) => this.declineRequest(e, user._id)}
                    >
                      <PersonRemoveIcon />
                    </Button>
                  </Box>
                </ListItem>
              );
            })}
            <Box sx={{display:"flex",flexDirection:"column"
      }}>
            {this.state.currentUser.userFriend?.map((friend, index) => {
              var user = this.getUser(friend.friendId);

              return (
                <Box
                  key={index}
                  width="full"
                  sx={{
                    display: "inline-flex",
                    padding: "10px",
                  }}
                  onClick={(e) => {
                    this.startChat(user, friend);
                    this.setState({
                      targetUser: user,
                    });
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt="Remy Sharp"
                      src="/static/images/avatar/1.jpg"
                      sx={{ height: 46, width: 46 }}
                    />
                  </ListItemAvatar>
                  <Box
                    sx={{
                      display: "inline-flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "20px",
                          overflow: "visible",
                          color: "lightgray",
                        }}
                        noWrap
                      >
                        {user.firstName + " " + user.lastName}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontSize: "15px", color: "lightgray" }}
                      noWrap
                    >
                      {user.email}
                    </Typography>
                  </Box>
                  <BsChatLeftTextFill size={"1.5em"}/>
                </Box>
              );
            })}
            </Box>
          </List>
          {this.state.roomId === "" ? (
            <h1>Select friend to chat with</h1>
          ) : (
            <Box
              width={"100%"}
              maxHeight={"80vh"}
              margin={0}
              sx={{
                overflow: "hidden",
              }}
            >
              <Box
                width={"100%"}
                height={"100%"}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                }}
              >
                {this.state.messageHistory.map((messages, index) => {
                  return (
                    <Box
                      sx={{
                        padding: "10px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems:
                          messages.from._id === this.state.currentUser._id
                            ? "flex-end"
                            : "flex-start",
                      }}
                      key={index}
                    >
                      <Box
                        sx={
                          messages.from._id === this.state.currentUser._id
                            ? styleFromMe
                            : styleToMe
                        }
                      >
                        <Typography>{messages.text}</Typography>
                      </Box>
                      <Box
                        sx={{
                          float: "inherit",
                        }}
                      >
                        <Typography
                          width={"inherit"}
                          fontSize={"12px"}
                          color="gray"
                        >
                          <TimeAgo date={messages.date} />
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <InputEmoji
                    name="message"
                    cleanOnEnter
                    onEnter={this.handleSubmit}   
                    onChange={(e) => this.handleChange(e)}
                    placeholder="Type a message"
                  />

                  {/* <TextField
                    id="outlined"
                    label="Send Message"
                    name="message"
                    onChange={this.handleChange}
                    sx={{ width: "100%" }}
                  />
                  <Button onClick={this.handleSubmit}>Send</Button> */}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  }
}
