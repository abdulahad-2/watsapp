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
    console.log("REQ HEADERS:", req.headers);

    const authHeader = req.headers?.authorization;
    if (!authHeader) return next(createHttpError.Unauthorized("Authorization header missing"));

    const token = authHeader.split(" ")[1];
    if (!token) return next(createHttpError.Unauthorized("Bearer token missing"));

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

    if (error || !user) return next(createHttpError.Unauthorized("Invalid token or user not found"));

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware unexpected error:", err);
    return next(createHttpError.Unauthorized("Unexpected auth error"));
  }
}
