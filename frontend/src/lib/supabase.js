import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are available
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseKey,
    });
    throw new Error("Missing Supabase environment variables");
  }

  return { supabaseUrl, supabaseKey };
};

// Create client with explicit options
const createSupabaseClient = () => {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "x-client-info": "whatsapp-frontend@1.0.0",
      },
    },
  };

  return createClient(supabaseUrl, supabaseKey, options);
};

// Initialize client with error handling
let supabaseClient = null;

try {
  supabaseClient = createSupabaseClient();
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Provide a more detailed error for debugging
  if (error.message.includes("headers")) {
    console.error(
      "Headers initialization failed. Check that all required configurations are loaded."
    );
  }
  throw error;
}

export const supabase = supabaseClient;

// Auth helpers
export const auth = {
  signUp: async (email, password, metadata) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: () => supabaseClient.auth.signOut(),
  getUser: () => supabaseClient.auth.getUser(),
  onAuthStateChange: (callback) =>
    supabaseClient.auth.onAuthStateChange(callback),
};

// Database helpers
export const db = {
  // Users
  getUser: (id) =>
    supabaseClient.from("users").select("*").eq("id", id).single(),
  updateUser: (id, updates) =>
    supabaseClient.from("users").update(updates).eq("id", id),
  searchUsers: (query) =>
    supabaseClient.from("users").select("*").ilike("name", `%${query}%`),

  // Conversations
  getUserConversations: (userId) =>
    supabaseClient
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
    supabaseClient.rpc("create_conversation_with_users", {
      conversation_data: conversationData,
      user_ids: userIds,
    }),

  // Messages
  getConversationMessages: (conversationId) =>
    supabaseClient
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
    supabaseClient.from("messages").insert(messageData).select().single(),

  deleteMessage: (messageId) =>
    supabaseClient
      .from("messages")
      .update({ deleted: true })
      .eq("id", messageId),

  starMessage: (messageId, starred) =>
    supabaseClient.from("messages").update({ starred }).eq("id", messageId),
};

// Real-time subscriptions
export const realtime = {
  subscribeToConversations: (userId, callback) =>
    supabaseClient
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
    supabaseClient
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
    supabaseClient
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
