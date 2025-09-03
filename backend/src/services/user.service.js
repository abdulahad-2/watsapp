import createHttpError from "http-errors";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL } = process.env;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "❌ Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ✅ Get single user by ID
export const findUser = async (userId) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !user) {
    console.error("❌ findUser error:", error?.message);
    throw createHttpError.NotFound("User not found");
  }

  return user;
};

// ✅ Search users by name/email, exclude current user
export const searchUsers = async (keyword, userId) => {
  if (!keyword || keyword.trim() === "") {
    return []; // Empty keyword => no results
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
    .neq("id", userId);

  if (error) {
    console.error("❌ searchUsers error:", error.message);
    throw createHttpError.BadRequest(error.message);
  }

  return data || [];
};
