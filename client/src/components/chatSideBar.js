import React, { Component } from "react";
import axios from "axios";
import queryString from "query-string";
import "whatwg-fetch";
import { io } from "socket.io-client";
import FriendsList from "./friendsList";
import {
  Box,
  IconButton,
  Avatar,
  Modal,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Menu,
  Container,
  Tooltip,
  MenuItem,
  TextField,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import MenuIcon from "@mui/icons-material/Menu";
import FolderIcon from "@mui/icons-material/Folder";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
const pages = ["Add Friend", "Remove Friend"];
export default class chatSideBar extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      usersCollection: [],
      requestedFriend: "",
      currentUser: {},
      loading: false,
      openMenu: false,
      openAddFriend: false,
      openRemoveFriend: false,
      openAccountSetting: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.acceptRequest = this.acceptRequest.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.assignSocketId = this.assignSocketId.bind(this);
  }
  async getUserData() {
    const queryParams = queryString.parse(window.location.search);
    console.log(queryParams.email);

    axios
      .get("http://localhost:5000/user")
      .then((res) => {
        console.log(res.data);
        this.setState({
          usersCollection: res.data,
          currentUser: res.data.filter((user) => {
            if (user.email === queryParams.email) {
              return user;
            }
          })[0],
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(this.state.currentUser);
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleSubmit(e) {
    this.socket.emit("sendMessage", {
      user: this.state.currentUser,
      text: this.state.message,
    });
    console.log(this.socket.id);
  }
  async assignSocketId() {
    this.state.currentUser.socketId = this.socket.id;
    console.log(this.socket.id);
    if (this.socket.id) {
      axios
        .post(
          `http://localhost:5000/user/update/${this.state.currentUser._id}`,
          this.state.currentUser
        )
        .then((res) => console.log(res.data));
    }
  }
  addFriend() {
    var isAlreadyFriend = false;
    var isInSystem = false;
    var targetUser = {};

    //user is in the system check
    targetUser=this.state.usersCollection.filter((userFriend) => {
    
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
    });
console.log("this is target user",targetUser)
    if (!isAlreadyFriend && isInSystem) {
      targetUser.pendingRequest.push(this.state.currentUser);
      axios
        .post(`http://localhost:5000/user/update/${targetUser._id}`, targetUser)
        .then((res) => console.log(res.data));
      console.log("done");
    }
  }
  removeFriend() {
    var isAlreadyFriend = false;

    this.state.currentUser.userFriend.filter((currentUserFriend) => {
      if (currentUserFriend.email === this.state.requestedFriend) {
        console.log("user is a friend");
        isAlreadyFriend = true;
        return currentUserFriend;
      }
    });

    if (isAlreadyFriend) {
      axios
        .post(
          `http://localhost:5000/user/update/${this.state.currentUser._id}`,
          this.state.currentUser
        )
        .then((res) => console.log(res.data));
      console.log("done");
    }
  }
  acceptRequest(friendId) {
    var targetUser = {};
    // already a friend validation
    var targetUser = this.state.currentUser.pendingRequest.filter(
      (currentPendingFriend) => {
        return currentPendingFriend._id !== friendId;
      }
    );
    var addToUserFriend = this.state.currentUser.pendingRequest.filter(
      (currentPendingFriend) => {
        return currentPendingFriend._id === friendId;
      }
    );
    this.state.currentUser.userFriend.push(addToUserFriend);
    this.state.currentUser.pendingRequest = targetUser;

    axios
      .post(
        `http://localhost:5000/user/update/${this.state.currentUser._id}`,
        this.state.currentUser
      )
      .then((res) => console.log(res.data));
    console.log(
      addToUserFriend.firstName,
      " is added to ",
      this.state.currentUser.firstName
    );
  }
  declineRequest() {}
  componentDidMount() {
    this.getUserData();
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentUser._id !== prevState.currentUser._id) {
      this.getUserData();
      this.socket = io("ws://localhost:8900");
      this.state.currentUser.socketId = this.socket.id;

      this.socket.emit("userConnected", this.state.currentUser);
      this.socket.on("getMessage", (data) => {
        console.log(data.text);
      });
      this.setState({
        loading: false,
      });
    }
    const userSocketId = this.socket.id;
    console.log(userSocketId);
    if (!this.state.currentUser.socketId) {
      console.log("hello");
      this.assignSocketId();
    }
  }
  render() {
    return this.state.loading ? (
      <h1>hello there it is still loading</h1>
    ) : (
      <Container maxWidth="xl">
        <AppBar position="static">
          <Container maxWidth="xl">
            <Toolbar disableGutters>
              <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                LOGO
              </Typography>

              <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={() => {
                    this.setState({ openMenu: true });
                  }}
                  color="inherit"
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  open={this.state.openMenu}
                  onClose={() => {
                    this.setState({ openMenu: false });
                  }}
                  sx={{
                    display: { xs: "block", md: "none" },
                  }}
                >
                  {pages.map((page) => (
                    <MenuItem
                      key={page}
                      onClick={() => {
                        this.setState({ openMenu: false });
                      }}
                    >
                      <Typography textAlign="center">{page}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
              <Typography
                variant="h5"
                noWrap
                component="a"
                href=""
                sx={{
                  mr: 2,
                  display: { xs: "flex", md: "none" },
                  flexGrow: 1,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                LOG
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                <Button
                  onClick={() => {
                    this.setState({ openAddFriend: true });
                  }}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {pages[0]}
                </Button>
                <Button
                  onClick={() => {
                    this.setState({ openRemoveFriend: true });
                  }}
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  {pages[1]}
                </Button>
              </Box>

              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton
                    onClick={() => {
                      this.setState({ openAccountSetting: true });
                    }}
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      alt="Remy Sharp"
                      src="/static/images/avatar/2.jpg"
                    />
                  </IconButton>
                </Tooltip>
                <Modal
                  open={this.state.openAccountSetting}
                  onClose={() => {
                    this.setState({ openAccountSetting: false });
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
                    {this.state.currentUser.pendingRequest?.map((req) => {
                      return (
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <FolderIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${req.firstName} ${req.lastName}`} />
                      <Box
                        sx={{
                          display: "inline-flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Button edge="end" aria-label="add" variant="contained">
                          <PersonAddIcon />
                        </Button>
                        <IconButton edge="end" aria-label="delete">
                          <PersonRemoveIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                    );
                    })} 
                  </Box>
                </Modal>
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
                <Modal
                  open={this.state.openRemoveFriend}
                  onClose={() => {
                    this.setState({ openRemoveFriend: false });
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
                      Search for a friend To cancel
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
                    />{" "}
                    <Button onClick={this.removeFriend}>Hello</Button>
                  </Box>
                </Modal>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>{" "}
        <Box display={"inline-flex"} width={"100%"}>
          {this.state.currentUser ? (
            <FriendsList friends={this.state.currentUser.userFriend} />
          ) : (
            <h1>Loading</h1>
          )}
          <Box width={"100%"} margin={0}>
            <Box height={"115%"} width={"100%"}></Box>
            <Box display={"inline-flex"} width={"100%"}>
              <TextField
                fullWidth
                required
                id="outlined-required"
                label="Required"
                name="message"
                onChange={this.handleChange}
              />
              <Button onClick={this.handleSubmit}>Hello</Button>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }
}
