const express = require("express");
const router = express.Router();
const {
  createVehicleType,
  getAllVehicleTypes,
  getVehicleTypeById,
  updateVehicleType,
  deleteVehicleType,
} = require("../controllers/vehicleTypeController");

router.post("/", createVehicleType);
router.get("/", getAllVehicleTypes);
router.get("/:id", getVehicleTypeById);
router.put("/:id", updateVehicleType);
router.delete("/:id", deleteVehicleType);

module.exports = router;
