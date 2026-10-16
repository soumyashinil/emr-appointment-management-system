const express = require("express");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validateRequest = require("../middlewares/validateRequest");

const {
  createPatientValidator,
  searchPatientValidator,
} = require("../validators/patientValidators");

const {
  createPatient,
  searchPatients,
} = require("../controllers/patientController");

const router = express.Router();

// Protect all routes below this line
router.use(authenticate);

router.post(
  "/",
  authorize("receptionist"),
  createPatientValidator,
  validateRequest,
  createPatient,
);

router.get(
  "/",
  authorize("receptionist"),
  searchPatientValidator,
  validateRequest,
  searchPatients,
);

module.exports = router;
