import React from 'react';
import { Link } from 'react-router-dom';
import { TextField, Modal, Box, Button, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton, Container, Grid } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import socket from "./socket";

import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import api from "./axiosConfig";
import queryString from "query-string";
import { v4 as uuidv4 } from "uuid";

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
class Account extends React.Component {
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
        this.addFriend = this.addFriend.bind(this);
        this.acceptRequest = this.acceptRequest.bind(this);
        this.removeFriend = this.removeFriend.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getUserData = this.getUserData.bind(this);
        this.getUser = this.getUser.bind(this);
        this.updateUser = this.updateUser.bind(this);


    }

    async getUserData() {
        const queryParams = queryString.parse(window.location.search);

        await axios
            .get("/user")
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
            .post(`/user/update/${userObject._id}`, userObject)
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
        var data = { _id: roomId, chatHistory: [] };
        axios
            .post("/message/new", data)
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
            [e.target.name]: e.target.value,
        });
    }

    componentDidMount() {
        this.getUserData();
        this.socket = socket;

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
        return (
            <Container maxWidth="sm" sx={{ position: "relative", margin: 0 }}>
                <Box sx={{ display: "inline-flex" }}>
                    <Button
                        color="primary"
                        component={Link}
                        to={`/Chat?id=${this.state.currentUser._id}`}
                        startIcon={<ArrowBackIcon />}
                        style={{ marginBottom: '1rem' }}
                    >

                    </Button>

                    <Avatar alt="denish Sharp" src="/static/images/avatar/2.jpg" sx={{ width: 106, height: 106 }} />


                </Box>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="firstName"
                            fullWidth
                            value={this.state.currentUser.firstName}
                            onChange={this.handleAccountChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                ),
                            }}
                            variant="standard"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="lastName"
                            fullWidth
                            value={this.state.currentUser.lastName}
                            onChange={this.handleAccountChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                ),
                            }}
                            variant="standard"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="E-mail"
                            fullWidth
                            value={this.state.currentUser.email}
                            onChange={this.handlePhoneChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle />
                                    </InputAdornment>
                                ),
                            }}
                            variant="standard"
                        />
                    </Grid>
                </Grid>

                <Typography variant="h5" gutterBottom style={{ marginTop: '1.5rem' }}>Friend Requests:</Typography>
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
                        <Button onClick={this.addFriend}>Send Request</Button>
                    </Box>
                </Modal>               {this.state.currentUser.pendingRequest?.map((id) => {
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
                                    width: "fit-content"
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
                                    aria-label="remove"
                                    variant="contained"
                                    sx={{ backgroundColor: 'red', marginLeft: '15%' }}
                                    onClick={(e) => this.declineRequest(e, user._id)}
                                >
                                    <PersonRemoveIcon />
                                </Button>
                            </Box>
                        </ListItem>
                    );
                })}
            </Container>
        );
    }
}

export default Account;
