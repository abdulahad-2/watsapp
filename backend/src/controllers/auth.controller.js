import createHttpError from "http-errors";
import { createUser, signUser } from "../services/auth.service.js";
import { generateToken, verifyToken } from "../services/token.service.js"; // Corrected imports
import { findUser } from "../services/user.service.js";
import logger from "../configs/logger.config.js";

// ✅ Register
export const register = async (req, res, next) => {
  try {
    const { name, email, picture, status, password } = req.body;

    const newUser = await createUser({
      name,
      email,
      picture,
      status,
      password,
    });

    // Generate tokens
    const access_token = await generateToken({ userId: newUser._id }, "1d", process.env.ACCESS_TOKEN_SECRET); // Corrected call
    const refresh_token = await generateToken({ userId: newUser._id }, "30d", process.env.REFRESH_TOKEN_SECRET); // Corrected call

    // ✅ Cookie set (no bullshit path)
    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/refreshtoken",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "register success.",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        picture: newUser.picture,
        status: newUser.status,
        token: access_token,
      },
    });
  } catch (error) {
    if (error.message.includes("already exist")) {
      return res.status(409).json({
        message:
          "User with this email already exists. Please try logging in or use a different email.",
      });
    }
    next(error);
  }
};

// ✅ Login
export const login = async (req, res, next) => {
  logger.info("Login attempt received.");
  try {
    const { email, password } = req.body;
    const user = await signUser(email, password);

    const access_token = await generateToken({ userId: user._id }, "1d", process.env.ACCESS_TOKEN_SECRET); // Corrected call
    const refresh_token = await generateToken({ userId: user._id }, "30d", process.env.REFRESH_TOKEN_SECRET); // Corrected call

    res.cookie("refreshtoken", refresh_token, {
      httpOnly: true,
      path: "/refreshtoken",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "login success.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        token: access_token,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    next(error);
  }
};

// ✅ Logout
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshtoken", { path: "/refreshtoken" });
    res.json({
      message: "logged out!",
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Refresh Token
export const refreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies.refreshtoken;
    if (!refresh_token) throw createHttpError.Unauthorized("Please login.");

    const check = await verifyToken(refresh_token, process.env.REFRESH_TOKEN_SECRET); // Corrected call
    if (!check) throw createHttpError.Unauthorized("Invalid refresh token.");

    const user = await findUser(check.userId);

    const access_token = await generateToken({ userId: user._id }, "1d", process.env.ACCESS_TOKEN_SECRET); // Corrected call

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        status: user.status,
        token: access_token,
      },
    });
  } catch (error) {
    next(error);
  }
};
