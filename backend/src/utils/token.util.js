import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;

// Access token generate
export const generateAccessToken = async (payload) => {
  return await sign(
    payload,
    process.env.JWT_ACCESS_EXPIRATION || "15m",
    process.env.ACCESS_TOKEN_SECRET
  );
};

// Refresh token generate
export const generateRefreshToken = async (payload) => {
  return await sign(
    payload,
    process.env.JWT_REFRESH_EXPIRATION || "7d",
    process.env.REFRESH_TOKEN_SECRET
  );
};

// Verify Access Token
export const verifyAccessToken = async (token) => {
  return await verify(token, process.env.ACCESS_TOKEN_SECRET);
};

// Verify Refresh Token
export const verifyRefreshToken = async (token) => {
  return await verify(token, process.env.REFRESH_TOKEN_SECRET);
};
