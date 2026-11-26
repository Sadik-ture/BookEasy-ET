import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : "";
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG and WebP images are allowed."));
  },
});

export function imageUpload(field) {
  return (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      if (!err) return next();
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be under 2 MB." : err.message;
      return res.status(400).json({
        success: false,
        error: { code: "UPLOAD_ERROR", message: message || "Upload failed." },
      });
    });
  };
}

export const publicUploadPath = (file) => (file ? `/uploads/${file.filename}` : "");
