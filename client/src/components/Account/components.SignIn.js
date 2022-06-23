import * as React from "react";
import axios from "axios";
import queryString from "query-string"
import { io } from "socket.io-client";
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      usersCollection: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validation = this.validation.bind(this);
  }
  componentDidMount() {
   
    
    
    axios
      .get("http://localhost:5000/user")
      .then((res) => {const data=res.data;
        this.setState({ usersCollection: data });
        
      })
      .catch(function (error) {
        console.log(error);
      });

      console.log(this.state.usersCollection);
  }
  validation() {
    // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(myForm.emailAddr.value)
    const isDuplicate = this.state.usersCollection.map((user) => {
      if (
        user.email === this.state.email &&
        user.password === this.state.password
      ) {
        console.log("user valid ");
        return true;
      } else {
        return false;
      }
    });
    return isDuplicate;
  }

  handleSubmit(e) {
    e.preventDefault();

    const valid = this.validation();
    if (true) {
      const user = {
        email: this.state.email,
        password: this.state.password,
      };
      axios
        .post("http://localhost:5000/user/signin", user)
        .then((res) => console.log(res.params.email));
        const queryParams = new URLSearchParams(`?email=${user.email}`)

      window.location = `/sidebar?${queryParams}`;

      // this.socket = io("ws://localhost:8900");

      // this.socket.on("welcome", (message) => {
      //   console.log(message);
      //   console.log("hello");
      // });
    } else {
      console.log("data not uploaded");
    }
  }
  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
           
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={this.handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={this.handleChange}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }} onClick={this.handleSubmit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link href="signup" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    );
  }
}
