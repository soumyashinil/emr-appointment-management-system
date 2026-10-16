const express = require("express");

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const validateRequest = require("../middlewares/validateRequest");

const {
  createAppointmentValidator,
} = require("../validators/appointmentValidators");

const {
  createAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.use(authenticate);

router.post(
  "/",
  authorize("super_admin", "receptionist"),
  createAppointmentValidator,
  validateRequest,
  createAppointment,
);

router.get("/", getAppointments);
router.put("/:id", updateAppointment);
router.delete("/:id", cancelAppointment);

module.exports = router;
