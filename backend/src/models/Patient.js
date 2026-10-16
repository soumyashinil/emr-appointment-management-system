const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
  },
  { timestamps: true },
);

patientSchema.index({ name: 1 });
patientSchema.index({ mobile: 1 });
module.exports = mongoose.model("Patient", patientSchema);
