import createHttpError from "http-errors";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL } = process.env;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase configuration: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function (req, res, next) {
  try {
    if (!req.headers?.authorization) {
      return next(createHttpError.Unauthorized());
    }

    const bearerToken = req.headers.authorization;
    const token = bearerToken.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;

    if (error || !user) {
      return next(createHttpError.Unauthorized());
    }

    req.user = user;
    next();
  } catch (err) {
    return next(createHttpError.Unauthorized());
  }
}
