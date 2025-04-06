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
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
      flashMessage: req.flash("notice"),
      classificationSelect
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id); // Get the inventory ID from the URL
  try {
    let nav = await utilities.getNav(); // Fetch navigation
    const itemData = await invModel.getVehicleById(inv_id); // Fetch the inventory item

    if (!itemData) {
      // Handle case where no item is found
      return next({ status: 404, message: "Inventory item not found" });
    }

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id); // Build classification dropdown
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`; // Create item name for the title

    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    next(error); // Pass errors to the error handler
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `${itemName} was successfully updated!`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build and deliver the delete confirmation view
 * ************************** */
invCont.getDeleteConfirmationView = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id; // Collect the inv_id from the request
    const nav = await utilities.getNav(); // Build the navigation
    const inventory = await invModel.getVehicleById(inv_id); // Get inventory data from the database

    if (!inventory) {
      throw new Error("Inventory item not found");
    }

    const name = `${inventory.inv_make} ${inventory.inv_model}`; // Build the name variable

    // Render the delete confirmation view
    res.render("inventory/delete-confirm", {
      title: `Delete ${name}`,
      nav,
      errors: null,
      inventory, // Pass the inventory data to the view
    });
  } catch (error) {
    console.error("Error delivering delete confirmation view:", error);
    next(error); // Pass the error to the error-handling middleware
  }
};

/* ***************************
 *  Carry out the delete process
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteVehicleById(inv_id);

    if (deleteResult) {

      req.flash("notice", "The inventory item was successfully deleted.");
      res.redirect("/inv/");
    } else {

      req.flash("error", "Failed to delete the inventory item. Please try again.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    next(error);
  }
};

module.exports = invCont;
