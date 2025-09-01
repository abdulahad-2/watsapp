import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase Configuration:", {
    url: supabaseUrl ? "Available" : "Missing",
    key: supabaseKey ? "Available" : "Missing",
  });
  throw new Error("Missing Supabase environment variables");
}

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize session handling
const initializeSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error.message);
      return null;
    }

    if (session) {
      console.log("Initial session found");
      // Set up session refresh
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          console.log("User signed out");
        } else if (event === "SIGNED_IN") {
          console.log("User signed in");
        } else if (event === "TOKEN_REFRESHED") {
          console.log("Session refreshed");
        }
      });
      return session;
    } else {
      console.log("No initial session found");
      return null;
    }
  } catch (err) {
    console.error("Session initialization error:", err);
    return null;
  }
};

// Initialize session
initializeSession();

export { supabase };

// Auth helpers
export const auth = {
  signUp: async (email, password, metadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign up error:", error.message);
      throw error;
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Sign in error:", error.message);
      throw error;
    }
  },

  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Sign out error:", error.message);
      throw error;
    }
  },

  getUser: async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error("Get user error:", error.message);
      throw error;
    }
  },

  onAuthStateChange: (callback) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error("Auth state change subscription error:", error.message);
      throw error;
    }
  },

  refreshSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error("Session refresh error:", error.message);
      throw error;
    }
  },
};

// Database helpers
export const db = {
  // Users
  getUser: (id) => supabase.from("users").select("*").eq("id", id).single(),

  updateUser: (id, updates) =>
    supabase.from("users").update(updates).eq("id", id),

  searchUsers: (query) =>
    supabase.from("users").select("*").ilike("name", `%${query}%`),

  // Conversations
  getUserConversations: (userId) =>
    supabase
      .from("conversations")
      .select(
        `
        *,
        conversation_users!inner(user_id),
        users:conversation_users(users(*)),
        messages:latest_message_id(*)
      `
      )
      .eq("conversation_users.user_id", userId)
      .order("updated_at", { ascending: false }),

  createConversation: (conversationData, userIds) =>
    supabase.rpc("create_conversation_with_users", {
      conversation_data: conversationData,
      user_ids: userIds,
    }),

  // Messages
  getConversationMessages: (conversationId) =>
    supabase
      .from("messages")
      .select(
        `
        *,
        sender:users(*)
      `
      )
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),

  sendMessage: (messageData) =>
    supabase.from("messages").insert(messageData).select().single(),

  deleteMessage: (messageId) =>
    supabase.from("messages").update({ deleted: true }).eq("id", messageId),

  starMessage: (messageId, starred) =>
    supabase.from("messages").update({ starred }).eq("id", messageId),
};

// Real-time subscriptions
export const realtime = {
  subscribeToConversations: (userId, callback) =>
    supabase
      .channel("conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `conversation_users.user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe(),

  subscribeToMessages: (conversationId, callback) =>
    supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        callback
      )
      .subscribe(),

  subscribeToUserStatus: (callback) =>
    supabase
      .channel("user-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: "status=neq.offline",
        },
        callback
      )
      .subscribe(),
};
