const Patient = require("../models/Patient");
const AppError = require("../utils/AppError");
const crypto = require("crypto");

const createPatient = async ({ name, mobile, dateOfBirth, gender }) => {
  const patientId = `PT-${crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 12)
    .toUpperCase()}`;
  try {
    return await Patient.create({
      patientId,
      name,
      mobile,
      dateOfBirth,
      gender,
    });
  } catch (error) {
    throw error;
  }
};

const searchPatients = async ({ search = "", page = 1, limit = 10 }) => {
  const filter = {};

  if (search.trim()) {
    filter.$or = [
      { patientId: { $regex: search.trim(), $options: "i" } },
      { name: { $regex: search.trim(), $options: "i" } },
      { mobile: { $regex: search.trim(), $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);
  return {
    patients,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
module.exports = { createPatient, searchPatients };
