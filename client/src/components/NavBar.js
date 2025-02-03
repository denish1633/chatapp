import React, { Component } from "react";

import "whatwg-fetch";
import {
  Box,
  IconButton,
  Avatar,
  Link,
  AppBar,
} from "@mui/material";
import AdbIcon from "@mui/icons-material/Adb";
import { BsFillChatFill } from "react-icons/bs";
import { IoChatbubbles } from "react-icons/io5";
import { FaUserFriends } from "react-icons/fa";
export default class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openChat: false,
      openGroupChat: false,
      openContact: false,
      openMenu: false,
      openAddFriend: false,
      openRemoveFriend: false,
      openAccountSetting: false,
      requestedFriend: "",
    };

    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }
  render() {
    return (
      <Box

        sx={{
          display: "inline-flex",
          alignContent: "center",
          justifyContent: "center",
          borderRadius: "2%",
          backgroundColor: "transparent"

        }}
      >
        <AppBar
          position="static"
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "3rem",
            justifyItems: "center",
            alignItems: "center",
            backgroundColor: "transparent"
          }}
        >


          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >

            <Link
              href={`Account?id=${this.props.currentUser._id}`}
              variant="body2"
            >
              <IconButton
                onClick={() => {
                  this.setState({ openAccountSetting: true });
                }}

              >
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg"  sx={{ width: 56, height: 56 }}/>
              </IconButton>
            </Link>
            {/* <Link
              href={`Chat?id=${this.props.currentUser._id}`}
              variant="body2"
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => {
                  this.setState({ openChat: true });
                }}
                color="inherit"
              >
                <BsFillChatFill size={"1em"} />
              </IconButton>
            </Link> */}
            {/* <Link
              href={`GroupChat?id=${this.props.currentUser._id}`}
              variant="body2"
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => {
                  this.setState({ openGroupChat: true });
                }}
                color="inherit"
              >
                <IoChatbubbles size={"1em"} />
              </IconButton>
            </Link>
            <Link
              href={`Contacts?id=${this.props.currentUser._id}`}
              variant="body2"
            >
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={() => {
                  this.setState({ openContact: true });
                }}
                color="inherit"
              >
                <FaUserFriends size={"1em"} />
              </IconButton>
            </Link> */}

          </Box>
        </AppBar>
      </Box>
    );
  }
}
// {
//   /* <Modal
//             open={this.state.openAccountSetting}
//             onClose={() => {
//               this.setState({ openAccountSetting: false });
//             }}
//           aria-labelledby="modal-modal-title"
//           aria-describedby="modal-modal-description"
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: 400,
//               bgcolor: "background.paper",
//               border: "2px solid #000",
//               boxShadow: 24,
//               p: 4,
//             }}
//           >
//             <Box>
//               <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
//             </Box>
//             {this.props.user.pendingRequest?.map((id) => {
//               var user = this.getUser(id);
//               return (
//                 <ListItem>
//                   <ListItemAvatar>
//                     <Avatar
//                       alt="Remy Sharp"
//                       src="/static/images/avatar/1.jpg"
//                       sx={{ height: 46, width: 46 }}
//                     />
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={`${user.firstName} ${user.lastName}`}
//                   />
//                   <Box
//                     sx={{
//                       display: "inline-flex",
//                       justifyContent: "space-between",
//                     }}
//                   >
//                     <Button
//                       edge="end"
//                       aria-label="add"
//                       variant="contained"
//                       onClick={(e) => this.acceptRequest(e, user._id)}
//                     >
//                       <PersonAddIcon />
//                     </Button>
//                     <Button
//                       edge="end"
//                       aria-label="add"
//                       variant="contained"
//                       onClick={(e) => this.declineRequest(e, user._id)}
//                     >
//                       <PersonRemoveIcon />
//                     </Button>
//                   </Box>
//                 </ListItem>
//               );
//             })}
//           </Box>
//         </Modal>
//         <Modal
//           open={this.state.openAddFriend}
//           onClose={() => {
//             this.setState({ openAddFriend: false });
//           }}
//           aria-labelledby="modal-modal-title"
//           aria-describedby="modal-modal-description"
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: 400,
//               bgcolor: "background.paper",
//               border: "2px solid #000",
//               boxShadow: 24,
//               p: 4,
//             }}
//           >
//             <Typography id="modal-modal-title" variant="h6" component="h2">
//               Search for a friend
//             </Typography>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="email"
//               placeholder="Enter Your Friends Email"
//               label="Email Address"
//               name="requestedFriend"
//               autoComplete="email"
//               autoFocus
//               onChange={this.handleChange}
//             />
//             <Button onClick={this.addFriend}>Hello</Button>
//           </Box>
//         </Modal>
//         <Modal
//           open={this.state.openRemoveFriend}
//           onClose={() => {
//             this.setState({ openRemoveFriend: false });
//           }}
//           aria-labelledby="modal-modal-title"
//           aria-describedby="modal-modal-description"
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               width: 400,
//               bgcolor: "background.paper",
//               border: "2px solid #000",
//               boxShadow: 24,
//               p: 4,
//             }}
//           >
//             <Typography id="modal-modal-title" variant="h6" component="h2">
//               Search for a friend To cancel
//             </Typography>
//             <TextField
//               margin="normal"
//               required
//               fullWidth
//               id="email"
//               placeholder="Enter Your Friends Email"
//               label="Email Address"
//               name="requestedFriend"
//               autoComplete="email"
//               autoFocus
//               onChange={this.handleChange}
//             />{" "}
//             <Button onClick={this.removeFriend}>Hello</Button>
//           </Box>
//         </Modal> */
// }
