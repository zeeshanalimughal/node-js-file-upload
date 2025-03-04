const Circle = require("../models/circleModel");
const createCircle = async (req, res) => {
  try {
    const { ownerName, ownerContact, circleName, latitude, longitude, area } =
      req.body;

    if (!ownerName || !ownerContact || !circleName) {
      return res.status(400).json({
        message: "Owner Name, Owner Contact, and Circle Name are required.",
      });
    }

    // Check if a circle with the same name already exists
    const existingCircle = await Circle.findOne({ circleName });

    if (existingCircle) {
      return res.status(400).json({
        message:
          "A circle with this name already exists. Please choose a different name.",
      });
    }

    // Create a new circle
    const newCircle = new Circle({
      ownerName,
      ownerContact,
      circleName,
      latitude,
      longitude,
      area,
    });

    await newCircle.save();

    res
      .status(201)
      .json({ message: "Circle created successfully", circle: newCircle });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getCircles = async (req, res) => {
  try {
    const circles = await Circle.find();
    res.status(200).json(circles);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getCircleById = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    res.status(200).json(circle);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    const { ownerName, ownerContact, circleName, latitude, longitude, area } =
      req.body;

    // Update fields if provided
    if (ownerName) circle.ownerName = ownerName;
    if (ownerContact) circle.ownerContact = ownerContact;
    if (circleName) circle.circleName = circleName;
    if (latitude !== undefined) circle.latitude = latitude;
    if (longitude !== undefined) circle.longitude = longitude;
    if (area) circle.area = area;

    const updatedCircle = await circle.save();

    res
      .status(200)
      .json({ message: "Circle updated successfully", circle: updatedCircle });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const deleteCircle = async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({ message: "Circle not found" });
    }

    await Circle.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Circle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createCircle,
  getCircles,
  getCircleById,
  updateCircle,
  deleteCircle,
};
