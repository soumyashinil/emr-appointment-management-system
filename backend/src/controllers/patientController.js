const patientService = require("../services/patientService");

const createPatient = async (req, res, next) => {
  try {
    const patient = await patientService.createPatient(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: { patient },
    });
  } catch (error) {
    next(error);
  }
};

const searchPatients = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let limit = parseInt(req.query.limit, 10) || 10;

    if (limit < 1) {
      limit = 1;
    }

    if (limit > 50) {
      limit = 50;
    }

    const result = await patientService.searchPatients({
      search: req.query.search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: { patients: result.patients },
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPatient, searchPatients };
