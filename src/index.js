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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ uploads folder: server/uploads
const uploadsPath = path.join(__dirname, "..", "uploads");

// ensure uploads exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// middlewares
import cors from "cors";

// ...

app.use(
  cors({
    origin: [
      "http://localhost:5173",                     // local dev
      "https://img-uploader-tufail.vercel.app/"    // your Vercel frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());


// (optional but sometimes helps with preflight)
app.options("*", cors());


app.use(express.json());

// ✅ serve images from /uploads
app.use("/uploads", express.static(uploadsPath));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

// root
app.get("/", (req, res) => {
  res.json({ message: "CodeX Uploader API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Serving uploads from:", uploadsPath);
});
