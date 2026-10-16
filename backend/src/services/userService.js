const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const AppError = require("../utils/AppError");

const createUser = async ({ name, email, password, role, department }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await hashPassword(password);

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
    });
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    };
  } catch (error) {
    // Handle duplicate-email races using MongoDB's unique index.
    if (error.code === 11000) {
      throw new AppError("Email is already registered", 409);
    }
    throw error;
  }
};
const getDoctors = async () => {
  return User.find({
    role: "doctor",
    isActive: true,
  }).select("name email department");
};
const getAllStaff = async () => {
  return User.find({
    role: { $in: ["doctor", "receptionist"] },
  })
    .select("name email role department isActive")
    .sort({ createdAt: -1 })
    .lean();
};
module.exports = { createUser, getDoctors, getAllStaff };
