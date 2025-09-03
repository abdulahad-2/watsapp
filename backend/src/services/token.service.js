import { sign, verify } from "../utils/token.util.js";

// ✅ Generate JWT Token
export const generateToken = async (payload, expiresIn, secret) => {
  if (!secret) {
    throw new Error("❌ Missing JWT secret for generateToken");
  }

  try {
    const token = await sign(payload, expiresIn, secret);
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
    const check = await verify(token, secret);
    return check; // null if invalid/expired
  } catch (err) {
    console.error("❌ Error verifying token:", err.message);
    return null; // 🛡 safe return instead of crash
  }
};
