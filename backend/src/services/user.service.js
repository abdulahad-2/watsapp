import createHttpError from "http-errors";
import { createClient } from '@supabase/supabase-js';

const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const findUser = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !user) throw createHttpError.BadRequest(error?.message || 'User not found');
  return user;
};

export const searchUsers = async (keyword, userId) => {
  // Search by name or email (case-insensitive) and exclude current user
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
    .neq('id', userId);
  if (error) throw createHttpError.BadRequest(error.message);
  return data || [];
};
