import React, { Component } from "react";
import axios from "axios";
import queryString from "query-string";
import "whatwg-fetch";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import NavBar from "./NavBar";
export default class chatSideBar extends Component {
  constructor() {
    super();
    this.state = {
      message: "",
      usersCollection: [],
      oldMessages: [],
      requestedFriend: "",
      currentUser: {},
      targetUser: {},
      roomId: "",
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.addFriend = this.addFriend.bind(this);
    this.acceptRequest = this.acceptRequest.bind(this);
    this.removeFriend = this.removeFriend.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getUserData = this.getUserData.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
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

    var newPendingFriends = this.state.currentUser.pendingRequest.filter(
      (currentPendingFriend) => {
        return currentPendingFriend !== friendId;
      }
    );
    var roomId = uuidv4();

    this.state.currentUser.userFriend.push({
      friendId: targetUser._id,
      roomId: roomId,
    });
    this.setState((prevState) => ({
      currentUser: {
        ...prevState.currentUser,
        pendingRequest: newPendingFriends,
      },
    }));

    this.updateUser(this.state.currentUser);

    targetUser.userFriend.push({
      friendId: this.state.currentUser._id,
      roomId: roomId,
    });
    this.updateUser(targetUser);
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
  async getOldChat(roomId) {
    await axios
      .get(`http://localhost:5000/message/${roomId}`)
      .then((res) => {
        this.setState({
          oldMessages: res.data,
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  async addMessage(data) {
    await axios
      .post("http://localhost:5000/message/new", data)
      .then((res) => console.log(res.data));
    console.log("message added");
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  handleSubmit(e) {
    const data = {
      text: this.state.message,
      from: this.state.currentUser,
      to: this.state.targetUser,
      roomId: this.state.roomId,
    };
    this.socket.emit("sendMessage", data);

    this.addMessage(data);
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
      console.log("usercollection",this.state.usersCollection);
      console.log("current user",this.state.currentUser);

     
    }
    if (this.state.roomId) {
      this.getOldChat(this.state.roomId);
    }
  }

  render() {
    return (
      <>
        <NavBar currentUser={this.state.currentUser}/>
      </>
    );
  }
}
