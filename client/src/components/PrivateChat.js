import React, { Component } from "react";
import axios from "axios";
import queryString from "query-string";
import "whatwg-fetch";
import NavBar from "./NavBar";
import { MdSearch } from "react-icons/md";
import { io } from "socket.io-client";
import InputEmoji from "react-input-emoji";
import {
  Box,
  Avatar,
  Typography,
  ListItemAvatar,
  List,
  InputAdornment,
  Input,
  TextField,
  Button
} from "@mui/material";
import TimeAgo from "react-timeago";
import { TiContacts } from "react-icons/ti";
export default class PrivateChat extends Component {
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
      messageNotification: [],
      viewAccount: false
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.startChat = this.startChat.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.getOldChat = this.getOldChat.bind(this);
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

  async getOldChat(roomId) {
    await axios
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
  handleChange(e) {
    this.setState({
      message: e,
    });
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
    console.log(friend.roomId);

  }
  componentDidMount() {
    this.getUserData();
    this.socket = io.connect("ws://localhost:8900");

    this.socket.on("getMessage", (data) => {
      this.getOldChat(data.roomId);
    });
    this.socket.on("notification", (data) => {
      console.log("notification", data);
      if (data.to._id === this.state.currentUser._id) {
        let notification = this.state.messageNotification;
        notification.push(data);
        this.setState({
          messageNotification: notification,
        });
      }
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
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignContent: "center",

        }}
      >

        <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>

          <List
            sx={{
              width: "3 0vw",
              height: "100vh",
              backgroundColor: "#1F1D1D",
            }}
          >

            <NavBar currentUser={this.state.currentUser} />
            <Box display={"inline-flex"} width={"100%"}>
              <TextField
                id="input-with-icon-textfield"
                variant="filled"
                sx={{
                  width: "100%",
                  background: "#312F2F",
                  borderRadius: "5%",
                  padding: 0,
                  "& label": {
                    transition: "none", // Remove label animation
                    color: "grey", // Label text color
                  },
                  "& .MuiInputBase-root": {
                    transition: "none", // Remove input transition
                    color: "grey", // Input text color
                  },
                  "& .MuiInputBase-input": {
                    color: "grey", // Ensures the actual text inside the input is grey
                  },
                  "& .MuiInputBase-root::before, & .MuiInputBase-root::after": {
                    transition: "none !important", // Remove underline animation
                    display: "none", // Hide focus underline
                  },
                  "& .MuiInputAdornment-root": {
                    transition: "none", // Remove icon transition
                  },
                  "& .MuiFilledInput-root": {
                    backgroundColor: "#312F2F",
                  },
                  "& .MuiFilledInput-root:focus, & .MuiFilledInput-root.Mui-focused": {
                    backgroundColor: "#312F2F", // Keep background color on focus
                    boxShadow: "none", // Remove any glow effect
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdSearch size={"1.5em"} color="grey" /> {/* Change icon color to grey */}
                    </InputAdornment>
                  ),
                }}
              />
              {/* <TiContacts
              size={"2em"}
                onClick={() => { 

                  
                  const queryParams = new URLSearchParams(
                    `?id=${this.state.currentUser._id}`
                  );
                  window.location = `/Contacts?${queryParams}`;
                }}
              /> */}
            </Box>
            {this.state.currentUser.userFriend?.map((friend, index) => {
              var user = this.getUser(friend.friendId);
              return (
                <Box
                  key={index}
                  width="full"
                  sx={{
                    display: "inline-flex",
                    padding: "10px",
                    width: "100%",
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
                      alt={user.firstName.toUpperCase()}
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
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "20px",
                          overflow: "visible",
                          color: "white",
                          flexGrow: 0.75,
                        }}
                        noWrap
                      >
                        {user.firstName + " " + user.lastName}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "15px",
                          color: "lightgray",

                          textAlign: "right",
                        }}
                        noWrap
                      >
                        time
                      </Typography>
                    </Box>
                    {/* <Typography
                      sx={{ fontSize: "15px", color: "lightgray" }}
                      noWrap
                    >
                      {this.state.messageHistory[1]}
                    </Typography> */}
                  </Box>
                </Box>
              );
            })}
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
                        <Typography key={index}>
                          {messages.text}

                        </Typography>
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
                          key={index}
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

                  
                </Box>
              </Box>


            </Box>


          )}
        </Box>
      </Box>
    );
  }
}
