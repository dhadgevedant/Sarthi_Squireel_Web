const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Admin.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Admin not found, authorization denied" });
      }
      if (!req.user.isActive) {
        return res.status(403).json({ message: "Admin account is inactive" });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

module.exports = { protect };
