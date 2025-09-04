import express from "express";

const router = express.Router();

// Simple working routes
router.post("/register", (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        error: { status: 400, message: "Please fill all fields." }
      });
    }

    // Mock successful registration
    res.status(201).json({
      message: "register success.",
      user: {
        _id: "mock_user_id",
        name,
        email,
        picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
        status: "Hey there! I am using WhatsApp.",
        token: "mock_access_token"
      }
    });
  } catch (error) {
    res.status(500).json({
      error: { status: 500, message: "Registration failed" }
    });
  }
});

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: { status: 400, message: "Please provide email and password." }
      });
    }

    // Mock successful login
    res.json({
      message: "login success.",
      user: {
        _id: "mock_user_id",
        name: "Test User",
        email,
        picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
        status: "Hey there! I am using WhatsApp.",
        token: "mock_access_token"
      }
    });
  } catch (error) {
    res.status(500).json({
      error: { status: 500, message: "Login failed" }
    });
  }
});

router.post("/logout", (req, res) => {
  try {
    res.json({ message: "logged out!" });
  } catch (error) {
    res.status(500).json({
      error: { status: 500, message: "Logout failed" }
    });
  }
});

router.post("/refreshtoken", (req, res) => {
  try {
    res.json({
      user: {
        _id: "mock_user_id",
        name: "Test User",
        email: "test@example.com",
        picture: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/1200px-User-avatar.svg.png",
        status: "Hey there! I am using WhatsApp.",
        token: "mock_refresh_token"
      }
    });
  } catch (error) {
    res.status(500).json({
      error: { status: 500, message: "Token refresh failed" }
    });
  }
});

export default router;
