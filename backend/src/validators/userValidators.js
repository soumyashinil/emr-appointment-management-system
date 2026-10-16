const { body } = require("express-validator");

const createUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Enter a valid Email"),
  body("password")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("role")
    .isIn(["doctor", "receptionist"])
    .withMessage("Role must be doctor or receptionist"),
  body("department")
    .optional()
    .trim()
    .isString()
    .withMessage("Department must be a string"),
];
module.exports = { createUserValidator };
