const TripModel = require('../models/tripModel');
const VtmsModel = require('../models/vtmsModel');
const axios = require('axios');
const xml2js = require("xml2js");
const userKey = "b37e972a-44cb-4735-9849-1ef0444cb247";


const getDevicesTrips = async (unitId, alias, currentDate) => {
  try {
    let soapRequest = `<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <GetVehicleTrips xmlns="http://demo.naqsha.net/">\n      <Date>${currentDate}</Date>\n      <UnitID>${unitId}</UnitID>\n      <UserKey>${userKey}</UserKey>\n    </GetVehicleTrips>\n  </soap:Body>\n</soap:Envelope>`;

    const response = await axios.post(
      "http://202.166.170.220/TestMatrixService/Service.asmx",
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );

    xml2js.parseString(
      response.data,
      { explicitArray: false },
      async (err, result) => {
        if (err) {
          console.error("❌ XML Parsing Error:", err);
          return { error: "Failed to parse XML response" };
        }

        const tripResponse =
          result["soap:Envelope"]?.["soap:Body"]?.["GetVehicleTripsResponse"];

        if (!tripResponse) {
          console.error("❌ Unexpected Response Structure:", JSON.stringify(result, null, 2));
          return { error: "Unexpected response structure from API" };
        }

        const tripData =
          tripResponse["GetVehicleTripsResult"]?.["Data"]?.["TripData"]?.["VehicleTripInfo"] || [];

        const allDay =
          tripResponse["GetVehicleTripsResult"]?.["Data"]?.["AllDayData"] || {};

        // Define `allDayData` here so it's available in both cases
        const allDayData = {
          ...allDay,
          UnitID: unitId,
          vehicle_Name: alias,
        };

        let formattedData = [];

        if (Array.isArray(tripData)) {
          formattedData = tripData.map(record => ({
            ID: record.ID,
            StartDateTime: record.StartDateTime,
            EndDateTime: record.EndDateTime,
            TravelTime: record.TravelTime,
            Mileage: record.Mileage,
            StartPoint: record.StartPoint,
            EndPoint: record.EndPoint,
            UnitID: unitId,
            vehicle_Name: alias,
          }));
        } else if (tripData && typeof tripData === "object") {
          formattedData = [{
            ID: tripData.ID,
            StartDateTime: tripData.StartDateTime,
            EndDateTime: tripData.EndDateTime,
            TravelTime: tripData.TravelTime,
            Mileage: tripData.Mileage,
            StartPoint: tripData.StartPoint,
            EndPoint: tripData.EndPoint,
            UnitID: unitId,
            vehicle_Name: alias,
          }];
        }

        // Save to MongoDB
        await TripModel.create({ data: formattedData, allDayData });

        return { success: true, data: formattedData, allDayData, message: "Trip data saved successfully!" };
      }
    );
  } catch (error) {
    console.error("❌ GetVehicleTrips Error:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};


const getDevicesTripsData = async (unitId, currentDate) => {
 try {
    let soapRequest = `<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <GetVehicleTrips xmlns="http://demo.naqsha.net/">\n      <Date>${currentDate}</Date>\n      <UnitID>${unitId}</UnitID>\n      <UserKey>${userKey}</UserKey>\n    </GetVehicleTrips>\n  </soap:Body>\n</soap:Envelope>`;
    const response = await axios.post(
      "http://202.166.170.220/TestMatrixService/Service.asmx",
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml",
        },
      }
    );

    if (typeof response.data === "object") {
      console.log("✅ Response JSON:", JSON.stringify(response.data, null, 2));
      return res.json({ success: true, data: response.data });
    }
    const parsedData = await parseXMLResponse(response.data);
    return parsedData;
 
  } catch (error) {
    console.error(
      "❌ GetVehicleTrips Error:",
      error.response?.data || error.message
    );
    return JSON.parse({ error: error.response?.data || error.message });
  }
};




const parseXMLResponse = (xmlData) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error("❌ XML Parsing Error:", err);
        return reject("Failed to parse XML response");
      }

      // Validate expected response structure
      const tripResponse =
        result["soap:Envelope"]?.["soap:Body"]?.["GetVehicleTripsResponse"];
      if (!tripResponse) {
        console.error(
          "❌ Unexpected Response Structure:",
          JSON.stringify(result, null, 2)
        );
        return reject("Unexpected response structure from API");
      }

      // Extract Vehicles Data
      const tripData =
        tripResponse["GetVehicleTripsResult"]?.["Data"]?.["TripData"] || {};

      const allDayData =
        tripResponse["GetVehicleTripsResult"]?.["Data"]?.["AllDayData"] || {};

      resolve({ tripData, allDayData });
    });
  });
};

