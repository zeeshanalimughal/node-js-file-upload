const Vehicle = require("../models/vehicleModel");
const Petrol = require("../models/petrolModel");
const createVehicle = async (req, res) => {
  try {
    const {
      vehicleCategory,
      vehicleTypeId,
      vehicleName,
      ownerName,
      ownerContact,
      vehicleCC,
      vehicleImage,
      circleId,
    } = req.body;

    // Validate required fields
    if (
      !vehicleCategory ||
      !vehicleTypeId ||
      !vehicleName ||
      !ownerName ||
      !ownerContact ||
      !vehicleCC||
      !circleId
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    const newVehicle = new Vehicle({
      vehicleCategory,
      vehicleTypeId,
      vehicleName,
      ownerName,
      ownerContact,
      vehicleCC,
      vehicleImage,
      circleId
    });

    await newVehicle.save();

    res
      .status(201)
      .json({ message: "Vehicle created successfully", vehicle: newVehicle });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate("vehicleTypeId").populate("circleId");
    res.status(200).json({ vehicles });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).populate("vehicleTypeId");

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ vehicle });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const getVehiclesByCircle = async (req, res) => {
    try {
        const { circleId } = req.params; // Assuming circleId is passed in the URL

        if (!circleId) {
            return res.status(400).json({ success: false, message: "circleId is required" });
        }

        const vehicles = await Vehicle.find({ circleId }).populate("vehicleTypeId");

        res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleCategory,
      vehicleTypeId,
      vehicleName,
      ownerName,
      ownerContact,
      vehicleCC,
      vehicleImage,
    } = req.body;

    // Check if the vehicle exists
    let vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Update vehicle details
    vehicle.vehicleCategory = vehicleCategory || vehicle.vehicleCategory;
    vehicle.vehicleTypeId = vehicleTypeId || vehicle.vehicleTypeId;
    vehicle.vehicleName = vehicleName || vehicle.vehicleName;
    vehicle.ownerName = ownerName || vehicle.ownerName;
    vehicle.ownerContact = ownerContact || vehicle.ownerContact;
    vehicle.vehicleCC = vehicleCC || vehicle.vehicleCC;
    vehicle.vehicleImage = vehicleImage || vehicle.vehicleImage;

    await vehicle.save();

    res.status(200).json({ message: "Vehicle updated successfully", vehicle });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the vehicleTypeId is used in Vehicles
    const vehiclesUsingType = await Petrol.findOne({ vehicleId: id });

    if (vehiclesUsingType) {
      return res.status(400).json({
        message:
          "Cannot delete Vehicle as it is assigned to one or more vehicles.",
      });
    }
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    await Vehicle.findByIdAndDelete(id);
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  getVehiclesByCircle,
  updateVehicle,
  deleteVehicle,
};
