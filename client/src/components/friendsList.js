import React, { Component } from "react";
import {
  List,
  Box,
  ListItem,
  Divider,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
} from "@mui/material";

export default class FriendsList extends Component {
  constructor(props) {
    super(props);
    this.state={
        userFriend:[]
    }
  }
  componentDidMount(){
    this.setState({
        userFriend:this.props.friends
    })
  }
  

  render() {

    return (
      <Box
        sx={{
          width: "100%",
          paddingRight: "5%",
          bgcolor: "background.paper",
        }}
      >
        <List sx={{ bgcolor: "background.paper" }}>
      {this.props.friends?.map((user,index) => {
        return(
            <ListItem alignItems="flex-start" key={index}>
              <ListItemAvatar>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
              </ListItemAvatar>
              <ListItemText
                primary={user.firstName + " " +user.lastName}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {"last message"}
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
                      {"last message time"}
                    </Typography>
                  </React.Fragment>
                }
              />
              <Divider variant="inset"/>
            </ListItem>);
          })}
        </List>
      </Box>
    );
  }
}
