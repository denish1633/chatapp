import * as React from "react";
import axios from "axios";
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import startScreen from "./startScreen.jpg";

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      userId: "",
      usersCollection: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validation = this.validation.bind(this);
  }
  componentDidMount() {
    axios
      .get("http://localhost:5000/user")
      .then((res) => {
        const data = res.data;
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
        this.setState({
          userId: user._id,
        });

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
    if (valid) {
      const user = {
        email: this.state.email,
        password: this.state.password,
      };
      axios.post("http://localhost:5000/user/signin", user).then((res) => {
        console.log(res.data);
        const queryParams = new URLSearchParams(`?id=${this.state.userId}`);
        window.location = `/Home?${queryParams}`;
      });
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
      
      <Box sx={{
        display: "flex",
        flexDirection:"row",
        justifyContent:"center",
        alignContent:"center",backgroundColor:"#ffeeea", height: "78em"      
        
      }}>
        <Box
          sx={{
            display: "inline-flex",
           
          }}
        >
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingRight:"10%",
              width:"max-content"
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Box component="form" noValidate sx={{ mt: 1 }}>
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
                sx={{ mt: 3, mb: 2 }}
                onClick={this.handleSubmit}
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
          <Box >
            <img src={startScreen} width={700} height={700} alt=""/>
          </Box>
        </Box>
      </Box>
      
    );
  }
}
