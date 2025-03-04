const Petrol = require("../models/petrolModel");
const Vehicle = require("../models/vehicleModel");

// ✅ Create Petrol Entry
const createPetrol = async (req, res) => {
  try {
    const { vehicleId, oil, slipId, amount, slipImage } = req.body;

    // Check if vehicle exists
    const vehicleExists = await Vehicle.findById(vehicleId);
    if (!vehicleExists) {
      return res.status(404).json({ message: "Vehicle not found." });
    }

    // Get current date in "DD/MM/YYYY" format
    const currentDate = new Date();
    const formattedDate = `${String(currentDate.getDate()).padStart(2, "0")}/${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}/${currentDate.getFullYear()}`;

    // Check if a record already exists for this vehicle on the current date
    const existingRecord = await Petrol.findOne({
      vehicleId,
      createdAt: {
        $gte: new Date(currentDate.setHours(0, 0, 0, 0)), // Start of the day
        $lte: new Date(currentDate.setHours(23, 59, 59, 999)), // End of the day
      },
    });

    if (existingRecord) {
      return res.status(400).json({ message: "Petrol record already exists for today against this vehicle" });
    }

    // Create new Petrol entry
    const newPetrol = new Petrol({
      vehicleId,
      oil,
      slipId,
      amount,
      slipImage,
    });

    await newPetrol.save();

    res.status(201).json({
      message: "Petrol record created successfully",
      petrol: newPetrol,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// ✅ Get All Petrol Records
const getAllPetrolRecords = async (req, res) => {
  try {
    const petrolRecords = await Petrol.find().populate(
      "vehicleId",
      "vehicleName ownerName ownerContact"
    );
    res.status(200).json({ petrolRecords });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllPetrolRecordsBetweenDates = async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    // Function to format date as "DD/MM/YYYY"
    const formatDate = (date) => {
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, "0")}/${String(
        d.getMonth() + 1
      ).padStart(2, "0")}/${d.getFullYear()}`;
    };

    // If dates are not passed, set both to today's date in "DD/MM/YYYY" format
    if (!startDate || !endDate) {
      const today = new Date();
      startDate = formatDate(today);
      endDate = formatDate(today);
    }

    // Convert "DD/MM/YYYY" to valid Date object
    const parseDate = (dateStr) => {
      const [day, month, year] = dateStr.split("/");
      return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    };

    // Create date filter
    const filter = {
      createdAt: {
        $gte: parseDate(startDate), // Start of the day
        $lte: new Date(parseDate(endDate).setHours(23, 59, 59, 999)), // End of the day
      },
    };

    // Fetch records
    const petrolRecords = await Petrol.find(filter).populate(
      "vehicleId",
      "vehicleName ownerName ownerContact"
    );

    res.status(200).json({ petrolRecords });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// ✅ Get Petrol Record by ID
const getPetrolById = async (req, res) => {
  try {
    const { id } = req.params;
    const petrolRecord = await Petrol.findById(id).populate(
      "vehicleId",
      "vehicleName ownerName ownerContact"
    );

    if (!petrolRecord) {
      return res.status(404).json({ message: "Petrol record not found." });
    }

    res.status(200).json({ petrolRecord });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Update Petrol Record
const updatePetrol = async (req, res) => {
  try {
    const { id } = req.params;
    const { oil, slipId, amount, slipImage } = req.body;

    const updatedPetrol = await Petrol.findByIdAndUpdate(
      id,
      { oil, slipId, amount, slipImage },
      { new: true }
    );

    if (!updatedPetrol) {
      return res.status(404).json({ message: "Petrol record not found." });
    }

    res.status(200).json({
      message: "Petrol record updated successfully",
      petrol: updatedPetrol,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ✅ Delete Petrol Record
const deletePetrol = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPetrol = await Petrol.findByIdAndDelete(id);

    if (!deletedPetrol) {
      return res.status(404).json({ message: "Petrol record not found." });
    }

    res.status(200).json({ message: "Petrol record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



module.exports = {
  createPetrol,
  getAllPetrolRecords,
  getAllPetrolRecordsBetweenDates,
  getPetrolById,
  updatePetrol,
  deletePetrol,
};
