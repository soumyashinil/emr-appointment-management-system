
const DoctorSchedule = require("../models/DoctorSchedule");
const Appointment = require("../models/Appointment");
const AppError = require("../utils/AppError");

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getAvailableSlots = async ({ doctorId, date }) => {
  const appointmentDate = new Date(date);

  if (!date || Number.isNaN(appointmentDate.getTime())) {
    throw new AppError("Valid appointment date is required", 400);
  }

  const schedule = await DoctorSchedule.findOne({ doctor: doctorId });

  if (!schedule) {
    throw new AppError("Doctor schedule not found", 404);
  }

  if (!schedule.workingDays.includes(appointmentDate.getDay())) {
    return [];
  }

  const dayStart = new Date(appointmentDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $ne: "cancelled" },
  }).select("startTime endTime");

  const booked = bookedAppointments.map((appointment) => ({
    start: toMinutes(appointment.startTime),
    end: toMinutes(appointment.endTime),
  }));

  const slots = [];
  const duration = schedule.slotDurationMinutes;

  for (const session of schedule.sessions) {
    const sessionStart = toMinutes(session.startTime);
    const sessionEnd = toMinutes(session.endTime);

    for (
      let start = sessionStart;
      start + duration <= sessionEnd;
      start += duration
    ) {
      const end = start + duration;

      const overlapsBreak = (session.breaks || []).some((item) => {
        return (
          start < toMinutes(item.endTime) &&
          end > toMinutes(item.startTime)
        );
      });

      const isBooked = booked.some((item) => {
        return start < item.end && end > item.start;
      });

      if (!overlapsBreak && !isBooked) {
        slots.push({
          startTime: formatTime(start),
          endTime: formatTime(end),
        });
      }
    }
  }

  return slots;
};

module.exports = { getAvailableSlots };
