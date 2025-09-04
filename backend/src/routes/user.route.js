import express from "express";

const router = express.Router();

// In-memory storage for registered users (in real app, this would be a database)
let registeredUsers = [];

// Add user to registered users list (called from auth routes)
router.addUser = (user) => {
  // Check if user already exists
  const existingUser = registeredUsers.find(u => u.email === user.email);
  if (!existingUser) {
    registeredUsers.push({
      _id: user.id || Date.now().toString(),
      name: user.name,
      email: user.email,
      picture: user.picture,
      status: user.status || "Hey there! I am using WhatsApp."
    });
  }
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

export default router;
