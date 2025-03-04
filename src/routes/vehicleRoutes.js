const express = require("express");
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  getVehiclesByCircle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");

router.post("/", createVehicle);
router.get("/", getVehicles);
router.get("/:circleId", getVehiclesByCircle);
router.get("/:id", getVehicleById);
router.put("/:id", updateVehicle);
router.delete("/:id", deleteVehicle);

module.exports = router;
