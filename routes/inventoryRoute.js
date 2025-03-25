const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/index")
const validate = require('../middleware/validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:id", utilities.handleErrors(invController.buildByVehicleDetails));



// Route to render the management view
router.get('/management', invController.renderManagementView);
router.get('/add-classification', invController.renderAddClassificationView);
router.get('/add-inventory', invController.renderAddInventoryView);

router.post('/add-classification', 
    validate.checkClassificationName, // This should validate the classification name
    utilities.handleErrors(invController.addClassification) // This should handle the POST request
);

router.post('/add-inventory',
    utilities.handleErrors(invController.addInventory) // This should handle the POST request
);

module.exports = router;