const appointmentService = require("../services/appointmentService");

const createAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.createAppointment({
      ...req.body,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

const getAppointments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let limit = parseInt(req.query.limit, 10) || 10;

    if (limit < 1) limit = 1;
    if (limit > 50) limit = 50;

    const result = await appointmentService.getAppointments({
      user: req.user,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Appointments retrieved successfully",
      data: { appointments: result.appointments },
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.updateAppointment(
      req.params.id,
      req.body,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.user,
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: { appointment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment,
};
