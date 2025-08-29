import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { io } from "socket.io-client";
import SocketContext from "./context/SocketContext";
//Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import TestConnection from "./pages/TestConnection";
// socket io - use Vite envs
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (API_ENDPOINT ? API_ENDPOINT.split('/api/')[0] : "http://localhost:5000");
const socket = io(SOCKET_URL);

function App() {
  //const [connected, setConnected] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { token } = user;

  return React.createElement("div", { className: "dark" },
    React.createElement(SocketContext.Provider, { value: socket },
      React.createElement(Router, null,
        React.createElement(Routes, null,
          React.createElement(Route, {
            exact: true,
            path: "/",
            element: token ? React.createElement(Home, { socket }) : React.createElement(Navigate, { to: "/login" })
          }),
          React.createElement(Route, {
            exact: true,
            path: "/login",
            element: !token ? React.createElement(Login) : React.createElement(Navigate, { to: "/" })
          }),
          React.createElement(Route, {
            exact: true,
            path: "/register",
            element: !token ? React.createElement(Register) : React.createElement(Navigate, { to: "/" })
          }),
          React.createElement(Route, {
            exact: true,
            path: "/test-connection",
            element: React.createElement(TestConnection)
          })
        )
      )
    )
  );
}

export default App;
