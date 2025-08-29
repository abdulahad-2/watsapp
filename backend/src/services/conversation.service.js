import createHttpError from "http-errors";
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, DEFAULT_GROUP_PICTURE } = process.env;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const doesConversationExist = async (sender_id, receiver_id) => {
  // Find conversations (non-group) that include sender
  const { data: senderConvos, error: e1 } = await supabase
    .from('conversation_users')
    .select('conversation_id, conversations!inner(is_group)')
    .eq('user_id', sender_id)
    .eq('conversations.is_group', false);
  if (e1) throw createHttpError.BadRequest(e1.message);

  const convoIds = (senderConvos || []).map(r => r.conversation_id);
  if (convoIds.length === 0) return null;

  // Intersect with conversations that include receiver
  const { data: receiverConvos, error: e2 } = await supabase
    .from('conversation_users')
    .select('conversation_id')
    .in('conversation_id', convoIds)
    .eq('user_id', receiver_id);
  if (e2) throw createHttpError.BadRequest(e2.message);

  const existingId = (receiverConvos || [])[0]?.conversation_id;
  if (!existingId) return null;

  // Populate conversation with users and latest message sender
  const { data: convo, error: e3 } = await supabase
    .from('conversations')
    .select(`
      *,
      users:conversation_users(users(*)),
      latest_message:messages!conversations_latest_message_id_fkey(*, sender:users(*))
    `)
    .eq('id', existingId)
    .single();
  if (e3) throw createHttpError.BadRequest(e3.message);
  return convo;
};

export const createConversation = async (data) => {
  // data may contain: name, picture, isGroup, users, admin
  const payload = {
    name: data.name || null,
    picture: data.picture || (data.isGroup ? DEFAULT_GROUP_PICTURE : null),
    is_group: !!data.isGroup,
    admin_id: data.admin || null,
  };

  const { data: convo, error } = await supabase
    .from('conversations')
    .insert(payload)
    .select('*')
    .single();
  if (error || !convo) throw createHttpError.BadRequest(error?.message || 'Failed to create conversation');

  // Insert members
  const members = data.users || [];
  if (members.length) {
    const rows = members.map(uid => ({ conversation_id: convo.id, user_id: uid }));
    const { error: e2 } = await supabase.from('conversation_users').insert(rows);
    if (e2) throw createHttpError.BadRequest(e2.message);
  }
  return convo;
};

export const populateConversation = async (id, _fieldToPopulate, _fieldsToRemove) => {
  // Return conversation with users and admin data
  const { data: convo, error } = await supabase
    .from('conversations')
    .select(`
      *,
      admin:users!conversations_admin_id_fkey(*),
      users:conversation_users(users(*))
    `)
    .eq('id', id)
    .single();
  if (error || !convo) throw createHttpError.BadRequest(error?.message || 'Failed to populate conversation');
  return convo;
};
export const getUserConversations = async (user_id) => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      users:conversation_users!inner(user_id),
      members:conversation_users(users(*)),
      latest_message:messages!conversations_latest_message_id_fkey(*, sender:users(*))
    `)
    .eq('users.user_id', user_id)
    .order('updated_at', { ascending: false });
  if (error) throw createHttpError.BadRequest(error.message);
  return data || [];
};

export const updateLatestMessage = async (convo_id, msg) => {
  const { error } = await supabase
    .from('conversations')
    .update({ latest_message_id: msg.id })
    .eq('id', convo_id);
  if (error) throw createHttpError.BadRequest(error.message);
  return { success: true };
};
