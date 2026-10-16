const doctorScheduleService = require("../services/doctorScheduleService");

const saveSchedule = async (req, res, next) => {
  try {
    const schedule = await doctorScheduleService.saveDoctorSchedule({
      ...req.body,
      doctorId: req.params.doctorId,
    });

    return res.status(200).json({
      success: true,
      message: "Doctor schedule saved successfully",
      data: { schedule },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { saveSchedule };
