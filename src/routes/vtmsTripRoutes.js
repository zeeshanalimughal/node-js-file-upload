const express = require('express');
const router = express.Router();
const { getDevicesTrips,getAllTrips,clearTripModel,getTripRecordAccordingToDateAndUnitID,getVTMSTripData } = require('../controllers/vtmsTripController');

router.get('/getDevicesTrips', getDevicesTrips);
router.get('/getAllTrips', getAllTrips);
router.get('/clearTripModel', clearTripModel);
router.get('/getTripRecordAccordingToDateAndUnitID', getTripRecordAccordingToDateAndUnitID);
router.get('/getVTMSTripData', getVTMSTripData);
module.exports = router;