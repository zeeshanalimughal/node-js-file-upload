require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {dbConnect}= require("./src/config/db")

const app = express();


// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests

// Routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/media", require("./src/routes/uploadRoutes"));
app.use("/api/circle", require("./src/routes/circleRoutes"));
app.use("/api/vehicleType", require("./src/routes/vehicleTypeRoutes"));
app.use("/api/vehicle", require("./src/routes/vehicleRoutes"));
app.use("/api/petrol", require("./src/routes/petrolRoutes"));
app.use("/api/vtcs", require("./src/routes/vtcsRoutes"));
app.use("/api/vtmsDevices", require("./src/routes/vtmsDevicesRoutes"));
app.use("/api/vtms", require("./src/routes/vtmsTripRoutes"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
       await dbConnect()
  console.log(`Server running on port ${PORT} 🚀`);
});
