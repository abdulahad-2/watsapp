import { createClient } from "@supabase/supabase-js";

// ------------------------
// Environment variables
// ------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// ------------------------
// Forcefully fix options to prevent 'headers undefined'
// ------------------------
let supabaseOptions = {
  global: { headers: {} },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
};

// If bundler renamed `global` to `globalThis`, fix it
if (!supabaseOptions.global && supabaseOptions.globalThis) {
  console.warn(
    "⚠️ globalThis found, renaming to global to prevent 'headers' error"
  );
  supabaseOptions.global = supabaseOptions.globalThis;
  delete supabaseOptions.globalThis;
}

// ------------------------
// Create Supabase client
// ------------------------
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);
  console.log("Supabase client created successfully ✅");
} catch (err) {
  console.error("🔥 Error creating Supabase client:", err);
  throw err;
}

// ------------------------
// Retry helper
// ------------------------
const withRetry = async (operation, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Retry attempt ${i + 1}/${maxRetries} failed:`, error);
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  }
  throw lastError;
};

// ------------------------
// Auth helpers
// ------------------------
export const auth = {
  signUp: async (email, password, metadata) =>
    withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      return data;
    }),

  signIn: async (email, password) =>
    withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    }),

  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

// ------------------------
// Database helpers
// ------------------------
export const db = {
  getUser: (id) =>
    withRetry(() => supabase.from("users").select("*").eq("id", id).single()),
  updateUser: (id, updates) =>
    withRetry(() => supabase.from("users").update(updates).eq("id", id)),
  searchUsers: (query) =>
    withRetry(() =>
      supabase.from("users").select("*").ilike("name", `%${query}%`)
    ),

  getUserConversations: (userId) =>
    withRetry(() =>
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
        .order("updated_at", { ascending: false })
    ),

  createConversation: (conversationData, userIds) =>
    withRetry(() =>
      supabase.rpc("create_conversation_with_users", {
        conversation_data: conversationData,
        user_ids: userIds,
      })
    ),

  getConversationMessages: (conversationId) =>
    withRetry(() =>
      supabase
        .from("messages")
        .select(`*, sender:users(*)`)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
    ),

  sendMessage: (messageData) =>
    withRetry(() =>
      supabase.from("messages").insert(messageData).select().single()
    ),

  deleteMessage: (messageId) =>
    withRetry(() =>
      supabase.from("messages").update({ deleted: true }).eq("id", messageId)
    ),

  starMessage: (messageId, starred) =>
    withRetry(() =>
      supabase.from("messages").update({ starred }).eq("id", messageId)
    ),
};

// ------------------------
// Realtime helpers
// ------------------------
export const realtime = {
  createChannel: (name, table, filter, callback) => {
    const channel = supabase
      .channel(name)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        callback
      )
      .subscribe((status) => {
        console.log(`Realtime channel '${name}' status:`, status);
        if (status === "SUBSCRIPTION_ERROR") {
          console.log(`Reconnecting to ${name}...`);
          setTimeout(() => {
            channel.unsubscribe();
            realtime.createChannel(name, table, filter, callback);
          }, 1000);
        }
      });

    return () => channel.unsubscribe();
  },

  subscribeToConversations: (userId, callback) =>
    realtime.createChannel(
      "conversations",
      "conversations",
      `conversation_users.user_id=eq.${userId}`,
      callback
    ),

  subscribeToMessages: (conversationId, callback) =>
    realtime.createChannel(
      `messages:${conversationId}`,
      "messages",
      `conversation_id=eq.${conversationId}`,
      callback
    ),

  subscribeToUserStatus: (callback) =>
    realtime.createChannel(
      "user-status",
      "users",
      "status=neq.offline",
      callback
    ),
};

// ------------------------
// Test function
// ------------------------
export const testSupabaseConnection = async () => {
  try {
    console.log("Fetching session...");
    const session = await supabase.auth.getSession();
    console.log("Session fetched ->", session);
  } catch (err) {
    console.error("Supabase auth test failed:", err);
  }
};

// ------------------------
// Export Supabase client
// ------------------------
export { supabase, withRetry };
