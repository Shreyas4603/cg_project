import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Mainpage from "./Components/Mainpage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route>
          {/* <Route path="/" element={<Auto/>}/> */}
          <Route path="/" element={<Mainpage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
