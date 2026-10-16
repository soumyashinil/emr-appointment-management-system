
const slotService = require("../services/slotService");

const getAvailableSlots = async (req, res, next) => {
  try {
    const slots = await slotService.getAvailableSlots({
      doctorId: req.query.doctorId,
      date: req.query.date,
    });

    res.status(200).json({
      success: true,
      data: { slots },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAvailableSlots };
