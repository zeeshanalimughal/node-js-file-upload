const mongoose = require("mongoose");

const circleSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true },
    ownerContact: { type: String, required: true },
    circleName: { type: String, required: true },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    area: { type: String, required: false },
  },
  { timestamps: true }
);

const Circle = mongoose.model("Circle", circleSchema);

module.exports = Circle;
