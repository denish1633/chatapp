import * as React from "react";
import api from "../axiosConfig";
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import bgImage from "./bgImage.png";

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      loading: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    document.body.style.backgroundColor = "#111c5a";
    
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user._id) {
        console.log("Current User:", user);
        window.location = `/Chat?id=${user._id}`;
      }
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true, error: "" });

    try {
      const response = await axios.post("/auth/login", {
        email: this.state.email,
        password: this.state.password,
      });

      const { token, user } = response.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful:", user);

      // Redirect to home page
      window.location = `/Chat?id=${user.id}`;
    } catch (error) {
      console.error("Login error:", error);
      this.setState({
        error: error.response?.data?.message || "Invalid email or password",
        loading: false,
      });
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
            justifyItems: "space-between",
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
              sx={{ whiteSpace: "pre-line", color: "#ffff" }}
            >
              {`Have your \n best chat`}
            </Typography>
            <Typography
              component="h1"
              sx={{ whiteSpace: "pre-line", color: "#ffff", fontSize: "25px" }}
            >
              {`Fast, easy, unlimited chat services`}
            </Typography>

            <Box component="form" onSubmit={this.handleSubmit} noValidate sx={{ mt: 2 }}>
              {this.state.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {this.state.error}
                </Alert>
              )}

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
                value={this.state.email}
                sx={{
                  backgroundColor: "#ffff",
                  fontSize: 16,
                  maxWidth: "350px",
                  width: "100%",
                  mx: "auto",
                }}
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
                value={this.state.password}
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
                disabled={this.state.loading}
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
              >
                {this.state.loading ? "Signing In..." : "Sign In"}
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
