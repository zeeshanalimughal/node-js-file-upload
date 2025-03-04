const mongoose = require("mongoose");

const petrolSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    oil: {
      type: String,
      enum: ["Petrol", "Diesel"],
      required: true,
    },
    slipId: {
      type: String
    },
    amount: {
      type: Number,
      required: true,
    },
    slipImage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Petrol", petrolSchema);
