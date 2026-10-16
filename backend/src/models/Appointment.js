const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: { type: String, required: true, trim: true },
    appointmentDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "arrived", "completed", "cancelled"],
      default: "scheduled",
    },
    consultationNotes: { type: String, trim: true, maxlength: 2000 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } },
);
module.exports = mongoose.model("Appointment", appointmentSchema);
