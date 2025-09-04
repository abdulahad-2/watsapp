import express from "express";

const router = express.Router();

// In-memory storage for registered users (in real app, this would be a database)
let registeredUsers = [
  {
    _id: "user_default_1",
    name: "John Doe",
    email: "john@example.com",
    picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    status: "Available"
  },
  {
    _id: "user_default_2", 
    name: "Jane Smith",
    email: "jane@example.com",
    picture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    status: "Busy"
  }
];

// Add user to registered users list (called from auth routes)
router.addUser = (user) => {
  // Check if user already exists
  const existingUser = registeredUsers.find(u => u.email === user.email);
  if (!existingUser) {
    registeredUsers.push({
      _id: user._id || user.id || Date.now().toString(),
      name: user.name,
      email: user.email,
      picture: user.picture,
      status: user.status || "Hey there! I am using WhatsApp."
    });
  }
};

// Find user by email (called from auth routes)
router.findUser = (email) => {
  return registeredUsers.find(u => u.email === email);
};

// User search route - supports both /search and query params
router.get("/search", (req, res) => {
  const { search } = req.query;
  
  if (!search || search.trim().length === 0) {
    return res.json([]);
  }
  
  // Filter users based on search term (name or email)
  const filteredUsers = registeredUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  res.json(filteredUsers);
});

// Also handle GET / with search query for /api/v1/user?search=
router.get("/", (req, res) => {
  const { search } = req.query;
  
  if (!search || search.trim().length === 0) {
    return res.json([]);
  }
  
  // Filter users based on search term (name or email)
  const filteredUsers = registeredUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  res.json(filteredUsers);
});

// Get all registered users (for debugging)
router.get("/all", (req, res) => {
  res.json(registeredUsers);
});

// Update user profile
router.put("/profile", (req, res) => {
  const { email, name, picture, status } = req.body;
  
  const userIndex = registeredUsers.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    registeredUsers[userIndex] = {
      ...registeredUsers[userIndex],
      name: name || registeredUsers[userIndex].name,
      picture: picture || registeredUsers[userIndex].picture,
      status: status || registeredUsers[userIndex].status
    };
    res.json({ message: "Profile updated successfully", user: registeredUsers[userIndex] });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
