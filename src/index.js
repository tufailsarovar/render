import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Get correct directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------
// ✅ CORS FIX (required for Render + Vercel frontend)
// ----------------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://img-uploader-tufail.vercel.app"   // your frontend domain
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight
app.options("*", cors());

// ----------------------------------------------------
// Middleware
// ----------------------------------------------------
app.use(express.json());

// ----------------------------------------------------
// Uploads folder: server/uploads
// ----------------------------------------------------
const uploadsPath = path.join(__dirname, "..", "uploads");

// Create uploads folder if missing
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Serve uploaded images
app.use("/uploads", express.static(uploadsPath));

// ----------------------------------------------------
// Routes
// ----------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "CodeX Uploader API running on Render" });
});

// ----------------------------------------------------
// Server
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
  console.log(`📁 Serving uploads from: ${uploadsPath}`);
});
