import React, { Component } from "react";

import "whatwg-fetch";
import {
  Box,
  IconButton,
  Avatar,
  Link,
  AppBar,
} from "@mui/material";
import {
  IoHome,
  IoSearchCircle,
  IoHelpCircle,
  IoSettings,
  IoNotifications
}
  from "react-icons/io5";
import { IoMdContact } from "react-icons/io";

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
          display: "flex",
          alignContent: "center",
          height: "100vh",
          backgroundColor: "#111c5a",
          flexDirection: "column"
        }}
      >
        <Link
          href={`Account?id=${this.props.currentUser?._id}`}
          variant="body2"
        >
          <IconButton
            onClick={() => {
              this.setState({ openAccountSetting: true });
            }}
          >
            <Avatar alt="Remy Sharp" src={this.props.currentUser?.profilePic} sx={{ width: 56, height: 56, borderRadius: 2 }} variant="square" />
          </IconButton>
        </Link>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", height: "100%",marginBottom:"25%" }}>
          <Link
            href={`Home?id=${this.props.currentUser._id}`}
            variant="body2"
          >
            <IconButton
              onClick={() => {
                this.setState({ openAccountSetting: true });
              }}

            >
              <IoHome color="white" size={"1.2em"} />
            </IconButton>
          </Link>

          <Link
            href={`Contact?id=${this.props.currentUser._id}`}
            variant="body2"
          >
            <IconButton
              onClick={() => {
                this.setState({ openAccountSetting: true });
              }}

            >
              <IoMdContact color="white" size={"1.2em"} />
            </IconButton>
          </Link>

          <Link
            href={`Search?id=${this.props.currentUser._id}`}
            variant="body2"
          >
            <IconButton
              onClick={() => {
                this.setState({ openAccountSetting: true });
              }}

            >
              <IoSearchCircle color="white" size={"1.2em"} />
            </IconButton>
          </Link>

          <Link
            href={`Notifications?id=${this.props.currentUser._id}`}
            variant="body2"
          >
            <IconButton
              onClick={() => {
                this.setState({ openAccountSetting: true });
              }}

            >
              <IoNotifications color="white" size={"1.2em"} />
            </IconButton>
          </Link>

          <Link
            href={`Settings?id=${this.props.currentUser._id}`}
            variant="body2"
          >
            <IconButton
              onClick={() => {
                this.setState({ openAccountSetting: true });
              }}

            >
              <IoSettings color="white" size={"1.2em"} />
            </IconButton>
          </Link>


          <Link
            href={`Help?id=${this.props.currentUser._id}`}
            variant="body2"
          >
            <IconButton
              onClick={() => {
                this.setState({ openAccountSetting: true });
              }}

            >
              <IoHelpCircle color="white" size={"1.2em"} />
            </IconButton>
          </Link>


        </Box>
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
