const express = require("express");
const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");
const { login, refresh, logout } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isString().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login,
);

router.post("/refresh", refresh);
router.post("/logout", logout);

module.exports = router;
