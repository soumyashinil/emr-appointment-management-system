const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middlewares/errorHandler");

const authenticate = require("./middlewares/authenticate");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const doctorScheduleRoutes = require("./routes/doctorScheduleRoutes");
const slotRoutes = require("./routes/slotRoutes");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
); */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/patients", patientRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/doctor-schedules", doctorScheduleRoutes);
app.use("/api/v1/slots", slotRoutes);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "EMR api is running" });
});

app.get("/api/v1/auth/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});
app.use(errorHandler);

module.exports = app;
