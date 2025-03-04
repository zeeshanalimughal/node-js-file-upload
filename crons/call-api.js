const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');

cron.schedule('30 22 * * *', async () => {
  const currentDate = moment().format('YYYY-MM-DD');
  const url = `https://sbengineering.pk/api/vtms/getTripRecordAccordingToDateAndUnitID?currentDate=${currentDate}`;

  try {
    const response = await axios.get(url);
    console.log('First API Response:', response.data);
  } catch (error) {
    console.error('Error calling first API:', error.message);
  }
});

cron.schedule('40 22 * * *', async () => {
  const currentDate = moment().format('DD-MM-YYYY');
  const url = `https://sbengineering.pk/api/vtcs/getVTCSDataBetweenDates?from=${currentDate}&to=${currentDate}&flag=true`;

  try {
    const response = await axios.get(url);
    console.log('Second API Response:', response.data);
  } catch (error) {
    console.error('Error calling second API:', error.message);
  }
});

console.log('Cron jobs scheduled. Waiting for execution...');

