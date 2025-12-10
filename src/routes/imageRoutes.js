import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { auth } from "../middleware/auth.js";
import Image from "../models/Image.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ same folder as index.js: server/uploads
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

// ensure exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext); // e.g. 1712345678-12345.png
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// upload
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("Saved image URL:", publicUrl); // 🔍 see this in terminal

    const imageDoc = await Image.create({
      owner: req.user.id,
      publicUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({
      message: "Image uploaded",
      image: {
        id: imageDoc._id,
        url: imageDoc.publicUrl,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// list mine
router.get("/mine", auth, async (req, res) => {
  try {
    const images = await Image.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ images });
  } catch (err) {
    console.error("Fetch images error:", err);
    res.status(500).json({ message: "Failed to fetch images" });
  }
});

// delete
router.delete("/:id", auth, async (req, res) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, owner: req.user.id });
    if (!image) return res.status(404).json({ message: "Image not found" });

    const filePath = path.join(uploadsDir, image.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await image.deleteOne();
    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error("Delete image error:", err);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

export default router;
