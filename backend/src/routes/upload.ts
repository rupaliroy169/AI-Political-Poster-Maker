import { Router, Response, NextFunction } from "express";
import multer from "multer";
import { authenticateToken, AuthRequest } from "../middleware/auth.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const router = Router();

// Memory storage for direct buffer stream upload to Cloudinary
const storage = multer.memoryStorage();

// File filter to allow only image files
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 3, // Maximum 3 files
  },
});

// Protect all upload routes with JWT authentication
router.use(authenticateToken);

// Multer error handling wrapper
const uploadMiddleware = (req: any, res: any, next: NextFunction) => {
  upload.array("photos", 3)(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File size cannot exceed 5MB" });
        }
        if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ message: "You can upload a maximum of 3 images" });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || "File upload validation error" });
    }
    next();
  });
};

// POST /api/upload - Upload up to 3 image files to Cloudinary
router.post(
  "/",
  uploadMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          message: "Please select at least one image file to upload (field name: 'photos')",
        });
        return;
      }

      if (files.length > 3) {
        res.status(400).json({
          message: "A maximum of 3 images are allowed",
        });
        return;
      }

      // Check if Cloudinary credentials are configured
      if (
        !process.env.CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET
      ) {
        res.status(500).json({
          message: "Cloudinary credentials are not configured in environment variables",
        });
        return;
      }

      // Upload all files to Cloudinary
      const uploadPromises = files.map((file) => uploadToCloudinary(file.buffer));
      const urls = await Promise.all(uploadPromises);

      res.status(200).json({
        message: "Images uploaded successfully",
        count: urls.length,
        urls,
      });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({
        message: error.message || "Failed to upload image(s) to Cloudinary",
      });
    }
  }
);

export default router;
