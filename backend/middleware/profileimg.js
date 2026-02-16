const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");

// Use memory storage to avoid disk issues
const storage = multer.memoryStorage();

// Multer instance for both fields
const profileUpload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
}).fields([
  { name: "profileImg", maxCount: 1 },
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

    if (req.files?.profileImg && req.files.profileImg[0]) {
      const file = req.files.profileImg[0];
      const result = await uploadToCloudinary(file.buffer, {
        folder: "profile-images",
        resource_type: "image",
      });
      req.body.profileImg = result.secure_url;
    }

    next();
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Upload to Cloudinary failed", error: error.message });
  }
}

module.exports = { profileUpload, handleCloudinaryUpload };