const getTripRecordAccordingToDateAndUnitID = async (req,res) => {
    try {
      const {currentDate } = req.query;
     let devicesData=await fetVechicles()
        if (devicesData.length === 0) {
            console.log("No records found.");
            return;
        }

         const tripResponses = [];
         console.log("Ahoooo",currentDate)
         console.log("devicesData",devicesData?.length)
        for (const record of devicesData) {
           const response= await getDevicesTrips(record.UnitID,record.Alias,currentDate);
           console.log(`Data Added for ${record.UnitID} and ${record.Alias}  ${currentDate}` )
             tripResponses.push(response);
        }

        console.log("All records processed.");
          return res.status(200).json({ success: true, data: tripResponses,count:tripResponses?.length });
    } catch (error) {
        console.error("Error fetching Vtms records:", error.message);
         res.status(500).json({success:fa
          ,message:"Something went Wrong"});
    }
};


const getAllTrips = async (req,res) => {
    try {
        const trips = await TripModel.find({});
         return res.json({ success: true, data: trips,message: "Trip data fetched successfully!",count:trips?.length });
        //  return res.json({ success: true,message: "Trip data fetched successfully!",count:trips?.length });
    } catch (error) {
        console.error("Error fetching trip data:", error);
        res.status(500).json({ error: error.response?.data || error.message });
    }
};


