const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    breaks: {
      type: [breakSchema],
      default: [],
    },
  },
  { _id: false },
);

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    workingDays: {
      type: [
        {
          type: Number,
          min: 0,
          max: 6,
        },
      ],
      required: true,
    },

    sessions: {
      type: [sessionSchema],
      required: true,
    },

    slotDurationMinutes: {
      type: Number,
      default: 15,
      min: 5,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
