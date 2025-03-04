const express = require('express');
const router = express.Router();
const { getAuthToken,getDevicesDataByLogin,fetchDevicesData,clearVtmsModel } = require('../controllers/vtmsController');

router.get('/getAuthToken', getAuthToken);
router.get('/getDevicesDataByLogin', getDevicesDataByLogin);
router.get('/fetchDevicesData', fetchDevicesData);
router.get('/clearVtmsModel', clearVtmsModel);
module.exports = router;