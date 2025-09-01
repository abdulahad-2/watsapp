import { createClient } from "@supabase/supabase-js";

// Debug logging for environment variables
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "Supabase Key:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "Loaded ✅" : "MISSING ❌"
);
console.log("All env variables:", import.meta.env);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Function to safely access environment variables
const getEnvVar = (key) => {
  const value = import.meta.env[key];
  if (!value) {
    console.warn(`Missing environment variable: ${key}`);
  }
  return value;
};

// Create a function to initialize the client with retries
const createSupabaseClient = () => {
  let retries = 0;
  const maxRetries = 3;

  const initialize = () => {
    try {
      if (!window) {
        console.warn("Window object not available");
        return null;
      }

      const options = {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          storage: window.localStorage,
          storageKey: "watsapp_auth",
        },
        global: {
          fetch: (...args) => fetch(...args),
          headers: { "x-application-name": "watsapp" },
        },
      };

      const client = createClient(supabaseUrl, supabaseKey, options);

      // Test the client
      client.auth.getSession().catch((err) => {
        console.warn("Initial session check failed:", err);
      });

      return client;
    } catch (error) {
      console.error(
        `Supabase client initialization attempt ${retries + 1} failed:`,
        error
      );

      if (retries < maxRetries) {
        retries++;
        return initialize();
      }

      console.error(
        "Failed to initialize Supabase client after",
        maxRetries,
        "attempts"
      );
      return null;
    }
  };

  return initialize();
};

// Initialize the client
const supabase = createSupabaseClient();

export { supabase };

// Auth helpers
export const auth = {
  signUp: (email, password, metadata) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } }),

  signIn: (email, password) =>
    supabase.auth.signInWithPassword({ email, password }),

  signOut: () => supabase.auth.signOut(),

  getUser: () => supabase.auth.getUser(),

  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
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
