const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema(
  {
    vehicleType: { type: String, required: true, unique: true },
    vehicleTypeImage: { type: String, default: null }, // Optional image field
  },
  { timestamps: true }
);

const VehicleType = mongoose.model("VehicleType", vehicleTypeSchema);

module.exports = VehicleType;