const fetVechicles= async () => {
 
   try {
    const url = "http://202.166.170.220/TestMatrixService/Service.asmx";

    // SOAP Request
    const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
            <GetVehiclesByLogin xmlns="http://demo.naqsha.net/">
                <UserKey>${userKey}</UserKey>
            </GetVehiclesByLogin>
        </soap12:Body>
    </soap12:Envelope>`;

    const response = await axios.post(url, soapRequest, {
      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
    });

    // console.log("✅ Response JSON:", JSON.stringify(response.data, null, 2));
    if (typeof response.data === "object") {
      return res.json({ success: true, data: response.data });
    }
  
    const parsedData = await parseXMLResponseOFfetVechicles(response.data);
    return parsedData

    // res.send(response?.data);
  } catch (error) {
    console.error(
      "❌ GetDevicesData Error:",
      error.response?.data || error.message
    );
    return { error: error.response?.data || error.message };

  }
}

const parseXMLResponseOFfetVechicles = (xmlData) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlData, { explicitArray: false }, (err, result) => {
      if (err) {
        console.error("❌ XML Parsing Error:", err);
        return reject("Failed to parse XML response");
      }

      // Check if expected structure exists
        if (
          !result["soap:Envelope"] ||
          !result["soap:Envelope"]["soap:Body"] ||
          !result["soap:Envelope"]["soap:Body"]["GetVehiclesByLoginResponse"]
        ) {
          console.error(
            "❌ Unexpected Response Structure:",
            JSON.stringify(result, null, 2)
          );
          return res
            .status(500)
            .json({ error: "Unexpected response structure from API" });
        }

        // Extract Vehicles Data
        const vehiclesData =
          result["soap:Envelope"]["soap:Body"]["GetVehiclesByLoginResponse"][
            "GetVehiclesByLoginResult"
          ]["Data"]["GetVehiclesByLogin_TestResult"];
   
      resolve(vehiclesData);
    });
  });
};


function mergeMileageByUnitID(data) {
    const mergedData = {};

    data.forEach(item => {
        // Ensure it's a plain object (handle Mongoose documents)
        const plainItem = item.toObject ? item.toObject() : item;

        const unitID = plainItem.allDayData.UnitID;
        const mileage = Number(plainItem.allDayData.Mileage) || 0; // Ensure Mileage is a number

        if (!mergedData[unitID]) {
            // Store a copy of the first occurrence
            mergedData[unitID] = { ...plainItem, allDayData: { ...plainItem.allDayData, Mileage: mileage } };
        } else {
            // Only sum Mileage as a number
            mergedData[unitID].allDayData.Mileage += mileage;
        }
    });

    return mergedData
}
const getTripsByUnitAndDateRange = async (unitId, startDate, endDate) => {
  try {
   const trips = await TripModel.find({
      "data.UnitID": unitId, 
    });

     let filteredData=trips?.filter((item)=>Object.keys(item?.allDayData)?.length>0)
     let filtered=filteredData?.filter((item)=>item?.allDayData?.StartDateTime?.substring(0,10)>=startDate&&item?.allDayData?.StartDateTime?.substring(0,10)<=endDate)
     let lData=await mergeMileageByUnitID(filtered)
    return { success: true, data: lData[unitId] };
  } catch (error) {
    console.error("❌ Error fetching trips:", error);
    return { success: false, error: error.message };
  }
};

const  updateMileage=async(data)=> {
    const mileageMap = new Map();

    data.forEach(item => {
        let totalMileage = 0;

        if (item.tripsData) {
            if (Array.isArray(item.tripsData.VehicleTripInfo)) {
                totalMileage = item.tripsData.VehicleTripInfo.reduce(
                    (sum, trip) => sum + (parseFloat(trip.Mileage) || 0), 0
                );
            } else if (Array.isArray(item.tripsData)) {
                totalMileage = item.tripsData.reduce(
                    (sum, trip) => sum + (parseFloat(trip.Mileage) || 0), 0
                );
            }
        }

        if (item.allDayData) {
            item.allDayData.Mileage = totalMileage;
        }

        const alias = item.Alias; // Assuming each object has an 'Alias' field

        if (mileageMap.has(alias)) {
            mileageMap.get(alias).allDayData.Mileage += totalMileage;
        } else {
            mileageMap.set(alias, { ...item });
        }
    });

    return Array.from(mileageMap.values());
}

const  getOneDayBefore=async(endDate) =>{
  let date = new Date(endDate);
  date.setDate(date.getDate() - 1);
  let formattedDate = date.toISOString().split('T')[0];
  
  return formattedDate;
}
const getVTMSTripData=async(req,res)=>{
       try {
             const {currentDate,endDate } = req.query;
             const today = new Date().toISOString().split('T')[0];
             if (!endDate) {
                 let devicesData=await fetVechicles()
                 if (devicesData.length === 0) {
                     console.log("No records found.");
                     return;
                   }

                 const tripResponses = [];
                    for (const record of devicesData) {
                        let cloneOfRecord = { ...record };
               
                const response = await getDevicesTripsData(cloneOfRecord.UnitID, currentDate);
                cloneOfRecord.tripsData = response?.tripData || {};
                cloneOfRecord.allDayData = response?.allDayData || {};
                tripResponses.push(cloneOfRecord)
   
                    }
                res.status(200).json({success:true,data:tripResponses,message:"done"});

             

            } else {
                  

                   if(endDate==today)
                   {
                        let yesterday=await getOneDayBefore(endDate)
                        const tripResponses = [];
                        const records = await VtmsModel.find(); 
                        for (const record of records) {
                        let cloneOfRecord = { ...record.toObject() };
                         let response =await getTripsByUnitAndDateRange(cloneOfRecord.UnitID, currentDate,yesterday)
                         cloneOfRecord.tripsData = response?.data?.data || {};
                        cloneOfRecord.allDayData = response?.data?.allDayData || {};
                        tripResponses.push(cloneOfRecord)
                      }

                      console.log("ahooooo",tripResponses?.length)
                       let currentDateResponse=[]
                        for (const record of records) {
                        let cloneOfRecord = { ...record.toObject() };
                        console.log("cloneOfRecord.UnitID",cloneOfRecord.UnitID)
                         const response = await getDevicesTripsData(cloneOfRecord.UnitID, currentDate);
                        cloneOfRecord.tripsData = response?.tripData || {};
                        cloneOfRecord.allDayData = response?.allDayData || {};
                        currentDateResponse.push(cloneOfRecord)
                        }
                    
                      let finalData=[...currentDateResponse,...tripResponses]
                      let lastData=await updateMileage(finalData)

                      // console.log("Here is final Data",lastData?.length)

                      // console.log("Here is final Data",JSON.stringify(lastData[10]))
                      res.status(200).json({success:true,data:lastData,message:"done",count:lastData?.length});
                      
                  

                   }
                   else
                   {
                   const records = await VtmsModel.find(); 
                   const tripResponses = [];
                    for (const record of records) {
                        let cloneOfRecord = { ...record.toObject() };
                         let response =await getTripsByUnitAndDateRange(cloneOfRecord.UnitID, currentDate,endDate)
                        cloneOfRecord.tripsData = response?.data?.data || {};
                        cloneOfRecord.allDayData = response?.data?.allDayData || {};
                        tripResponses.push(cloneOfRecord)
                    }
                
                    res.status(200).json({success:true,data:tripResponses,message:"done",count:tripResponses?.length});
                  }
          
             }
           
       } catch (error) {
         res.status(500).json({ message: "Error fetching records", error });
       }
                
}
    

const clearTripModel = async (req,res) => {
    try {
         await TripModel.deleteMany({});
         res.status(200).json({success:true,message:"TripModel cleared successfully!"});
    } catch (error) {
        res.status(500).json({ message: "Error fetching records", error });
    }
};




module.exports = {
  getDevicesTrips,
  getDevicesTripsData,
  getAllTrips,
  clearTripModel,
  getTripRecordAccordingToDateAndUnitID,
  getVTMSTripData
};