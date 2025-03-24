const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/index")
const accountController = require("../controllers/accountController")


router.get("/login", utilities.handleErrors(accountController.login));

module.exports = router;