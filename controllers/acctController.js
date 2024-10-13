/* ***************************
 * Required resources
 * *************************** */
const utilities = require("../utilities/")
const acctModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* *************************** 
 * Deliver login view
 * *************************** */
async function buildLogin(req, res, next) { // Function is declared as an async function, passing in req, res, nex as params
    let nav = await utilities.getNav() // Retrieves and stores the nav bar string for use in the view
    res.render("account/login", { // Calls the render function and indicates the view to be returned
        title: "Login", // data item to be sent to the view
        nav, // data item to be sent to the view
        errors: null,
    })
}

/* **************************
 * Deliver registration view
 * ************************** */
async function buildRegistration(req, res, next) { // begins async function passing in req, res, and next params
    let nav = await utilities.getNav() // Calls nav function from utilities
    res.render("account/registration", { // data items to be sent to the registration view
        title: "Registration",
        nav,
        errors: null,
    })
}

/* *************************
 * Process Registration
 * ************************* */
async function registerAccount(req, res) { // begins async function and passing in req, res, and next as params
    let nav = await utilities.getNav() // Calls nav function from utilities
    const { account_firstname, account_lastname, account_email, account_password} = req.body //collects and stores values from HTML form
    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        return res.status(500).render("account/registration", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const regResult = await acctModel.registerAccount( // calls the function, from model, uses "await" to indicate that result should be returned and wait until it arrives.
        account_firstname, // parameter being passed into the function
        account_lastname, //parameter being passed into the function
        account_email, // parameter being passed into the function
        hashedPassword //parameter being passed into the function
    )

    if (regResult) { //opens if statement to determine if a result was received
        req.flash( //sets a flash message to be displayed.
            "notice",
            `congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        return res.status(201).render("account/login", { // calls render function to return the login view with an HTTP 201 status for a successful insertion of data
            title: "Login",
            nav,
            errors: null,
        })
      } else { // closes the if block and opens the else block
        req.flash("notice", "Sorry, the registration failed.") // calls render function, sends thr route to trigger a return to the registration view 
        return res.status(501).render("account/registration", { //sends HTTP 501 status code. (not successful)
            title: "Registration",//elements of the data obj being sent to the view.
            nav,
            errors: null,
        })
      }    
}











module.exports = { buildLogin, buildRegistration, registerAccount }