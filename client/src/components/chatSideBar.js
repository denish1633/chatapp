import React, { Component } from "react";
import axios from "axios";
import queryString from "query-string";
import MenuIcon from "@mui/icons-material/Menu";
import "whatwg-fetch";
import { io } from "socket.io-client";
import AdbIcon from "@mui/icons-material/Adb";
import {
  List,
  Box,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  TextField,
  Modal,
  Avatar,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  Container,
  Tooltip,
  MenuItem,
} from "@mui/material";
const pages = ["Add Friend"];
const settings = ["Profile", "Account", "Dashboard", "Logout"];
const users = [
  {
    imageSrc: "/static/images/avatar/1.jpg",
    time: "3:40",
    fullName: "Ali Connors",
    message: " — I'll be in your neighborhood doing errands this…",
  },
  {
    imageSrc: "/static/images/avatar/1.jpg",
    time: "5:20",
    fullName: "Dneish Shingala",
    message: " — I'll be in your neighborhood doing errands this…",
  },
  {
    imageSrc: "/static/images/avatar/1.jpg",
    time: "2:57",
    fullName: "kenil chovatiya",
    message: " — I'll be in your neighborhood doing errands this…",
  },
  {
    imageSrc: "/static/images/avatar/1.jpg",
    time: "1:40",
    fullName: "shreeji patel",
    message: " — I'll be in your neighborhood doing errands this…",
  },
];
export default class chatSideBar extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      usersCollection: [],
      requestedFriend: "",
      open: false,
      currentUser: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFriend = this.addFriend.bind(this);
  }
  componentDidMount() {
    this.socket = io("ws://localhost:8900");
    this.socket.on("welcome", (message) => {
      console.log(message);
      console.log("hello");
    });
    const queryParams = queryString.parse(window.location.search);
    console.log(queryParams.email);

    axios
      .get("http://localhost:5000/user")
      .then((res) => {
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
 }
  handleSubmit() {

    this.socket.emit("sendMessage", {
      text: this.state.message,
    });
  }

  addFriend() {
    this.state.usersCollection.filter((userFriend) => {
      if (userFriend.email === this.state.requestedFriend) {
        console.log("user friend found");
       this.state.currentUser.userFriend.push(userFriend);
       console.log(this.state.currentUser)
      }   
    });

    axios     
      .post(
        `http://localhost:5000/user/update/${this.state.currentUser._id}`,
        this.state.currentUser
      )
      .then((res) => console.log(res.data));
    console.log("done");
  }
  render() {
    return (
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

              {/* <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={()=>{this.setState({icon:true})}}
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
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center">{page}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box> */}
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
                LOGO
              </Typography>
              <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                {pages.map((page) => (
                  <Button
                    key={page}
                    onClick={() => {
                      this.setState({ open: true });
                    }}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page}
                  </Button>
                ))}
                <Modal
                  open={this.state.open}
                  onClose={() => {
                    this.setState({ open: false });
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
                      Search for friend's Email
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      id="outlined-required"
                      label="Required"
                      onChange={(e) =>
                        this.setState({ requestedFriend: e.target.value })
                      }
                    />
                    <Button onClick={this.addFriend}>Add Friend</Button>
                  </Box>
                </Modal>
              </Box>

              <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                  <IconButton
                    //  onClick={handleOpenUserMenu}
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      alt="Remy Sharp"
                      src="/static/images/avatar/2.jpg"
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  // anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  // open={Boolean(anchorElUser)}
                  // onClose={handleCloseUserMenu}
                >
                  {settings.map((setting) => (
                    <MenuItem
                      key={setting}
                      //   onClick={handleCloseUserMenu}
                    >
                      <Typography textAlign="center">{setting}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Box display={"inline-flex"} width={"100%"}>
          <Box
            sx={{
              width: "70%",
              paddingRight: "5%",
              bgcolor: "background.paper",
            }}
          >
            <List sx={{ bgcolor: "background.paper" }}>
              {this.state.currentUser.userFriend.map((user) => {
                return (
                  <>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar
                          alt="Remy Sharp"
                          src="/static/images/avatar/1.jpg"
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.fullName}
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {user.message}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                      <ListItemText
                        secondary={
                          <React.Fragment>
                            <Typography
                              sx={{ display: "inline" }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {user.time}
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </>
                );
              })}
            </List>
          </Box>
          <Box width={"100%"} margin={0}>
            <Box height={"115%"} width={"100%"}></Box>
            <Box display={"inline-flex"} width={"100%"}>
              <TextField
                fullWidth
                required
                id="outlined-required"
                label="Required"
                onChange={(e) => this.setState({ message: e.target.value })}
              />
              <Button onClick={this.handleSubmit}>Hello</Button>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }
}
