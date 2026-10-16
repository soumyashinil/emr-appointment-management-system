const userService = require("../services/userService");
const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await userService.getDoctors();

    return res.status(200).json({
      success: true,
      data: { doctors },
    });
  } catch (error) {
    next(error);
  }
};

const getAllStaff = async (req, res, next) => {
  try {
    const staff = await userService.getAllStaff();

    return res.status(200).json({
      success: true,
      data: { users: staff },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { createUser, getDoctors, getAllStaff };
