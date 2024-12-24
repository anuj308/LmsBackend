import dotenv from "dotenv";
import morgan from "morgan";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again later",
});

// security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(hpp());
app.use("/api", limiter);

// logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Body Parser Middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.stack || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// cors configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "htpp://localhost:5173",
    credential: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "device-Control-Allow-Origin",
      "Origin",
      "Accept",
    ],
  })
);

//Api routes

// 404 handler allway in botttom of code
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found !!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT} in ${process.env.NODE_ENV} mode`);
});
