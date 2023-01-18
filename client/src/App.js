import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/Account/components.SignUp.js";
import NoPage from "./components/Account/compomemts.NoPage.js";
import SignIn from "./components/Account/components.SignIn.js";
import ChatSideBar from "./components/chatSideBar.js";
import PrivateChat from "./components/PrivateChat";
import Contacts from "./components/Contacts";
import GroupChat from "./components/GroupChat.js";
// import UploadImage from "./components/components.UploadImage";
function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route>
            <Route path="Signup" element={<SignUp />} />
            <Route path="/" element={<SignIn />} />
            <Route path="*" element={<NoPage />} />
            <Route path="Chat" element={<PrivateChat />} />
            <Route path="GroupChat" element={<GroupChat />} />
            <Route path="Contacts" element={<Contacts />} />
            <Route path="Home" element={<ChatSideBar />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
