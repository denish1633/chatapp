import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./components/Account/components.SignUp.js";
import NoPage from "./components/Account/compomemts.NoPage.js";
import SignIn from "./components/Account/components.SignIn.js";
import ChatSideBar from "./components/chatSideBar.js";
// import UploadImage from "./components/components.UploadImage";
function App() {
  return (
  <div >
   
      <BrowserRouter>
      <Routes>
        <Route>
          <Route path="Signup" element={<SignUp />} />
          <Route path="SignIn" element={<SignIn />} />
          <Route path="*" element={<NoPage />} />
        <Route path="Sidebar" element={<ChatSideBar />} />
        </Route> 

      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
