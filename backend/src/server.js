require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing");
    process.exit(1);
  }
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
