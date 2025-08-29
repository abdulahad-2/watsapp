import createHttpError from "http-errors";
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// data shape from controller: { sender, message, conversation, files }
export const createMessage = async (data) => {
  const payload = {
    sender_id: data.sender,
    conversation_id: data.conversation,
    content: data.message || null,
    files: data.files || [],
  };

  const { data: inserted, error } = await supabase
    .from('messages')
    .insert(payload)
    .select('*')
    .single();

  if (error || !inserted) {
    throw createHttpError.BadRequest(error?.message || 'Failed to create message');
  }
  return inserted; // has 'id'
};

export const populateMessage = async (id) => {
  const { data: msg, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(*),
      conversation:conversations(*)
    `)
    .eq('id', id)
    .single();

  if (error || !msg) {
    throw createHttpError.BadRequest(error?.message || 'Failed to fetch message');
  }
  return msg;
};

export const getConvoMessages = async (convo_id) => {
  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!messages_sender_id_fkey(*)
    `)
    .eq('conversation_id', convo_id)
    .order('created_at', { ascending: true });

  if (error) {
    throw createHttpError.BadRequest(error.message || 'Failed to fetch messages');
  }
  return messages || [];
};
