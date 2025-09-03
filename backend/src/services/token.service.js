import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/token.util.js";

// ✅ Generate JWT Token
export const generateToken = async (payload, expiresIn, secret) => {
  if (!secret) {
    throw new Error("❌ Missing JWT secret for generateToken");
  }

  try {
    // Dynamically choose between access and refresh token generation based on expiresIn or other criteria
    // For simplicity, I'm assuming '1d' or '15m' for access token and '30d' for refresh token
    const token = (expiresIn === "1d" || expiresIn === "15m")
      ? await generateAccessToken(payload)
      : await generateRefreshToken(payload);
    return token;
  } catch (err) {
    console.error("❌ Error generating token:", err.message);
    throw err;
  }
};

// ✅ Verify JWT Token
export const verifyToken = async (token, secret) => {
  if (!secret) {
    throw new Error("❌ Missing JWT secret for verifyToken");
  }

  try {
    // Dynamically choose between access and refresh token verification based on secret or other criteria
    const check = (secret === process.env.ACCESS_TOKEN_SECRET)
      ? await verifyAccessToken(token)
      : await verifyRefreshToken(token);
    return check; // null if invalid/expired
  } catch (err) {
    console.error("❌ Error verifying token:", err.message);
    return null; // 🛡 safe return instead of crash
  }
};
