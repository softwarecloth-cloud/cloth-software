import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

// Behind a proxy (Render/Heroku/nginx) this is needed for secure cookies and
// for express-rate-limit to see the real client IP.
app.set("trust proxy", 1);

// ======================
// Security & Middleware
// ======================
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ======================
// Database
// ======================
connectDB();

// ======================
// Routes
// ======================
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running..." });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/stock", stockRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/reports", reportRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Server error" });
});

// ======================
// Start Server
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
