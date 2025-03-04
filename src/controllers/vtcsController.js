const VTCSData = require('../models/vtcsModel');
const Vehicle = require("../models/vehicleModel");
const VtmsModel = require('../models/vtmsModel');
const axios = require('axios');
const https = require('https');
const moment = require('moment');
const petrolModel = require('../models/petrolModel');
const { getDevicesTripsData } = require('../controllers/vtmsTripController');
// Insert VTCS Data
const insertVtcsData = async (req, res) => {
    try {
        const newData = new VTCSData(req.body);
        await newData.save();
        res.status(201).json({ message: 'Data inserted successfully', data: newData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All VTCS Data
const getVtcsData = async (req, res) => {
    try {
        const data = await VTCSData.find();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const fetchAndStoreVTCSData = async (req, res) => {
    try {
        const { from, to } = req.query;

        // Validate query parameters
        if (!from || !to) {
            return res.status(400).json({ message: 'Both from and to dates are required in format DD-MM-YYYY' });
        }

        const apiUrl = `https://smart.asktech.com.pk/api/AskTrack/GetVtcsTripData?from=${from}&to=${to}`;
      
        
     

      const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        // Fetch data from external API with the custom agent
        const response = await axios.get(apiUrl, { httpsAgent });

        if (response.data && Array.isArray(response.data)) {
            // Insert each record into the database
            const insertedData = await VTCSData.insertMany(response.data, { ordered: false });

            return res.status(201).json({ 
                message: 'Data fetched and stored successfully', 
                insertedCount: insertedData.length 
            });
        } else {
            return res.status(400).json({ message: 'Invalid API response format' });
        }
    } catch (error) {
        console.error('Error fetching and storing data:', error);
        return res.status(500).json({ error: error.message });
    }
};



const fetchAndStoreVTCSDataUpdated = async (req, res) => {
    try {
        let { from, to } = req.query;

        // Get current date in DD-MM-YYYY format
        const currentDate = moment().format('DD-MM-YYYY');

        // Validate query parameters
        if (!from || !to) {
            return res.status(400).json({ message: 'Both from and to dates are required in format DD-MM-YYYY' });
        }

        // If both dates are same and match the current date
        const isCurrentDate = from === to && from === currentDate;
        const apiUrl = `https://smart.asktech.com.pk/api/AskTrack/GetVtcsTripData?from=${from}&to=${to}`;
       

        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        // Fetch data from external API
        const response = await axios.get(apiUrl, { httpsAgent });

        if (response.data && Array.isArray(response.data)) {
            let updatedCount = 0;
            let insertedCount = 0;

            if (isCurrentDate) {
                // Check if records for current date already exist
                const existingRecords = await VTCSData.find({ loadDate: currentDate });

                if (existingRecords.length > 0) {
                    console.log(`Updating ${existingRecords.length} existing records for ${currentDate}`);

                    for (const record of response.data) {
                        const result = await VTCSData.updateOne(
                            { webData_Id: record.webData_Id },
                            { $set: record },
                            { upsert: true }
                        );

                        if (result.matchedCount > 0) {
                            updatedCount++;
                        } else {
                            insertedCount++;
                        }
                    }
                } else {
                    console.log(`No existing records found for ${currentDate}, inserting new records`);

                    const insertedData = await VTCSData.insertMany(response.data, { ordered: false });
                    insertedCount = insertedData.length;
                }
            } else {
                // Normal insert/update operation
                for (const record of response.data) {
                    const result = await VTCSData.updateOne(
                        { webData_Id: record.webData_Id },
                        { $set: record },
                        { upsert: true }
                    );

                    if (result.matchedCount > 0) {
                        updatedCount++;
                    } else {
                        insertedCount++;
                    }
                }
            }

            return res.status(201).json({
                message: 'Data fetched and stored successfully',
                insertedCount,
                updatedCount,
            });
        } else {
            return res.status(400).json({ message: 'Invalid API response format' });
        }
    } catch (error) {
        console.error('Error fetching and storing data:', error);
        return res.status(500).json({ error: error.message });
    }
};

const getPetrolDataBetweenDates = async (from, to) => {
  try {
    // Convert "DD-MM-YYYY" to a JavaScript Date object
    const fromDate = new Date(from.split("-").reverse().join("-"));
    const toDate = new Date(to.split("-").reverse().join("-"));

    // Adjust `toDate` to include the whole day
    toDate.setHours(23, 59, 59, 999);

    const petrolRecords = await petrolModel.find({
      createdAt: { $gte: fromDate, $lte: toDate },
    }).populate("vehicleId", "vehicleName");

 
    return petrolRecords;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
const getVehicles = async () => {
  try {
    const vehicles = await Vehicle.find().populate("vehicleTypeId").populate("circleId");
    return vehicles;
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
function formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    let day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
}



const getVTCSDataBetweenDates = async (req, res) => {
    try {
        const { from, to, flag } = req.query;

        if (!from || !to) {
            return res.status(400).json({ message: 'Both from and to dates are required in format DD-MM-YYYY' });
        }


       const currentDa = moment().format('DD-MM-YYYY');
       const isCurrentDate = from === to && from === currentDa;
       if (from === to && from === currentDa)
       {
        const apiUrl = `https://smart.asktech.com.pk/api/AskTrack/GetVtcsTripData?from=${from}&to=${to}`;
        console.log(`Fetching data from ${from} to ${to}`);

        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        // Fetch data from external API
        const response = await axios.get(apiUrl, { httpsAgent });

        if (response.data && Array.isArray(response.data)) {
            let updatedCount = 0;
            let insertedCount = 0;

            if (isCurrentDate) {
                // Check if records for current date already exist
                const existingRecords = await VTCSData.find({ loadDate: currentDa });

                if (existingRecords.length > 0) {
                    console.log(`Updating ${existingRecords.length} existing records for ${currentDa}`);

                    for (const record of response.data) {
                        const result = await VTCSData.updateOne(
                            { webData_Id: record.webData_Id },
                            { $set: record },
                            { upsert: true }
                        );

                        if (result.matchedCount > 0) {
                            updatedCount++;
                        } else {
                            insertedCount++;
                        }
                    }
                } else {
                    const insertedData = await VTCSData.insertMany(response.data, { ordered: false });
                    insertedCount = insertedData.length;
                }
            } else {
                // Normal insert/update operation
                for (const record of response.data) {
                    const result = await VTCSData.updateOne(
                        { webData_Id: record.webData_Id },
                        { $set: record },
                        { upsert: true }
                    );

                    if (result.matchedCount > 0) {
                        updatedCount++;
                    } else {
                        insertedCount++;
                    }
                }
            }

            if (flag === "true") {
            const groupedData = Object.values(
                response?.data?.reduce((acc, record) => {
                    const key = record.vehicle_Name;
                    if (!acc[key]) {
                        acc[key] = { ...record }; // Copy record
                    } else {
                        acc[key].netWeight += record.netWeight || 0; // Sum netWeight
                    }
                    return acc;
                }, {})
            );


  
  

                
                     const petrolRecords = await getPetrolDataBetweenDates(from,to)
                        let vehiclesData=await getVehicles()
               const petrolGroupedData = Object.values(
    petrolRecords.map(record => record.toObject()).reduce((acc, record) => {
        const key = record?.vehicleId?.vehicleName;
        if (!acc[key]) {
            acc[key] = { ...record }; // Copy record
        } else {
            acc[key].amount += record.amount || 0; 
        }
        return acc;
    }, {})
);

               const mergedData = groupedData.map(item => {
    const petrolInfo = petrolGroupedData.find(p => p?.vehicleId?.vehicleName === item.vehicle_Name);
    return {
        ...item,
        petrolInfo: petrolInfo || null 
    };
});

           


            const totalNetWeight = groupedData.filter(record => record.vehicle_Name.includes("SDQ-SB")).reduce((sum, record) => sum + record.netWeight, 0);
            const totalNetOil = petrolGroupedData.reduce((sum, record) => sum + record.amount, 0);
            const totalNetPetrol = petrolGroupedData.reduce((sum, record) => (record.oil === "Petrol" ? sum + record.amount : sum),0);
            const totalNetDiesel = petrolGroupedData.reduce((sum, record) => (record.oil === "Diesel" ? sum + record.amount : sum),0);

            return res.status(200).json({
                message: "Current Date Grouped Records fetched successfully",
                count: mergedData?.length,
                data: mergedData,
                ungroupedData:response?.data,
                totalNetWeight,
                totalNetOil,
                totalNetPetrol,
                totalNetDiesel,
                totalVehicles:vehiclesData?.length
                
            });
        }
        else
        {
            return res.status(201).json({
                message: 'Ahoooo Data fetched and stored successfully',
                insertedCount,
                updatedCount,
                data:response.data
            });

        }

            
        } else {
            return res.status(400).json({ message: 'Invalid API response format' });
        }

       }


       else
       {
        // const currentDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');
        let dbRecords = [];
        let apiRecords = [];

        const currentDate = moment().format('DD-MM-YYYY');
        if (to === currentDate) 
        {
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            dbRecords = await VTCSData.find({
                loadDate: { $gte: from, $lte: formatDate(yesterday) }
            }).lean(); // Convert to plain objects

            console.log(`Fetched DB data from ${from} to ${formatDate(yesterday)} Ahooooo`,dbRecords?.length);

            // Fetch from API: Only for today's date

         const apiUrl = `https://smart.asktech.com.pk/api/AskTrack/GetVtcsTripData?from=${to}&to=${to}`;
        

        const httpsAgent = new https.Agent({ rejectUnauthorized: false });

        // Fetch data from external API
        const response = await axios.get(apiUrl, { httpsAgent });
 

            if (response.data && Array.isArray(response.data)) {
                apiRecords = response.data;
                
                const existingRecords = await VTCSData.find({ loadDate: to });
                if (existingRecords.length > 0) {
                    console.log(`Updating ${existingRecords.length} existing records for ${currentDa}`);

                    for (const record of response.data) {
                        const result = await VTCSData.updateOne(
                            { webData_Id: record.webData_Id },
                            { $set: record },
                            { upsert: true }
                        );

                       
                    }
                }
                else

                {
                    await VTCSData.insertMany(apiRecords, { ordered: false }).catch(err => {
                    console.log('Some records may already exist:', err.message);
                });
                }
            }
           
        } 
        
        else {
            // If `to` is not today, fetch everything from DB
            dbRecords = await VTCSData.find({
                loadDate: { $gte: from, $lte: to }
            }).lean(); // Convert to plain objects
            console.log(`Fetching DB data For Old Dates Working fine`);
          }

        // Merge DB and API records
        let finalData = [...dbRecords, ...apiRecords];

        // If flag is "true", group by webData_Id and sum netWeight
        if (flag === "true") {
            const groupedData = Object.values(
                finalData.reduce((acc, record) => {
                    const key = record.vehicle_Name;
                    if (!acc[key]) {
                        acc[key] = { ...record }; // Copy record
                    } else {
                        acc[key].netWeight += record.netWeight || 0; // Sum netWeight
                    }
                    return acc;
                }, {})
            );

 

            
console.log("ahoooo",JSON.stringify(groupedData))

               const petrolRecords = await getPetrolDataBetweenDates(from,to)
                  let vehiclesData=await getVehicles()
               const petrolGroupedData = Object.values(
    petrolRecords.map(record => record.toObject()).reduce((acc, record) => {
        const key = record?.vehicleId?.vehicleName;
        if (!acc[key]) {
            acc[key] = { ...record }; // Copy record
        } else {
            acc[key].amount += record.amount || 0; // Sum amount
        }
        return acc;
    }, {})
);

               const mergedData = groupedData.map(item => {
    const petrolInfo = petrolGroupedData.find(p => p?.vehicleId?.vehicleName === item.vehicle_Name);
    return {
        ...item,
        petrolInfo: petrolInfo || null // Adding petrol data if found, otherwise null
    };
});

       
            const totalNetWeight = groupedData.filter(record => record.vehicle_Name.includes("SDQ-SB")).reduce((sum, record) => sum + record.netWeight, 0);
            const totalNetOil = petrolGroupedData.reduce((sum, record) => sum + record.amount, 0);
            const totalNetPetrol = petrolGroupedData.reduce((sum, record) => (record.oil === "Petrol" ? sum + record.amount : sum),0);
            const totalNetDiesel = petrolGroupedData.reduce((sum, record) => (record.oil === "Diesel" ? sum + record.amount : sum),0);
           

            return res.status(200).json({
                message: "Grouped Records fetched successfully",
                count: mergedData?.length,
                data: mergedData,
                ungroupedData:finalData,
                totalNetWeight,
                totalNetOil,
                totalNetPetrol,
                totalNetDiesel,
                totalVehicles:vehiclesData?.length
               
                
            });
        } else {
            return res.status(200).json({
                message: "Records fetched successfully",
                count: finalData.length,
                data: finalData
            });
        }
         }

    } catch (error) {
        console.error('Error fetching VTCS data:', error);
        return res.status(500).json({ error: error.message });
    }
};





module.exports = {
  insertVtcsData,
  getVtcsData,
  fetchAndStoreVTCSData,
  fetchAndStoreVTCSDataUpdated,
  getVTCSDataBetweenDates
};