const express = require("express");
const { uploadImage } = require("../controllers/uploadController");
const { upload } = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;
