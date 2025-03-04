const VehicleType = require("../models/vehicleTypeModel");
const Vehicle = require("../models/vehicleModel");

const createVehicleType = async (req, res) => {
  try {
    const { vehicleType, vehicleTypeImage } = req.body;

    if (!vehicleType) {
      return res.status(400).json({ message: "Vehicle Type is required." });
    }

    // Check if vehicle type already exists
    const existingType = await VehicleType.findOne({ vehicleType });
    if (existingType) {
      return res.status(400).json({ message: "Vehicle Type already exists." });
    }

    const newVehicleType = new VehicleType({
      vehicleType,
      vehicleTypeImage,
    });

    await newVehicleType.save();
    res.status(201).json({
      message: "Vehicle Type created successfully",
      vehicleType: newVehicleType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = await VehicleType.find();
    res.status(200).json(vehicleTypes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getVehicleTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleType = await VehicleType.findById(id);

    if (!vehicleType) {
      return res.status(404).json({ message: "Vehicle Type not found." });
    }

    res.status(200).json(vehicleType);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateVehicleType = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicleType, vehicleTypeImage } = req.body;

    // Prevent updating with an existing vehicleType name
    const existingType = await VehicleType.findOne({ vehicleType });
    if (existingType && existingType.id !== id) {
      return res
        .status(400)
        .json({ message: "Vehicle Type name already exists." });
    }

    const updatedVehicleType = await VehicleType.findByIdAndUpdate(
      id,
      { vehicleType, vehicleTypeImage },
      { new: true }
    );

    if (!updatedVehicleType) {
      return res.status(404).json({ message: "Vehicle Type not found." });
    }

    res.status(200).json({
      message: "Vehicle Type updated successfully",
      vehicleType: updatedVehicleType,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteVehicleType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the vehicleTypeId is used in Vehicles
    const vehiclesUsingType = await Vehicle.findOne({ vehicleTypeId: id });

    if (vehiclesUsingType) {
      return res.status(400).json({
        message:
          "Cannot delete Vehicle Type as it is assigned to one or more vehicles.",
      });
    }

    const deletedVehicleType = await VehicleType.findByIdAndDelete(id);

    if (!deletedVehicleType) {
      return res.status(404).json({ message: "Vehicle Type not found." });
    }

    res.status(200).json({ message: "Vehicle Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createVehicleType,
  getAllVehicleTypes,
  getVehicleTypeById,
  updateVehicleType,
  deleteVehicleType,
};
