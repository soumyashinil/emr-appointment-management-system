const express = require("express");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");

const validateRequest = require("../middlewares/validateRequest");

const {
  createUser,
  getDoctors,
  getAllStaff,
} = require("../controllers/userController");

const { createUserValidator } = require("../validators/userValidators");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("super_admin"),
  createUserValidator,
  validateRequest,
  createUser,
);
router.get("/doctors", authenticate, getDoctors);
router.get("/", authenticate, authorize("super_admin"), getAllStaff);

module.exports = router;
