const VTMSModel = require('../models/vtmsModel');
const axios = require('axios');
const xml2js = require("xml2js");


const userKey = "b37e972a-44cb-4735-9849-1ef0444cb247";
const userName = "SDQWMC";
const Password = "GOOGLE";
const getAuthToken=async(req, res)=>{
 try {
    console.log("✅ API `/AuthenticateUser` was called");

    let data = `<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \n               xmlns:xsd="http://www.w3.org/2001/XMLSchema" \n               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <AuthenticateUser xmlns="http://demo.naqsha.net/">\n      <UserName>${userName}</UserName>\n      <Password>${Password}</Password>\n      <DeviceInfo>Macbook</DeviceInfo>\n    </AuthenticateUser>\n  </soap:Body>\n</soap:Envelope>`;

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://202.166.170.220/TestMatrixService/Service.asmx",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "http://demo.naqsha.net/AuthenticateUser",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log("Here is your response before parsing",response)
        xml2js.parseString(
          response.data,
          { explicitArray: false },
          (err, result) => {
            if (err) {
              console.error("Error parsing XML:", err);
              return;
            }
            const responseJson =
              result["soap:Envelope"]["soap:Body"]["AuthenticateUserResponse"][
                "AuthenticateUserResult"
              ];

            res.json({ success: true, data: responseJson });
          }
        );
      })
      .catch((error) => {
               console.log(error);
          res.status(500).json({ error: error.message });
 
      });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
}

const getDevicesDataByLogin =async (req, res) => {
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

    if (typeof response.data === "object") {
      return res.json({ success: true, data: response.data });
    }
    xml2js.parseString(
      response.data,
      { explicitArray: false },
      async (err, result) => {
        if (err) {
          console.error("❌ XML Parsing Error:", err);
          return res
            .status(500)
            .json({ error: "Failed to parse XML response" });
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

           const formattedData = vehiclesData.map(record => ({
        UnitMasterID: record.UnitMasterID,
        UnitID: record.UnitID,
        Alias: record.Alias,
        Reason: record.Reason,
        LandMark: record.LandMark,
        Speed: Number(record.Speed),  
        RecordDateTime: record.RecordDateTime
    }));
         await VTMSModel.insertMany(formattedData);
        res.json({ success: true, count: vehiclesData?.length,message:"Vehicles Stored!" });
      }
    );

  } catch (error) {
    console.error(
      "❌ GetDevicesData Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
}

const fetchDevicesData=async(req,res)=>{
     try {
        const records = await VTMSModel.find();
        res.status(200).json({success:true,data:records,count:records?.length});
    } catch (error) {
        res.status(500).json({ message: "Error fetching records", error });
    }
}

const clearVtmsModel = async (req,res) => {
    try {
        await VTMSModel.deleteMany({});
         res.status(200).json({success:true,message:"VtmsModel cleared successfully!"});
    } catch (error) {
        res.status(500).json({ message: "Error fetching records", error });
    }
};


module.exports = {
  getAuthToken,
  getDevicesDataByLogin,
  fetchDevicesData,
  clearVtmsModel
};