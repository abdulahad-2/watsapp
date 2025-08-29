import createHttpError from "http-errors";
import validator from "validator";
import { createClient } from '@supabase/supabase-js';

//env variables
const { DEFAULT_PICTURE, DEFAULT_STATUS, SUPABASE_URL } = process.env;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY');
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const createUser = async (userData) => {
  const { name, email, picture, status, password } = userData;

  //check if fields are empty
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Please fill all fields.");
  }

  //check name length
  if (
    !validator.isLength(name, {
      min: 2,
      max: 25,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make sure your name is between 2 and 25 characters."
    );
  }

  //Check status length
  if (status && status.length > 64) {
    throw createHttpError.BadRequest(
      "Please make sure your status is less than 64 characters."
    );
  }

  //check if email address is valid
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest(
      "Please make sure to provide a valid email address."
    );
  }

  //check password length
  if (
    !validator.isLength(password, {
      min: 6,
      max: 128,
    })
  ) {
    throw createHttpError.BadRequest(
      "Please make sure your password is between 6 and 128 characters."
    );
  }

  // Use Supabase auth to create user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      name,
      picture: picture || DEFAULT_PICTURE,
      status: status || DEFAULT_STATUS,
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      throw createHttpError.Conflict(
        "Please try again with a different email address, this email already exist."
      );
    }
    throw createHttpError.BadRequest(authError.message);
  }

  return authData.user;
};

export const signUser = async (email, password) => {
  // Use Supabase auth to sign in user
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password
  });

  if (error) {
    throw createHttpError.NotFound("Invalid credentials.");
  }

  return data.user;
};
