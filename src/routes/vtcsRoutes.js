const express = require('express');
const router = express.Router();
const { insertVtcsData, getVtcsData,fetchAndStoreVTCSData,fetchAndStoreVTCSDataUpdated,getVTCSDataBetweenDates } = require('../controllers/vtcsController');

router.post('/insertVtcsData', insertVtcsData);
router.get('/getVtcsData', getVtcsData);
router.get('/getVTCSDataBetweenDates', getVTCSDataBetweenDates);
router.get('/fetchAndStoreVTCSData', fetchAndStoreVTCSData);
router.get('/fetchAndStoreVTCSDataUpdated', fetchAndStoreVTCSDataUpdated);

module.exports = router;