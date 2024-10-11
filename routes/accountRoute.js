/* *****************************
 * Needed Resources
 * Account routes
 * ***************************** */
const regValidate = require("../utilities/account-validation")
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/acctController")
const utilities = require("../utilities")


/* *****************************
 * Deliver Login View
 * ***************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************
 * Deliver registration view
 * **************************** */
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))

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
router.post( // has the router listening for a "post" request.
    "/login", // indicates the route being watched for inside the post request.
    (req, res) => { //an arrow function that accepts req, res obj as params
        res.status(200).send('login process') //indicates that the req was successful and returns "login process"
    }
)

module.exports = router


