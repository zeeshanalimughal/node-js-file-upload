const express = require("express");
const {
  registerUser,
  loginUser,
  updatePassword,
  updateUser,
  deleteUser,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update-password", protect, updatePassword);
router.put("/update-user", protect, updateUser);
router.delete("/delete-user", protect, deleteUser);
router.get("/profile", protect, getProfile);

module.exports = router;
