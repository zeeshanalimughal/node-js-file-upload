const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Upload folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed."
      ),
      false
    );
  }
};

// Multer Upload Middleware
const upload = multer({ storage, fileFilter });

module.exports = { upload };
