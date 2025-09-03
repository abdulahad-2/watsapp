import React, { useEffect } from "react";
import { useSelector } from "react-redux";
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
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  (API_ENDPOINT ? API_ENDPOINT.split("/api/")[0] : "http://localhost:5000");
const socket = io(SOCKET_URL);

function App() {
  //const [connected, setConnected] = useState(false);
  const { user } = useSelector((state) => state.user);
  const { token } = user;

  // Listen for 401 errors and handle them smoothly
  useEffect(() => {
    if (
      !token &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      // Use react-router's navigate instead of window.location for smoother transitions
      window.location.href = "/login";
    }
  }, [token]);

  return React.createElement(
    "div",
    { className: "dark" },
    React.createElement(
      SocketContext.Provider,
      { value: socket },
      React.createElement(
        Router,
        {
          future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          },
        },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            exact: true,
            path: "/",
            element: token
              ? React.createElement(Home, { socket })
              : React.createElement(Navigate, { to: "/login" }),
          }),
          React.createElement(Route, {
            exact: true,
            path: "/login",
            element: !token
              ? React.createElement(Login)
              : React.createElement(Navigate, { to: "/" }),
          }),
          React.createElement(Route, {
            exact: true,
            path: "/register",
            element: !token
              ? React.createElement(Register)
              : React.createElement(Navigate, { to: "/" }),
          }),
          React.createElement(Route, {
            exact: true,
            path: "/test-connection",
            element: React.createElement(TestConnection),
          })
        )
      )
    )
  );
}

export default App;
