const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema({
    Latitude: { type: Number  },
    Longitude: { type: Number }
});

const tripSchema = new mongoose.Schema({
    ID: { type: String },
    StartDateTime: { type: String,  },
    EndDateTime: { type: String },
    TravelTime: { type: String },
    Mileage: { type: String },
    StartPoint: { type: pointSchema },
    EndPoint: { type: pointSchema},
    UnitID: { type: String },
    vehicle_Name: { type: String, },
});

const tripDataSchema = new mongoose.Schema({
    data: { type: [tripSchema] },
    allDayData: { type: tripSchema }
}, { timestamps: true });
const TripModel = mongoose.model("Trip", tripDataSchema);

module.exports = TripModel;
