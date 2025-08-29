import React from "react";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    React.createElement(
      "div",
      { className: "h-screen dark:bg-dark_bg_1 flex items-center justify-center py-[19px] overflow-hidden" },
      React.createElement(
        "div",
        { className: "flex w-[1600px] mx-auto h-full" },
        React.createElement(LoginForm)
      )
    )
  );
}
