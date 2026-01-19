import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { HashRouter, Routes, Route } from "react-router-dom";

import SignUp from "./components/Account/components.SignUp";
import NoPage from "./components/Account/compomemts.NoPage";
import SignIn from "./components/Account/components.SignIn";
import Contacts from "./components/Contacts";
import Account from "./components/Account";
import ChatHomeScreen from "./components/HomeScreen";
import GroupChatScreen from "./components/GroupScreen";

const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <HashRouter>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/Signup" element={<SignUp />} />
          <Route path="/Chat" element={<ChatHomeScreen />} />
          <Route path="/Calls" element={<Contacts />} />
          <Route path="/Teams" element={<GroupChatScreen />} />
          <Route path="/Calendar" element={<Account />} />
          <Route path="/Files" element={<Account />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </HashRouter>

    </ThemeProvider>
  );
}

export default App;

