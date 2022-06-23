import * as React from "react";
import "whatwg-fetch";
import axios from "axios";
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
import { io } from "socket.io-client";

import MenuIcon from "@mui/icons-material/Menu";

import AdbIcon from "@mui/icons-material/Adb";

const pages = ["Add Friend", "Pricing", "Blog"];
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

export default class chatSideBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      usersCollection: [],
      open: false,
      requestedFriend:""
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
    axios
      .get("http://localhost:5000/user")
      .then((res) => {
        this.setState({ usersCollection: res.data });
        console.log(res.data);
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
    addFriend(){
  //  this.state.usersCollection.map(user=>{
  //   if(user.email === this.state.requestedFriend)
  //   {
  //     axios.post('http://localhost:5000/users/update/' + this.match.params.id)
  //     .then(res => console.log(res.data));
  //   }
  //  })

    }

  render() {
    return (
      <Box>
        <Box>
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

        \
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
                  <Button
                    key={pages}
                    sx={{ my: 2, color: "white", display: "block" }}
                    onClick={()=>{this.setState({open:true})}}
                  >
                    {pages[0]}
                  </Button> 
            
                </Box>

                <Box sx={{ flexGrow: 0 }}>
                  <Tooltip title="Open settings">
                    <IconButton sx={{ p: 0 }}>
                      <Avatar
                        alt="Remy Sharp"
                        src="/static/images/avatar/2.jpg"
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    {settings.map((setting) => (
                      <MenuItem key={setting}>
                        <Typography textAlign="center">{setting}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Toolbar>
            </Container>
          </AppBar>
        </Box>
        <Box display={"inline-flex"} width={"100%"}>
          <Box
            sx={{
              width: "70%",
              paddingRight: "5%",
              bgcolor: "background.paper",
            }}
          >
            <List sx={{ bgcolor: "background.paper" }}>
              {users.map((user) => {
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
            <Box height={"115%"} width={"100%"}>
            </Box>
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
      </Box>
    );
  }
}
