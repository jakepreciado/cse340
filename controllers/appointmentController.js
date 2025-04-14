const appointmentModel = require("../models/appointment-model");
const utilities = require("../utilities/");

const appointmentController = {};

appointmentController.scheduleAppointment = async (req, res, next) => {
    const { inv_id, appointment_date } = req.body;
    const account_id = req.session.account_id; // Assume user is logged in and session contains account_id
  
    console.log("Session data:", req.session); // Debugging
    console.log("Scheduling appointment for account:", account_id, "for inventory ID:", inv_id, "on date:", appointment_date);
  
    if (!account_id) {
      req.flash("error", "You must be logged in to schedule an appointment.");
      return res.redirect("/account/login");
    }
  
    try {
      await appointmentModel.createAppointment(account_id, inv_id, appointment_date);
      req.flash("notice", "Appointment scheduled successfully!");
      res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      req.flash("error", "Failed to schedule appointment. Please try again.");
      res.redirect(`/inv/detail/${inv_id}`);
    }
  };



appointmentController.getAppointments = async (req, res, next) => {
  const account_id = req.session.account_id;
  try {
    const appointments = await appointmentModel.getAppointmentsByAccount(account_id);
    const nav = await utilities.getNav();
    res.render("account/appointments", {
      title: "My Appointments",
      nav,
      appointments,
      errors: null,
      account_id,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    next(error);
  }
};

appointmentController.cancelAppointment = async (req, res, next) => {
    const { appointment_id } = req.body;
  
    try {
      await appointmentModel.deleteAppointment(appointment_id);
      req.flash("notice", "Appointment canceled successfully.");
      res.redirect("/appointments/");
    } catch (error) {
      console.error("Error canceling appointment:", error);
      req.flash("error", "Failed to cancel appointment. Please try again.");
      res.redirect("/appointments/");
    }
  };

module.exports = appointmentController;