const express = require("express");
const {
  createCircle,
  getCircles,
  getCircleById,
  updateCircle,
  deleteCircle,
} = require("../controllers/circleController");

const router = express.Router();

router.post("/", createCircle);
router.get("/", getCircles);
router.get("/:id", getCircleById);
router.put("/:id", updateCircle);
router.delete("/:id", deleteCircle);

module.exports = router;
