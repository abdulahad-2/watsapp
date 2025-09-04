import express from "express";
import userRouter from "./user.route.js";

const router = express.Router();

// Simple working routes
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      error: { status: 400, message: "Please fill all fields." }
    });
  }

  const userData = {
    _id: `user_${Date.now()}`,
    name,
    email,
    picture: req.body.picture || "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
    status: req.body.status || "Hey there! I am using WhatsApp.",
    token: `token_${Date.now()}`
  };

  // Add user to searchable users list
  userRouter.addUser(userData);

  // Immediate response - no processing delays
  res.status(201).json({
    message: "register success.",
    user: userData
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: { status: 400, message: "Please provide email and password." }
    });
  }

  // Immediate response - no processing delays
  res.json({
    message: "login success.",
    user: {
      _id: `user_${Date.now()}`,
      name: email.split('@')[0],
      email,
      picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
      status: "Hey there! I am using WhatsApp.",
      token: `token_${Date.now()}`
    }
  });
});

router.post("/logout", (req, res) => {
  res.json({ message: "logged out!" });
});

router.post("/refreshtoken", (req, res) => {
  res.json({
    user: {
      _id: `user_${Date.now()}`,
      name: "User",
      email: "user@example.com",
      picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
      status: "Hey there! I am using WhatsApp.",
      token: `token_${Date.now()}`
    }
  });
});

export default router;
