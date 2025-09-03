import createHttpError from "http-errors";
import { createUser, signUser } from "../services/auth.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";
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
    const access_token = await generateAccessToken({ userId: newUser._id });
    const refresh_token = await generateRefreshToken({ userId: newUser._id });

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

    const access_token = await generateAccessToken({ userId: user._id });
    const refresh_token = await generateRefreshToken({ userId: user._id });

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

    const check = await verifyRefreshToken(refresh_token);
    if (!check) throw createHttpError.Unauthorized("Invalid refresh token.");

    const user = await findUser(check.userId);

    const access_token = await generateAccessToken({ userId: user._id });

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
