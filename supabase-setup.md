# WhatsApp Clone Migration to Supabase + Vercel

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Create new project
4. Choose region closest to you
5. Set strong database password
6. Wait for project to initialize (~2 minutes)

## Step 2: Database Schema Setup

Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  picture TEXT DEFAULT '',
  status TEXT DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  picture TEXT DEFAULT '',
  is_group BOOLEAN DEFAULT false,
  admin_id UUID REFERENCES users(id),
  latest_message_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation participants junction table
CREATE TABLE conversation_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  files JSONB DEFAULT '[]',
  deleted BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for latest_message_id
ALTER TABLE conversations 
ADD CONSTRAINT fk_latest_message 
FOREIGN KEY (latest_message_id) REFERENCES messages(id);

-- Indexes for performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_conversation_users_user_id ON conversation_users(user_id);
CREATE INDEX idx_conversation_users_conversation_id ON conversation_users(conversation_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data and users in their conversations
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can read conversations they're part of
CREATE POLICY "Users can read own conversations" ON conversations FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM conversation_users 
  WHERE conversation_id = conversations.id AND user_id = auth.uid()
));

-- Users can read conversation_users for conversations they're in
CREATE POLICY "Users can read conversation participants" ON conversation_users FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_users cu2 
  WHERE cu2.conversation_id = conversation_users.conversation_id AND cu2.user_id = auth.uid()
));

-- Users can read messages from conversations they're part of
CREATE POLICY "Users can read conversation messages" ON messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM conversation_users 
  WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
));

-- Users can insert messages to conversations they're part of
CREATE POLICY "Users can send messages" ON messages FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM conversation_users 
  WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
) AND sender_id = auth.uid());
```

## Step 3: Get Supabase Credentials

From your Supabase project dashboard:
1. Go to Settings → API
2. Copy:
   - Project URL
   - Project API Key (anon/public)
   - Service Role Key (for server-side operations)

## Next Steps

After completing database setup, we'll:
1. Install Supabase client in both frontend and backend
2. Replace MongoDB/Mongoose with Supabase queries
3. Update authentication to use Supabase Auth
4. Replace Socket.io with Supabase real-time
5. Deploy to Vercel
