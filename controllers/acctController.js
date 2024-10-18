/* ***************************
 * Required resources
 * *************************** */
const utilities = require("../utilities/")
const acctModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

/* *******************************
 * Process login request
 * ******************************* */
async function accountLogin(req, res) { // opens async function and accepts req and res as parameters
    let nav = await utilities.getNav() // builds the nav bar for use in views
    const { account_email, account_password } = req.body // collects incoming data from the reqest body
    const accountData = await acctModel.getAccountByEmail(account_email) // makes a call to a mode-based function to locate data associated with an existing email. If any returned data it is stored in "accountData"
    
    if (!accountData) { // An "if" to test if nothing was returned
        req.flash("notice", "Please check your credentials and try again.") // If the variable is empty, a message is sent
        return res.status(400).render("account/login", { // Response obj is used to  return the login view to the browser
            title: "Login", // data to be returned to the view
            nav,
            errors: null,
            account_email,
        }) // Closes data and render obj
    } // Ends the if test
  try{ // opens try-catch block
   const passwordMatch = await bcrypt.compare(account_password, accountData.account_password) // passing response from bcrypt.compare into passwordMatch variable
   if (!passwordMatch) { // "if" statement to test if the passwordMatch returned anything
   req.flash("notice", "Please check your credentials and try again.") // If the variable is false a flash message will be sent
   return res.status(400).render("account/login", { // Renders the login view
    title: "Login",// data returned to the view
    nav,
    errors: null,
    account_email,
   })
   }
   delete accountData.account_password // If the passwords match the hashed password will be deleted with JS delete
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600}) // creates a JWT token
   if (process.env.NODE.ENV === 'development') { // "If" statement to test if the environment is 'development'
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000}) // If it is the 'development' environment then the cookie is passed only thorugh HTTP protocol
   } else {
    res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 *1000}) // If it is the 'production' environment then the cookie is passed only through HTTPS
   }
   return res.redirect("/account/account-management")
} catch (error) {
   return new Error('Access Forbidden')  
 }
} // Ends the function

/* ********************************* 
 * Build account management view
 * ********************************* */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/account-management", {
        title: "Account Management", 
        nav,
        errors: null,
    })

}







module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccountManagement }