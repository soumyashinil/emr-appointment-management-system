const mongoose = require("mongoose");
const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const saveDoctorSchedule = async ({
  doctorId,
  workingDays,
  sessions,
  slotDurationMinutes = 15,
}) => {
  if (!mongoose.isValidObjectId(doctorId)) {
    throw new AppError("Invalid doctor ID", 400);
  }

  const doctor = await User.findOne({
    _id: doctorId,
    role: "doctor",
    isActive: true,
  });

  if (!doctor) {
    throw new AppError("Active doctor not found", 404);
  }

  if (
    !Array.isArray(workingDays) ||
    workingDays.length === 0 ||
    workingDays.some((day) => !Number.isInteger(day) || day < 0 || day > 6) ||
    new Set(workingDays).size !== workingDays.length
  ) {
    throw new AppError("Invalid working days", 400);
  }

  if (
    !Array.isArray(sessions) ||
    sessions.length === 0 ||
    !Number.isInteger(slotDurationMinutes) ||
    slotDurationMinutes < 5
  ) {
    throw new AppError("Invalid sessions or slot duration", 400);
  }

  const sortedSessions = [...sessions].sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
  );

  for (let i = 0; i < sortedSessions.length; i++) {
    const session = sortedSessions[i];
    const start = toMinutes(session.startTime);
    const end = toMinutes(session.endTime);

    if (start < 0 || end <= start) {
      throw new AppError("Invalid session time", 400);
    }

    if (i > 0 && start < toMinutes(sortedSessions[i - 1].endTime)) {
      throw new AppError("Sessions must not overlap", 400);
    }

    const breaks = session.breaks || [];

    if (!Array.isArray(breaks)) {
      throw new AppError("Breaks must be an array", 400);
    }

    const sortedBreaks = [...breaks].sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
    );

    for (let j = 0; j < sortedBreaks.length; j++) {
      const current = sortedBreaks[j];
      const breakStart = toMinutes(current.startTime);
      const breakEnd = toMinutes(current.endTime);

      if (breakStart < start || breakEnd <= breakStart || breakEnd > end) {
        throw new AppError("Invalid break time", 400);
      }

      if (j > 0 && breakStart < toMinutes(sortedBreaks[j - 1].endTime)) {
        throw new AppError("Breaks must not overlap", 400);
      }
    }
  }

  return DoctorSchedule.findOneAndUpdate(
    { doctor: doctorId },
    {
      $set: {
        workingDays,
        sessions,
        slotDurationMinutes,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
    },
  );
};

module.exports = { saveDoctorSchedule };
