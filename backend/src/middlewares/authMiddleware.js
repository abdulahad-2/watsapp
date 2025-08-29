import createHttpError from "http-errors";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function (req, res, next) {
  if (!req.headers["authorization"])
    return next(createHttpError.Unauthorized());
  
  const bearerToken = req.headers["authorization"];
  const token = bearerToken.split(" ")[1];
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return next(createHttpError.Unauthorized());
    }
    
    req.user = user;
    next();
  } catch (error) {
    return next(createHttpError.Unauthorized());
  }
}
