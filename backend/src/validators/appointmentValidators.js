const { body } = require("express-validator");

const createAppointmentValidator = [
  body("patientId").isMongoId().withMessage("A valid patient ID is required"),

  body("doctorId").isMongoId().withMessage("A valid doctor ID is required"),

  body("appointmentDate")
    .isISO8601()
    .withMessage("A valid appointment date is required"),

  body("startTime")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Start time must be in HH:mm format"),
];

module.exports = { createAppointmentValidator };
