const jwt = require("jsonwebtoken");
const User = require("../models/User");

const AppError = require("../utils/AppError");

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new AppError("Authentication Required", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findOne({
      _id: decoded.sub,
      isActive: true,
    }).select("_id name role department");

    if (!user) {
      throw new AppError("User not found or Inactive User", 401);
    }
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(new AppError("Invalid or expired access token", 401));
    }
    next(error);
  }
};
module.exports = authenticate;
