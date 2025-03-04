const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if Authorization header exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // Extract token

      // Verify Token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and attach it to request object
      req.user = await User.findById(decoded.id).select("-password"); // Exclude password
      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // Continue to the protected route
    } else {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token, authorization denied" });
  }
};

module.exports = { protect };
