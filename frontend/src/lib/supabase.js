import { createClient } from "@supabase/supabase-js";

// ------------------------
// 🔥 Debug: Check environment variables
// ------------------------
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("Debug: Supabase URL ->", supabaseUrl);
console.log("Debug: Supabase Key ->", supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error("Environment variables missing!");
  throw new Error("Missing Supabase environment variables");
}

// ------------------------
// 🔥 Debug: Supabase client options
// ------------------------
const supabaseOptions = {
  global: { headers: {} }, // ensures 'headers' exists
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
};

console.log("Debug: Supabase client options ->", supabaseOptions);

// ------------------------
// 🔥 Create the Supabase client
// ------------------------
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);
  console.log("Debug: Supabase client created successfully!", supabase);
} catch (err) {
  console.error("🔥 Error creating Supabase client:", err);
  throw err;
}

// 🔹 Retry helper
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
// 🔹 Auth helpers
// ------------------------
export const auth = {
  signUp: async (email, password, metadata) => {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      return data;
    });
  },

  signIn: async (email, password) => {
    return withRetry(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    });
  },

  signOut: () => supabase.auth.signOut(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
};

// ------------------------
// 🔹 Database helpers
// ------------------------
export const db = {
  // Users
  getUser: (id) =>
    withRetry(() => supabase.from("users").select("*").eq("id", id).single()),
  updateUser: (id, updates) =>
    withRetry(() => supabase.from("users").update(updates).eq("id", id)),
  searchUsers: (query) =>
    withRetry(() =>
      supabase.from("users").select("*").ilike("name", `%${query}%`)
    ),

  // Conversations
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

  // Messages
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
// 🔹 Realtime subscriptions
// ------------------------
export const realtime = {
  createChannel: (name, table, filter, callback) => {
    const channel = supabase
      .channel(name)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter,
        },
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
// 🔹 Debug: Test function to verify client works
// ------------------------
export const testSupabaseConnection = async () => {
  try {
    console.log("Debug: Fetching session...");
    const session = await supabase.auth.getSession();
    console.log("Debug: Session fetched ->", session);
  } catch (err) {
    console.error("🔥 Supabase auth test failed:", err);
  }
};

// ------------------------
// 🔹 Export Supabase client and retry helper
// ------------------------
export { supabase, withRetry };
