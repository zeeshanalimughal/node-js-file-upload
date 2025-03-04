const express = require("express");
const {
  createPetrol,
  getAllPetrolRecords,
  getAllPetrolRecordsBetweenDates,
  getPetrolById,
  updatePetrol,
  deletePetrol,
} = require("../controllers/petrolController");

const router = express.Router();

router.post("/", createPetrol);
router.get("/", getAllPetrolRecordsBetweenDates);
router.get("/:id", getPetrolById);
router.put("/:id", updatePetrol);
router.delete("/:id", deletePetrol);

module.exports = router;
