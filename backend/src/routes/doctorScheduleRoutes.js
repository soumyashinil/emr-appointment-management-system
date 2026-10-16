
const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const { saveSchedule } = require("../controllers/doctorScheduleController");

router.put(
  "/:doctorId",
  authenticate,
  authorize("super_admin"),
  saveSchedule
);

module.exports = router;
