import { createClient } from '@supabase/supabase-js'

// Use import.meta.env for Vite projects
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://cwbobklimbexftagrouh.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3Ym9ia2xpbWJleGZ0YWdyb3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MDM1MTIsImV4cCI6MjA3MTk3OTUxMn0.Ovvty8xTd3DX6KgRMjiw4WxGW6zly5RmHHKFwdl7MRQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helpers
export const auth = {
  signUp: (email, password, metadata) => 
    supabase.auth.signUp({ email, password, options: { data: metadata } }),
  
  signIn: (email, password) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => 
    supabase.auth.signOut(),
  
  getUser: () => 
    supabase.auth.getUser(),
  
  onAuthStateChange: (callback) => 
    supabase.auth.onAuthStateChange(callback)
}

// Database helpers
export const db = {
  // Users
  getUser: (id) => 
    supabase.from('users').select('*').eq('id', id).single(),
  
  updateUser: (id, updates) => 
    supabase.from('users').update(updates).eq('id', id),
  
  searchUsers: (query) => 
    supabase.from('users').select('*').ilike('name', `%${query}%`),
  
  // Conversations
  getUserConversations: (userId) => 
    supabase
      .from('conversations')
      .select(`
        *,
        conversation_users!inner(user_id),
        users:conversation_users(users(*)),
        messages:latest_message_id(*)
      `)
      .eq('conversation_users.user_id', userId)
      .order('updated_at', { ascending: false }),
  
  createConversation: (conversationData, userIds) => 
    supabase.rpc('create_conversation_with_users', {
      conversation_data: conversationData,
      user_ids: userIds
    }),
  
  // Messages
  getConversationMessages: (conversationId) => 
    supabase
      .from('messages')
      .select(`
        *,
        sender:users(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true }),
  
  sendMessage: (messageData) => 
    supabase.from('messages').insert(messageData).select().single(),
  
  deleteMessage: (messageId) => 
    supabase.from('messages').update({ deleted: true }).eq('id', messageId),
  
  starMessage: (messageId, starred) => 
    supabase.from('messages').update({ starred }).eq('id', messageId)
}

// Real-time subscriptions
export const realtime = {
  subscribeToConversations: (userId, callback) => 
    supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `conversation_users.user_id=eq.${userId}`
      }, callback)
      .subscribe(),
  
  subscribeToMessages: (conversationId, callback) => 
    supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe(),
  
  subscribeToUserStatus: (callback) => 
    supabase
      .channel('user-status')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'status=neq.offline'
      }, callback)
      .subscribe()
}
