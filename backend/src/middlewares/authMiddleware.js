// backend/src/middleware/authMiddleware.js
import createHttpError from "http-errors";
import { createClient } from "@supabase/supabase-js";

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY"
  );
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Middleware
export default async function authMiddleware(req, res, next) {
  try {
    // Get the authorization header
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      console.error("Authorization header missing");
      return next(createHttpError.Unauthorized("Authorization header missing"));
    }

    // Extract the token
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.error("Bearer token missing");
      return next(createHttpError.Unauthorized("Bearer token missing"));
    }

    // First verify the token directly
    const {
      data: { user: sessionUser },
      error: sessionError,
    } = await supabase.auth.getUser(token);

    if (sessionError) {
      console.error("Session error:", sessionError);
      return next(createHttpError.Unauthorized("Invalid token"));
    }

    if (!sessionUser) {
      console.error("User not found in session");
      return next(createHttpError.Unauthorized("User not found"));
    }

    // Add the user and token to the request for downstream use
    req.user = sessionUser;
    req.token = token;

    next();
  } catch (err) {
    console.error("Auth middleware unexpected error:", err);
    return next(createHttpError.Unauthorized("Unexpected auth error"));
  }
}
