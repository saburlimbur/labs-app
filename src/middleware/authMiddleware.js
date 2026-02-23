const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn(`Unauthorized access attempt at ${req.originalUrl}`);
    return res.status(401).json({
      status: "error",
      message: "Access denied, token not found!",
    });
  }

  try {
    // verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "rezim");

    req.user = decoded;

    next();
  } catch (err) {
    logger.error("Invalid Token", { error: err.message });
    return res.status(403).json({
      status: "error",
      message: "Token invalid or expired",
    });
  }
};

module.exports = authMiddleware;
