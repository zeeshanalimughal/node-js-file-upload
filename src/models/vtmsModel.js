const mongoose = require("mongoose");

const vtmsSchema = new mongoose.Schema({
    UnitMasterID: { type: String, required: true },
    UnitID: { type: String, required: true },
    Alias: { type: String, required: true },
    Reason: { type: String,  },
    LandMark: { type: String, },
    Speed: {  type: Number, required: true},
    RecordDateTime: { type: String, required: true }
}, { timestamps: true }); // Adds createdAt & updatedAt fields

const VtmsModel = mongoose.model("VtmsModel", vtmsSchema);

module.exports = VtmsModel;
