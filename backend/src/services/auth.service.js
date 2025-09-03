import createHttpError from "http-errors";
import validator from "validator";
import { createClient } from "@supabase/supabase-js";
import logger from "../configs/logger.config.js";

// Env variables
const { DEFAULT_PICTURE, DEFAULT_STATUS, SUPABASE_URL } = process.env;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "❌ Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY"
  );
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ✅ Register user
export const createUser = async (userData) => {
  const { name, email, picture, status, password } = userData;

  // Field validations
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all fields.");
  }

  if (!validator.isLength(name, { min: 2, max: 25 })) {
    throw createHttpError.BadRequest(
      "Please make sure your name is between 2 and 25 characters."
    );
  }

  if (status && status.length > 64) {
    throw createHttpError.BadRequest(
      "Please make sure your status is less than 64 characters."
    );
  }

  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("Please provide a valid email address.");
  }

  if (!validator.isLength(password, { min: 6, max: 128 })) {
    throw createHttpError.BadRequest(
      "Please make sure your password is between 6 and 128 characters."
    );
  }

  // Supabase: Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email: email.toLowerCase(),
    password,
    email_confirm: true, // optional: auto-confirm email
    user_metadata: {
      name,
      picture: picture || DEFAULT_PICTURE,
      status: status || DEFAULT_STATUS,
    },
  });

  if (error) {
    logger.error("Supabase createUser error:", error);

    if (
      error.message.includes("already registered") ||
      error.message.includes("duplicate")
    ) {
      throw createHttpError.Conflict(
        "User with this email already exists. Please log in instead."
      );
    }

    throw createHttpError.BadRequest(error.message);
  }

  return data.user; // return clean user object
};

// ✅ Login user
export const signUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) {
    logger.error("Supabase signUser error:", error);
    throw createHttpError.Unauthorized("Invalid credentials.");
  }

  return data.user;
};
