import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import SignUp from "./components/Account/components.SignUp.js";
import NoPage from "./components/Account/compomemts.NoPage.js";
import SignIn from "./components/Account/components.SignIn.js";
import ChatSideBar from "./components/ChatWindow.js";
import PrivateChat from "./components/PrivateChat";
import Contacts from "./components/Contacts";
import Account from "./components/Account.js";
import ChatHomeScreen from "./components/HomeScreen.js";
import GroupChatScreen from "./components/GroupScreen.js";
// import UploadImage from "./components/components.UploadImage";

const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", serif',
  },
});


function App() {
  return (
    <div>
          <ThemeProvider theme={theme}>

      <HashRouter>
          <Route>
            <Route path="Signup" element={<SignUp />} />
            <Route path="/" element={<SignIn />} />
            <Route path="*" element={<NoPage />} />
            <Route path="Chat" element={<ChatHomeScreen />} />
            <Route path="Calls" element={<Contacts />} />
            <Route path="Teams" element={<GroupChatScreen />} />
            <Route path="Calendar" element={<Account />} />
            <Route path="Files" element={<Account />} />

          </Route>
      </HashRouter>
      </ThemeProvider>

    </div>
  );
}

export default App;
