const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Databse connected on ${connection.connection.host}`);
    console.log(`Database name: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};
module.exports = connectDB;
