import React, { Component } from "react";
import axios from "axios";
import queryString from "query-string";
import FriendsList from "./friendsList";
import NavBar from "./NavBar";
import "whatwg-fetch";
import { io } from "socket.io-client";

import { Box, TextField, Button, Container } from "@mui/material";

export default class chatSideBar extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      usersCollection: [],
      requestedFriend: "",
      currentUser: [],
      loading: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.removeFriend = this.removeFriend.bind(this);

    this.getUserData = this.getUserData.bind(this);
  }
  async getUserData() {
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
            return true;
          })[0],
        });
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(this.state.currentUser);
  }

 

  componentDidMount() {
    this.getUserData();
    this.socket = io("ws://localhost:8900");
    this.socket.on("welcome", (message) => {
      console.log(message);
      console.log("hello");
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.currentUser._id !== prevState.currentUser._id) {
      this.getUserData();
      this.setState({
        loading: false,
      });
    }
  }

  handleSubmit() {
    console.log(this.state.currentUser);

    this.socket.emit("sendMessage", {
      text: this.state.message,
    });
  }

  addFriend() {
    var isAlreadyFriend = false;
    var isInSystem = false;
    var friendToAdd = {};
    this.state.usersCollection.filter((userFriend) => {
      if (userFriend.email === this.state.requestedFriend) {
        console.log("user friend found");
        isInSystem = true;
        friendToAdd = userFriend;
        // console.log(this.state.currentUser);
      }
      return true;
    });
    this.state.currentUser.userFriend.filter((currentUserFriend) => {
      if (currentUserFriend.email === this.state.requestedFriend) {
        console.log("user is already a friend");
        isAlreadyFriend = true;
      }
      return true;
    });

    if (!isAlreadyFriend && isInSystem) {
      this.state.currentUser.userFriend.push(friendToAdd);
      axios
        .post(
          `http://localhost:5000/user/update/${this.state.currentUser._id}`,
          this.state.currentUser
        )
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
      return true;
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
  render() {
    return this.state.loading ? (
      <h1>hello there it is still loading</h1>
    ) : (
      <Container maxWidth="xl">
        <NavBar AddFriend={this.addFriend} RemoveFriend={this.removeFriend} />
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
