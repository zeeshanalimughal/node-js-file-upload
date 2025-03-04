const mongoose = require('mongoose');

const vtcsSchema = new mongoose.Schema({
    webData_Id: { type: Number, required: true, unique: true },
    slipID_Load: { type: String, required: true },
    loadDate: { type: String, required: true },
    loadTime: { type: String, required: true },
    emptyDate: { type: String, required: true },
    emptyTime: { type: String, required: true },
    vehicle_Name: { type: String, required: true },
    loadWeight: { type: Number, required: true },
    emptyWeight: { type: Number, required: true },
    netWeight: { type: Number, required: true },
    fWB_SlipID: { type: String, required: true },
    images: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('VTCSData', vtcsSchema);
