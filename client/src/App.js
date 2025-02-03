import React from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';


import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/Account/components.SignUp.js";
import NoPage from "./components/Account/compomemts.NoPage.js";
import SignIn from "./components/Account/components.SignIn.js";
import ChatSideBar from "./components/chatSideBar.js";
import PrivateChat from "./components/PrivateChat";
import Contacts from "./components/Contacts";
import Account from "./components/Account.js";
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

      <BrowserRouter>
        <Routes>
          <Route>
            <Route path="Signup" element={<SignUp />} />
            <Route path="/" element={<SignIn />} />
            <Route path="*" element={<NoPage />} />
            <Route path="Chat" element={<PrivateChat />} />
            <Route path="Contacts" element={<Contacts />} />
            <Route path="Home" element={<PrivateChat />} />
            <Route path="Account" element={<Account />} />

          </Route>
        </Routes>
      </BrowserRouter>
      </ThemeProvider>

    </div>
  );
}

export default App;
