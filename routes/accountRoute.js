/* *****************************
 * Needed Resources
 * Account routes
 * ***************************** */
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/acctController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")
/* *****************************
 * Deliver Login View
 * ***************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************
 * Deliver registration view
 * **************************** */
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))

/* ****************************
 * Deliver management view
 * **************************** */
router.get("/account-management", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

/* ****************************
 * Process Registration
 * **************************** */
// Process the reigstration data
router.post( // Router object using a "post" property.
    "/registration", // Path being watched for in the route.
    regValidate.registrationRules(), // The function containing the rules to be used in the validation process.
    regValidate.checkRegData, // The call to run the validation and handle the errors, if any.
    utilities.handleErrors(accountController.registerAccount) // The call to the controller to handle the registration, if no errors occur in the validation process.
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )











module.exports = router


