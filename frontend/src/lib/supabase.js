import { createClient } from "@supabase/supabase-js";

class SupabaseClientSingleton {
  constructor() {
    if (SupabaseClientSingleton.instance) {
      return SupabaseClientSingleton.instance;
    }
    SupabaseClientSingleton.instance = this;
    this.client = null;
  }

  initialize() {
    if (this.client) {
      return this.client;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        `Missing environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseKey}`
      );
    }

    try {
      this.client = createClient(supabaseUrl, supabaseKey, {
        db: {
          schema: "public",
        },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });

      return this.client;
    } catch (error) {
      console.error("Supabase client initialization error:", error);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      return this.initialize();
    }
    return this.client;
  }
}

const supabaseInstance = new SupabaseClientSingleton();
export const supabase = supabaseInstance.getClient();

// Auth helpers
export const auth = {
  signUp: async (email, password, metadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Auth signup error:", error);
      throw error;
    }
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
