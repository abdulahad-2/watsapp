import createHttpError from "http-errors";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL } = process.env;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY"
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function authMiddleware(req, res, next) {
  try {
    // ✅ Debugging log: check headers
    console.log("REQ HEADERS:", req.headers);

    // Optional chaining + existence check
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      console.warn("Authorization header missing");
      return next(createHttpError.Unauthorized());
    }

    // Bearer token extraction
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.warn("Bearer token missing in Authorization header");
      return next(createHttpError.Unauthorized());
    }

    // Supabase user validation
    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

    if (error || !user) {
      console.warn("Supabase auth failed or user not found", error);
      return next(createHttpError.Unauthorized());
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware unexpected error:", err);
    return next(createHttpError.Unauthorized());
  }
}
