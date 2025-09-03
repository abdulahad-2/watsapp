// backend/src/middleware/authMiddleware.js
import createHttpError from "http-errors";
import { createClient } from "@supabase/supabase-js";

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // ✅ Use anon key for auth

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("❌ Missing Supabase config: SUPABASE_URL or SUPABASE_ANON_KEY");
}

// Create Supabase client (anon key, safe for token verification)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Middleware
export default async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("❌ Authorization header invalid or missing");
      return next(createHttpError.Unauthorized("Authorization header missing"));
    }

    // Extract token after "Bearer "
    const token = authHeader.split(" ")[1]?.trim();
    if (!token) {
      console.error("❌ Bearer token missing");
      return next(createHttpError.Unauthorized("Bearer token missing"));
    }

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      console.error("❌ Supabase session error:", error.message);
      return next(createHttpError.Unauthorized("Invalid or expired token"));
    }

    if (!user) {
      console.error("❌ User not found in token");
      return next(createHttpError.Unauthorized("User not found"));
    }

    // Attach user + token to request
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error("❌ Auth middleware crashed:", err.message);
    return next(createHttpError.Unauthorized("Unexpected auth error"));
  }
}
