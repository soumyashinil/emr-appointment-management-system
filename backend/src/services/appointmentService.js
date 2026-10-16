const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const DoctorSchedule = require("../models/DoctorSchedule");
const createAppointment = async ({
  patientId,
  doctorId,
  appointmentDate,
  startTime,
  createdBy,
}) => {
  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    User.findOne({
      _id: doctorId,
      role: "doctor",
      isActive: true,
    }),
  ]);

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  if (!doctor) {
    throw new AppError("Active doctor not found", 404);
  }

  const date = new Date(appointmentDate);

  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid appointment date", 400);
  }
  //compare dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointmentDay = new Date(date);
  appointmentDay.setHours(0, 0, 0, 0);

  if (appointmentDay < today) {
    throw new AppError("Past appointment dates are not allowed", 400);
  }

  const endTime = getEndTime(startTime);
  //prevents same time  booking
  const existingAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: {
      $gte: new Date(date.setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(24, 0, 0, 0)),
    },
    status: { $ne: "cancelled" },
  }).select("startTime endTime");

  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const newStart = toMinutes(startTime);
  const newEnd = toMinutes(endTime);

  const hasConflict = existingAppointments.some((appointment) => {
    const existingStart = toMinutes(appointment.startTime);
    const existingEnd = toMinutes(appointment.endTime);

    return newStart < existingEnd && newEnd > existingStart;
  });

  if (hasConflict) {
    throw new AppError(
      "This doctor already has an appointment during this time",
      409,
    );
  }

  //Check doctor's working schedule
  const schedule = await DoctorSchedule.findOne({
    doctor: doctorId,
  });

  if (!schedule) {
    throw new AppError("Doctor schedule not found", 404);
  }

  //check working day
  const day = date.getDay(); // Sunday = 0, Monday = 1

  if (!schedule.workingDays.includes(day)) {
    throw new AppError("Doctor is not available on this day", 400);
  }

  // Check whether appointment fits inside a session
  const isWithinSession = schedule.sessions.some((session) => {
    const sessionStart = toMinutes(session.startTime);
    const sessionEnd = toMinutes(session.endTime);

    const fitsSession = newStart >= sessionStart && newEnd <= sessionEnd;

    const overlapsBreak = (session.breaks || []).some((breakTime) => {
      return (
        newStart < toMinutes(breakTime.endTime) &&
        newEnd > toMinutes(breakTime.startTime)
      );
    });

    return fitsSession && !overlapsBreak;
  });

  if (!isWithinSession) {
    throw new AppError(
      "Selected time is outside working hours or during a break",
      400,
    );
  }

  try {
    return await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      department: doctor.department || "General",
      appointmentDate: date,
      startTime,
      endTime,
      createdBy,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        "This doctor already has an appointment at that start time",
        409,
      );
    }

    throw error;
  }
};

const getAppointments = async ({ user, page = 1, limit = 10 }) => {
  const filter = {};

  // Doctors can see only their own appointments.
  if (user.role === "doctor") {
    filter.doctor = user._id;
  }

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patient", "patientId name mobile")
      .populate("doctor", "name email department")
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  return {
    appointments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
const getEndTime = (startTime) => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + 15;

  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

const updateAppointment = async (appointmentId, updates, user) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  // Doctors can update only their own appointments.
  if (
    user.role === "doctor" &&
    appointment.doctor.toString() !== user._id.toString()
  ) {
    throw new AppError("You cannot update this appointment", 403);
  }

  if (updates.status) {
    const allowedStatuses = {
      receptionist: ["arrived", "cancelled"],
      super_admin: ["arrived", "cancelled"],
      doctor: ["completed"],
    };

    if (!allowedStatuses[user.role]?.includes(updates.status)) {
      throw new AppError("You cannot set this appointment status", 403);
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      throw new AppError("Appointment is already finalized", 400);
    }

    if (updates.status === "arrived" && appointment.status !== "scheduled") {
      throw new AppError(
        "Only scheduled appointments can be marked arrived",
        400,
      );
    }

    if (updates.status === "completed" && appointment.status !== "arrived") {
      throw new AppError("Only arrived appointments can be completed", 400);
    }

    appointment.status = updates.status;
  }

  if (updates.consultationNotes !== undefined) {
    if (user.role !== "doctor") {
      throw new AppError("Only doctors can add consultation notes", 403);
    }

    if (appointment.doctor.toString() !== user._id.toString()) {
      throw new AppError("You cannot update this appointment", 403);
    }

    appointment.consultationNotes = updates.consultationNotes;
  }

  await appointment.save();

  return appointment;
};

const cancelAppointment = async (appointmentId, user) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (!["super_admin", "receptionist"].includes(user.role)) {
    throw new AppError("You cannot cancel appointments", 403);
  }

  if (appointment.status === "completed") {
    throw new AppError("Completed appointments cannot be cancelled", 400);
  }

  if (appointment.status === "cancelled") {
    throw new AppError("Appointment is already cancelled", 400);
  }

  appointment.status = "cancelled";
  await appointment.save();

  return appointment;
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment,
};
