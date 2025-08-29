import React from "react";
import RegisterForm from "../components/auth/RegisterForm";

export default function Register() {
  return (
    React.createElement(
      "div",
      { className: "min-h-screen dark:bg-dark_bg_1 flex items-center justify-center py-[19px] overflow-hidden" },
      React.createElement(
        "div",
        { className: "flex w-[1600px] mx-auto h-full" },
        React.createElement(RegisterForm)
      )
    )
  );
}
