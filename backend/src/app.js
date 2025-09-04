import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import fileUpload from "express-fileupload";
import cors from "cors";
import createHttpError from "http-errors";
import routes from "./routes/index.js";

const app = express();

// Logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Security
app.use(helmet());

// JSON + URL parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies + Compression
app.use(cookieParser());
app.use(compression());

// File upload (5MB)
app.use(fileUpload({ useTempFiles: true, limits: { fileSize: 5 * 1024 * 1024 } }));

// ✅ Allowed origins
const allowedOrigins = [
  process.env.CORS_ORIGIN || "http://localhost:3000",
  "https://chatapp-9owodedez-abdulahad-2s-projects.vercel.app",
  "https://chatapp-git-main-abdulahad-2s-projects.vercel.app",
  "https://chatapp-rho-six.vercel.app",
  "https://watsapp-mu.vercel.app",
];

// CORS - function is more reliable than array
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  })
);

// API routes
app.use("/", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// 404 handler
app.use((req, res, next) => next(createHttpError.NotFound("This route does not exist.")));

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: { status: err.status || 500, message: err.message },
  });
});

export default app;
