const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/index");
const validation = require("../utilities/inventory-validation");

// Apply middleware to restrict access to administrative routes
router.use(
  ["/add-classification", "/add-inventory", "/edit/:inventoryId", "/update", "/delete/:inventoryId", "/delete/"],
  utilities.checkAuthorizationManager // Middleware to check if the user is "Employee" or "Admin"
);

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", utilities.handleErrors(invController.buildByVehicleDetails));

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to edit inventory item
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

// Route to render the management view
router.get("/", invController.renderManagementView);
router.get("/add-classification", invController.renderAddClassificationView);
router.get("/add-inventory", invController.renderAddInventoryView);

router.post(
  "/add-classification",
  validation.classificationRules, // This should validate the classification name
  utilities.handleErrors(invController.addClassification) // This should handle the POST request
);

router.post(
  "/add-inventory",
  utilities.handleErrors(invController.addInventory) // This should handle the POST request
);

router.post(
  "/update/",
  validation.inventoryRules(),
  utilities.handleErrors(invController.updateInventory)
);

router.get("/delete/:inv_id", utilities.handleErrors(invController.getDeleteConfirmationView));

router.post("/delete/:inv_id", utilities.handleErrors(invController.deleteInventoryItem));

module.exports = router;