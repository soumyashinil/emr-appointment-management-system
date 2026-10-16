const { body, query } = require("express-validator");

const createPatientValidator = [
  body("name").trim().notEmpty().withMessage("Patient name is required"),
  body("mobile")
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage("Enter a valid mobile number"),
  body("dateOfBirth")
    .optional({ values: "null" })
    .isISO8601()
    .withMessage("Enter a valid date of birth"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
];

const searchPatientValidator = [
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search must be between 1 and 100 characters"),
];

module.exports = {
  createPatientValidator,
  searchPatientValidator,
};
