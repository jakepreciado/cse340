const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


invCont.buildByVehicleDetails = async function (req, res, next) {
  const vehicleId = req.params.id;
  try {
    const vehicleData = await invModel.getVehicleById(vehicleId);
    if (vehicleData) {
      let nav = await utilities.getNav();
      res.render("inventory/vehicle", {
        title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
        vehicle: vehicleData,
        nav
      });
    } else {
      next({ status: 404, message: "Vehicle not found" });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = invCont;
