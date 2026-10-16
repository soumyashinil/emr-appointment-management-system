const AppError = require("../utils/AppError");

const authorize = (...allowedRules) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!allowedRules.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 401),
      );
    }
    next();
  };
};
module.exports = authorize;
