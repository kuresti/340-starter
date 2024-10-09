/* *****************************
 * Needed Resources
 * Account routes
 * ***************************** */
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/acctController")
const utilities = require("../utilities/")

/* *****************************
 * Deliver Login View
 * ***************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

module.exports = router
