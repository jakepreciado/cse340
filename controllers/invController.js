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

/* ***************************
 *  Render Management View
 * ************************** */
invCont.renderManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      error: null,
      flashMessage: req.flash("info"),
    });
  } catch (error) {
    next(error);
  }
};







/* ***************************
 *  Add New Classification
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  console.log("addClassification controller executed");
  const { classification_name } = req.body; // Match the form field name
  console.log("Received classification_name:", classification_name)

  try {
    const result = await invModel.insertClassification(classification_name); // Insert into the database
    console.log("Database insertion result:", result);
    
    if (result) {
      // Rebuild the navigation bar
      const nav = await utilities.getNav();

      // Redirect to the management view with a success message
      req.flash("info", `Classification "${classification_name}" added successfully.`);
      res.render("inventory/management", {
        title: "Add New Classification",
        nav,
        error: null,
        flashMessage: req.flash("info"),
      });
    } else {
      throw new Error("Failed to add classification.");
    }
  } catch (error) {
    console.log('Failure:', error);
    req.flash("error", "Failed to add classification.");
    const nav = await utilities.getNav(); // Ensure nav is rebuilt even on failure
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      error: null,
      flashMessage: req.flash("info"),
    });
  }
};


/* ***************************
 *  Render Add Classification View
 * ************************** */
invCont.renderAddClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav(); // Fetch the navigation bar
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      flashMessage: req.flash("info"),
      errors: [], // Pass an empty errors array
    });
    console.log("Path to view:", "inventory/add-classification");
  } catch (error) {
    console.log('Failure:', error);
    next(error);
  }
};


/* ***************************
 *  Add New Inventory Item
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body; // Extract form data

    // Insert the new inventory item into the database
    const result = await invModel.insertInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });

    if (result) {
      // Success: Redirect to the management view with a success message
      req.flash("info", "New inventory item added successfully.");
      res.redirect("management");
    } else {
      // Failure: Render the add-inventory view with an error message
      const nav = await utilities.getNav();
      req.flash("error", "Failed to add the inventory item.");
      res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList: await utilities.buildClassificationList(classification_id),
        messages: req.flash("error"),
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
    }
  } catch (error) {
    console.error("Error adding inventory item:", error);
    next(error);
  }
};


/* ***************************
 *  Render Add Inventory View
 * ************************** */
invCont.renderAddInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav(); // Fetch the navigation bar
    const classificationList = await utilities.buildClassificationList(); // Build classification dropdown
    res.render("inventory/add-inventory", {
      title: "Add New Inventory",
      nav,
      classificationList,
      flashMessage: req.flash("info"),
      errors: [], // Pass an empty errors array
    });
  } catch (error) {
    console.error("Error rendering add-inventory view:", error);
    next(error);
  }
};

module.exports = invCont;
