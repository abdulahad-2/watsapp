import createHttpError from "http-errors";
import logger from "../configs/logger.config.js";
// NOTE: Community features pending Supabase migration. Mongoose removed.

export const createCommunity = async (req, res, next) => {
  try {
    return res.status(501).json({ error: "Communities not implemented yet (Supabase migration in progress)" });
  } catch (error) {
    next(error);
  }
};

export const getCommunities = async (req, res, next) => {
  try {
    return res.status(501).json({ error: "Communities not implemented yet (Supabase migration in progress)" });
  } catch (error) {
    next(error);
  }
};

export const joinCommunity = async (req, res, next) => {
  try {
    return res.status(501).json({ error: "Communities not implemented yet (Supabase migration in progress)" });
  } catch (error) {
    next(error);
  }
};

export const leaveCommunity = async (req, res, next) => {
  try {
    return res.status(501).json({ error: "Communities not implemented yet (Supabase migration in progress)" });
  } catch (error) {
    next(error);
  }
};
