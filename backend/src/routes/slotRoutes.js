
const express = require("express");
const { getAvailableSlots } = require("../controllers/slotController");

const router = express.Router();

router.get("/", getAvailableSlots);

module.exports = router;
