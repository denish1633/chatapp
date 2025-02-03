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
import bgImage from "./bgImage.png";

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
    document.body.style.backgroundColor = "#111c5a"; // Set background color globally

    axios
      .get("http://localhost:5000/user")
      .then((res) => this.setState({ usersCollection: res.data }))
      .catch((error) => console.log(error));
  }

  validation() {
    const isDuplicate = this.state.usersCollection.some(
      (user) =>
        user.email === this.state.email && user.password === this.state.password
    );

    if (isDuplicate) {
      const user = this.state.usersCollection.find(
        (user) =>
          user.email === this.state.email &&
          user.password === this.state.password
      );
      this.setState({ userId: user._id });
      console.log("User valid");
    }

    return isDuplicate;
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.validation()) {
      axios
        .post("http://localhost:5000/user/signin", {
          email: this.state.email,
          password: this.state.password,
        })
        .then((res) => {
          console.log(res.data);
          window.location = `/Home?id=${this.state.userId}`;
        });
    } else {
      console.log("Invalid credentials");
    }
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          px: { xs: 2, md: 4 },
          backgroundColor: "#111c5a",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            p: { xs: 3, md: 5 },
            maxWidth: "900px",
            width: "100%",
            justifyItems: "space-between"
          }}
        >
          {/* Left Side: Form Section */}
          <Box
            sx={{
              flex: 1,
              textAlign: { xs: "center", md: "left" },
              mb: { xs: 3, md: 0 },
            }}
          >
            <Typography
              component="h1"
              variant="h2"
              fontWeight="bold"
              sx={{ whiteSpace: "pre-line", color:"#ffff" }}
            >
              {`Have your \n best chat`}
            </Typography>
            <Typography
              component="h1"
              
              sx={{ whiteSpace: "pre-line", color:"#ffff",fontSize:"25px" }}
            >
              {`Fast, easy, unlimited chat services`}
            </Typography>

            <Box component="form" noValidate sx={{ mt: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                placeholder="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={this.handleChange}
                sx={{ backgroundColor: "#ffff", 
                  fontSize: 16,
                  maxWidth: "350px",
                  width: "100%",
                  mx: "auto", }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                placeholder="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={this.handleChange}
                sx={{
                  backgroundColor: "#ffff", 
                  fontSize: 16, 
                  maxWidth: "350px",
                  width: "100%",
                  mx: "auto",
                }}
              />

              <Button
                type="submit"
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  fontSize: 18,
                  fontWeight: "bold",
                  py: 1.5,
                  maxWidth: "350px",
                  width: "100%",
                  mx: "auto",
                }}
                onClick={this.handleSubmit}
              >
                Sign In
              </Button>

              <Grid container spacing={5}>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    sx={{ color: "#ffff", textDecoration: "none" }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href="signup"
                    variant="body2"
                    sx={{ color: "#ffff", textDecoration: "none" }}
                  >
                    Don't have an account? Sign Up
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>

          {/* Right Side: Image Section */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <img
              src={bgImage}
              alt="Home Illustration"
              style={{
                maxWidth: "100%",
                height: "auto",
                borderRadius: "10px",
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }
}
