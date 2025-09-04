import express from "express";

const router = express.Router();

// Mock users for testing
const mockUsers = [
  {
    _id: "user1",
    name: "John Doe",
    email: "john@example.com",
    picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    status: "Available"
  },
  {
    _id: "user2", 
    name: "Jane Smith",
    email: "jane@example.com",
    picture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    status: "Busy"
  },
  {
    _id: "user3",
    name: "Ahmed Ali", 
    email: "ahmed@example.com",
    picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    status: "Hey there! I am using WhatsApp."
  },
  {
    _id: "user4",
    name: "Sarah Johnson",
    email: "sarah@example.com", 
    picture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    status: "Online"
  }
];

// User search route - supports both /search and query params
router.get("/search", (req, res) => {
  const { search } = req.query;
  
  if (!search || search.trim().length === 0) {
    return res.json([]);
  }
  
  // Filter users based on search term (name or email)
  const filteredUsers = mockUsers.filter(user => 
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
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  res.json(filteredUsers);
});

export default router;
