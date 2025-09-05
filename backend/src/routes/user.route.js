import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Optional Supabase client (when envs are present)
let supabase = null;
let supabaseAdmin = null;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase client initialized for user search");
  } catch (e) {
    console.warn("⚠️ Failed to init Supabase client:", e?.message || e);
    supabase = null;
  }
}
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log("✅ Supabase admin client initialized for ID lookup");
  } catch (e) {
    console.warn("⚠️ Failed to init Supabase admin client:", e?.message || e);
    supabaseAdmin = null;
  }
}

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
router.get("/search", async (req, res) => {
  const { search } = req.query;

  if (!search || search.trim().length === 0) {
    return res.json([]);
  }

  // If the search looks like a UUID (Supabase user id), prefer exact ID search
  const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    search.trim()
  );

  if (looksLikeUUID) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, picture, status")
          .eq("id", search.trim())
          .single();

        if (error && error.code !== "PGRST116") throw error; // not found vs other errors
        if (!data && supabaseAdmin) {
          // Try Supabase Auth (admin) by ID
          const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(search.trim());
          if (!authErr && authData?.user) {
            const u = authData.user;
            const mapped = {
              _id: u.id,
              name: u.user_metadata?.name || u.email?.split("@")[0],
              email: u.email,
              picture: u.user_metadata?.picture,
              status: u.user_metadata?.status || "Hey there! I am using WhatsApp.",
            };
            return res.json([mapped]);
          }
        }
        if (!data) return res.json([]);

        const user = {
          _id: data.id,
          name: data.name || data.email?.split("@")[0],
          email: data.email,
          picture: data.picture,
          status: data.status || "Hey there! I am using WhatsApp.",
        };
        return res.json([user]);
      } catch (e) {
        console.warn("Supabase ID lookup failed, falling back to memory:", e?.message || e);
      }
    }

    const found = registeredUsers.find((u) => (u._id || u.id) === search.trim());
    return res.json(found ? [found] : []);
  }

  // Prefer Supabase search if configured
  if (supabase) {
    try {
      const term = `%${search}%`;
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, picture, status")
        .or(`name.ilike.${term},email.ilike.${term}`)
        .limit(25);

      if (error) throw error;

      const mapped = (data || []).map((u) => ({
        _id: u.id,
        name: u.name || u.email?.split("@")[0],
        email: u.email,
        picture: u.picture,
        status: u.status || "Hey there! I am using WhatsApp.",
      }));

      return res.json(mapped);
    } catch (e) {
      console.warn("Supabase search failed, falling back to memory:", e?.message || e);
    }
  }

  // Fallback: filter in-memory users
  const filteredUsers = registeredUsers.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  res.json(filteredUsers);
});

// Direct lookup by ID endpoint: /users/by-id/:id
router.get("/by-id/:id", async (req, res) => {
  const id = req.params.id?.trim();
  if (!id) return res.json([]);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, picture, status")
        .eq("id", id)
        .single();

      if (error && error.code !== "PGRST116") throw error; // treat not found as empty
      if (!data && supabaseAdmin) {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.getUserById(id);
        if (!authErr && authData?.user) {
          const u = authData.user;
          const mapped = {
            _id: u.id,
            name: u.user_metadata?.name || u.email?.split("@")[0],
            email: u.email,
            picture: u.user_metadata?.picture,
            status: u.user_metadata?.status || "Hey there! I am using WhatsApp.",
          };
          return res.json([mapped]);
        }
      }
      if (!data) return res.json([]);

      const user = {
        _id: data.id,
        name: data.name || data.email?.split("@")[0],
        email: data.email,
        picture: data.picture,
        status: data.status || "Hey there! I am using WhatsApp.",
      };
      return res.json([user]);
    } catch (e) {
      console.warn("Supabase ID lookup failed:", e?.message || e);
    }
  }

  const found = registeredUsers.find((u) => (u._id || u.id) === id);
  return res.json(found ? [found] : []);
});

// Also handle GET / with search query for /api/v1/user?search=
router.get("/", async (req, res) => {
  const { search } = req.query;

  if (!search || search.trim().length === 0) {
    return res.json([]);
  }

  // If the search looks like a UUID (Supabase user id), prefer exact ID search
  const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    search.trim()
  );

  if (looksLikeUUID) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, name, email, picture, status")
          .eq("id", search.trim())
          .single();

        if (error && error.code !== "PGRST116") throw error; // not found vs other errors
        if (!data) return res.json([]);

        const user = {
          _id: data.id,
          name: data.name || data.email?.split("@")[0],
          email: data.email,
          picture: data.picture,
          status: data.status || "Hey there! I am using WhatsApp.",
        };
        return res.json([user]);
      } catch (e) {
        console.warn("Supabase ID lookup failed, falling back to memory:", e?.message || e);
      }
    }

    const found = registeredUsers.find((u) => (u._id || u.id) === search.trim());
    return res.json(found ? [found] : []);
  }

  // Prefer Supabase search if configured
  if (supabase) {
    try {
      const term = `%${search}%`;
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, picture, status")
        .or(`name.ilike.${term},email.ilike.${term}`)
        .limit(25);

      if (error) throw error;

      const mapped = (data || []).map((u) => ({
        _id: u.id,
        name: u.name || u.email?.split("@")[0],
        email: u.email,
        picture: u.picture,
        status: u.status || "Hey there! I am using WhatsApp.",
      }));

      return res.json(mapped);
    } catch (e) {
      console.warn("Supabase search failed, falling back to memory:", e?.message || e);
    }
  }

  // Fallback: filter in-memory users
  const filteredUsers = registeredUsers.filter((user) =>
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
