const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleCategory: {
      type: String,
      enum: ["Rural", "Urban"],
      required: true,
    },
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleType",
      required: true,
    },
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    vehicleName: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    ownerContact: {
      type: String,
      required: true,
    },
    vehicleCC: {
      type: String,
      required: true,
    },
    vehicleImage: {
      type: String, // Optional image URL
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
