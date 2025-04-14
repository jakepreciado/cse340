const express = require("express");
const router = new express.Router();
const appointmentController = require("../controllers/appointmentController");
const utilities = require("../utilities/");

router.post("/schedule", (req, res, next) => {
    console.log("POST /appointments/schedule route hit");
    next();
  }, utilities.handleErrors(appointmentController.scheduleAppointment));

router.get("/", utilities.checkLogin, utilities.handleErrors(appointmentController.getAppointments));
router.post("/cancel", utilities.checkLogin, utilities.handleErrors(appointmentController.cancelAppointment));

module.exports = router;