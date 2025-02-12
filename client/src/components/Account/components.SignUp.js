import * as React from "react";
import axios from "axios";

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
export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      usersCollection: [],
      profilePhoto: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.validation = this.validation.bind(this);
  }
  componentDidMount() {
    axios
      .get("http://localhost:5000/user")
      .then((res) => {
        this.setState({ usersCollection: res.data });
        console.log(res.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  validation() {
    // /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(myForm.emailAddr.value)
    var isPassword = false;
    if (this.state.confirmPassword === this.state.password) {
      console.log("user password validated");
      isPassword = true;
    } else {
      console.log("user password not validated");
      isPassword = false;
    }

    const isDuplicate = this.state.usersCollection.map((user) => {
      if (user.email === this.state.email) {
        console.log("user already exists");
        return false;
      } else {
        return true;
      }
    });

    if (isPassword && isDuplicate) {
      console.log("user validated");
      return true;
    } else if (!isPassword) {
      console.log("password not validated");
      return false;
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("firstName", this.state.firstName);
    formData.append("lastName", this.state.lastName);
    formData.append("email", this.state.email);
    formData.append("password", this.state.password);
    formData.append("profilePhoto", this.state.profilePhoto);

    console.log("Sending signup request with data:", formData);

    axios
      .post("http://localhost:5000/user/signup", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log("Signup success:", res.data);
        window.location = `/Home?id=${res.data._id}`;
      })
      .catch((err) => {
        console.error("Upload failed:", err);
      });


  }



  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
    console.log(this.state.profilePhoto);
  }
  render() {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          component={"form"}
          encType="multipart/form-data"
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
              src={this.state.profilePhoto ? URL.createObjectURL(this.state.profilePhoto) : ""}
            />
            <input
              type="file"
              hidden
              accept="image/*" // ✅ Restrict file types
              onChange={(e) => {
                if (e.target.files[0]) {
                  this.setState({ profilePhoto: e.target.files[0] }); // ✅ Save file
                }
              }}
            />
          </Button>


          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
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
                  autoComplete="email"
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
              sx={{ mt: 3, mb: 2 }}
              onClick={this.handleSubmit}
            >
              Sign Up
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
