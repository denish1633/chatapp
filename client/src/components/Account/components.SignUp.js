import * as React from "react";
import api from "../axiosConfig";
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
  Alert,
} from "@mui/material";

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilePhoto: null,
      profilePhotoPreview: "",
      error: "",
      loading: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  componentDidMount() {
    document.body.style.backgroundColor = "#fff";
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({ loading: true, error: "" });

    // Validation
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({
        error: "Passwords do not match",
        loading: false,
      });
      return;
    }

    if (this.state.password.length < 6) {
      this.setState({
        error: "Password must be at least 6 characters",
        loading: false,
      });
      return;
    }

    try {
      // Upload profile photo first if exists
      let profilePicUrl = "";
      if (this.state.profilePhoto) {
        const formData = new FormData();
        formData.append("file", this.state.profilePhoto);
        
        // You can use a service like Cloudinary or store in your backend
        // For now, we'll just use a placeholder
        profilePicUrl = this.state.profilePhotoPreview;
      }

      // Register user
      const response = await api.post("/auth/register", {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        password: this.state.password,
        profilePic: profilePicUrl,
      });

      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Registration successful:", user);

      // Redirect to home page
      window.location = `/Chat?id=${user.id}`;
      console.log("User registered successfully:", user);
    } catch (error) {
      console.error("Registration error:", error);
      this.setState({
        error: error.response?.data?.message || "Registration failed. Please try again.",
        loading: false,
      });
    }
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      this.setState({
        profilePhoto: file,
        profilePhotoPreview: URL.createObjectURL(file),
      });
    }
  }

  render() {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          component="form"
          onSubmit={this.handleSubmit}
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Button variant="ghost" component="label">
            <Avatar
              sx={{ width: 80, height: 80, bgcolor: "secondary.main" }}
              src={this.state.profilePhotoPreview || ""}
            />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={this.handleFileChange}
            />
          </Button>

          <Typography component="h1" variant="h5">
            Sign up
          </Typography>

          {this.state.error && (
            <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
              {this.state.error}
            </Alert>
          )}

          <Box noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  onChange={this.handleChange}
                  value={this.state.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  onChange={this.handleChange}
                  value={this.state.lastName}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  onChange={this.handleChange}
                  value={this.state.email}
                  autoComplete="email"
                  type="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  onChange={this.handleChange}
                  value={this.state.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  onChange={this.handleChange}
                  value={this.state.confirmPassword}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox value="allowExtraEmails" color="primary" />
                  }
                  label="I want to receive inspiration, marketing promotions and updates via email."
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={this.state.loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {this.state.loading ? "Signing Up..." : "Sign Up"}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/SignIn" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    );
  }
}
