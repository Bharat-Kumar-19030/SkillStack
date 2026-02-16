const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");

// Use memory storage to avoid disk issues
const storage = multer.memoryStorage();

// Multer instance for both fields
const projectUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "demoVideo", maxCount: 1 },
]);

// Custom handler to upload to Cloudinary from buffer
async function handleCloudinaryUpload(req, res, next) {
  try {
    const uploadToCloudinary = (buffer, options) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        uploadStream.end(buffer);
      });
    };

    if (req.files?.thumbnail && req.files.thumbnail[0]) {
      const file = req.files.thumbnail[0];
      const result = await uploadToCloudinary(file.buffer, {
        folder: "student-projects/thumbnails",
        resource_type: "image",
      });
      req.body.thumbnailUrl = result.secure_url;
      console.log("Uploaded thumbnail:", result.secure_url);
    }

    if (req.files?.demoVideo && req.files.demoVideo[0]) {
      const file = req.files.demoVideo[0];
      const result = await uploadToCloudinary(file.buffer, {
        folder: "student-projects/videos",
        resource_type: "video",
        chunk_size: 6000000, // 6MB chunks for large files
        timeout: 600000, // 10 minutes timeout
      });
      req.body.demoVideoUrl = result.secure_url;
      console.log("Uploaded demo video:", result.secure_url);
    }

    next();
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Upload to Cloudinary failed", error: error.message });
  }
}

module.exports = { projectUpload, handleCloudinaryUpload };
