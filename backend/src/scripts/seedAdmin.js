require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const { hashPassword } = require("../utils/password");

const seedAdmin = async () => {
  try {
    const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("REquired Environment variables are missing");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be atleast 12 characters");
    }

    await mongoose.connect(MONGODB_URI);
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const isExist = await User.findOne({ email });

    if (isExist) {
      console.log("User with admin email is already exists");
    }
    const password = await hashPassword(ADMIN_PASSWORD);

    await User.create({
      name: ADMIN_NAME,
      email,
      password,
      role: "super_admin",
    });
    console.log("Super admin created successfully");
  } catch (error) {
    console.error("Admin seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
