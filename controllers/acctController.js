/* ***************************
 * Required resources
 * *************************** */
const utilities = require("../utilities/")
const acctModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { validationResult } = require("express-validator")
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
    const accountData = res.locals.accountData
    const message_to = accountData.account_id
    const mssgCount = await acctModel.getMssgCountByMssgTo(message_to)
   
    res.render("account/account-management", {
        title: "Account Management", 
        nav,
        mssgCount,
        errors: null,
    })
}

/* ***********************************
 * Deliver Account Update View
 * *********************************** */
async function buildAccountUpdate (req, res, next) {
    const account_id = req.params.accountId
    console.log(account_id)
    let nav = await utilities.getNav()
    const acctData = await acctModel.getAccountByAccountId (account_id)
    console.log(acctData)
    const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`
    res.render("account/account-update", {
      title: `Update ${acctName}'s Account`,
      nav,
      errors: null,
      account_id: acctData.account_id,
      account_firstname: acctData.account_firstname,
      account_lastname: acctData.account_lastname,
      account_email: acctData.account_email,
      account_password: acctData.account_password      
    })
  }

/* *************************
 * Process updateAccount
 * ************************* */
async function updateAccount(req, res) { // begins async function and passing in req, res, and next as params
    let nav = await utilities.getNav() // Calls nav function from utilities
    const account_id = req.body.account_id
    const acctData = await acctModel.getAccountByAccountId (account_id)
    const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`
    const { account_firstname, account_lastname, account_email } = req.body //collects and stores values from HTML form
    

    const updateResult = await acctModel.updateAccount( // calls the function, from model, uses "await" to indicate that result should be returned and wait until it arrives.
        account_id,
        account_firstname, // parameter being passed into the function
        account_lastname, //parameter being passed into the function
        account_email, // parameter being passed into the function
    )

    if (updateResult) { //opens if statement to determine if a result was received
        req.flash( //sets a flash message to be displayed.
            "notice",
            `Congratulations, ${account_firstname} ${account_lastname} your account is updated!`
        )
        return res.status(201).render("account/account-management", { // calls render function to return the account-managment view with an HTTP 201 status for a successful insertion of data
            title: "Account Management", 
            nav,
            errors: null,
        })
      } else { // closes the if block and opens the else block
        req.flash("notice", "Sorry, the account update failed.") // calls render function, sends thr route to trigger a return to the account-update view 
        return res.status(501).render("account/account-update", { //sends HTTP 501 status code. (not successful)
                title: `Update ${acctName}'s Account`,
                nav,
                errors: null,
                account_id: acctData.account_id,
                account_firstname: acctData.account_firstname,
                account_lastname: acctData.account_lastname,
                account_email: acctData.account_email,   
              })
      }    
}

/* *************************
 * Process Password Update
 * ************************* */
async function updatePassword(req, res) { // begins async function and passing in req, res, and next as params
    let nav = await utilities.getNav() // Calls nav function from utilities
    const account_id = req.body.account_id
    const account_password = req.body.account_password
    const acctData = await acctModel.getAccountByAccountId (account_id) 
    const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`

    // check password match
    const passwordMatch = await bcrypt.compare(account_password, acctData.account_password)
    if (passwordMatch) {
        req.flash("notice", "You cannot use the same password. Please enter a new password.")
        return res.status(501).render("account/account-update", {
            title: `Update ${acctName}'s Account`,
            nav,
            errors: null,
            account_id: account_id,
            account_firstname: acctData.account_firstname,
            account_lastname: acctData.account_lastname,
            account_email: acctData.account_email
        })
    }

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error processing the passowrd update.')
        return res.status(501).render("account/account-update", {
            title: `Update ${acctName}'s Account`,
            nav,
            errors: null,
            account_id: account_id,
            account_firstname: acctData.account_firstname,
            account_lastname: acctData.account_lastname,
            account_email: acctData.account_email
        })
    }   

    const updateResult = await acctModel.updatePassword(account_id, hashedPassword)

    if (updateResult) {
        req.flash("notice", `Congratulations, ${acctName} your password has been updated.`)
        return res.status(201).render("account/account-management", {
            title: "Account Management",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the password update failed.")
        return res.status(501).render("account/account-update", {
            title: `Update ${acctName}'s Account`,
            nav,
            errors: null,
            account_id: account_id,
            account_firstname: acctData.account_firstname,
            account_lastname: acctData.account_lastname,
            account_email: acctData.account_email
        })
    }
}

/* *********************************
 * Account Logout Process
 * *********************************/
const logoutProcess = (req, res) => {
    res.clearCookie("jwt")
    req.flash("notice", "You are logged out.")
    return res.redirect("/")
}

/* **********************************
 * Build and deliver inbox view
 * **********************************/
async function buildInbox (req, res) {
    let nav = await utilities.getNav() // gets the nav from the utilities.getNav() function
    const message_to = req.params.accountId
    let acctData = await acctModel.getAccountByAccountId(message_to)
    let inboxMssg = await acctModel.getMssgByMssgTo(message_to)
    console.log(inboxMssg)
    const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`

    let mssgTableHTML
    if (inboxMssg && inboxMssg.length > 0) {
         mssgTableHTML = await utilities.buildMssgDisplayTable(inboxMssg)
        
    } else {
        mssgTableHTML = '<p>You have no messages in your inbox.</p>'
    }
    res.render("account/inbox", {
        title: `${acctName} Inbox`,
        nav,
        mssgTableHTML,
        errors: null,
    })
    
  } 

/* ***************************
 * Build new-message view
 * *************************** */
async function buildNewMessage(req, res, next) {
    let nav = await utilities.getNav()
    let account_id = await utilities.getLoggedInAcctId(req)
    if (!account_id) {
        return res.redirect("/account/login")
    }
    
    const message_from = account_id

    let messageToSelect = await utilities.buildMessageToList()
    console.log(messageToSelect)
    res.render("account/new-message", {
      title: "New Message",
      nav,
      account_id,
      messageToSelect,
      message_from,
      errors: null,
    })
  }

  /* *************************
 * build registration view
 * ************************* */
  async function buildRegistration(req, res, next) { // begins async function passing in req, res, and next params
    let nav = await utilities.getNav() // Calls nav function from utilities
    res.render("account/registration", { // data items to be sent to the registration view
        title: "Registration",
        nav,
        errors: null,
    })
}

/* *************************
 * Process Send Message
 * ************************* */
async function sendMessage(req, res) { // begins async function and passing in req, res, and next as params
    let nav = await utilities.getNav() // Calls nav function from utilities
    let account_id = await utilities.getLoggedInAcctId(req) 
    console.log(account_id)
    const acctData = await acctModel.getAccountByAccountId(account_id)    
    const acctName =`${acctData.account_firstname} ${acctData.account_lastname}`
    const { message_subject, message_body, message_to, message_from, message_read, message_archived} = req.body //collects and stores values from HTML form
    console.log(req.body)
    let messageToSelect = await utilities.buildMessageToList()
    

    const mssgResult = await acctModel.sendMessage( // calls the function, from model, uses "await" to indicate that result should be returned and wait until it arrives.
        message_subject, 
        message_body,
        message_to,//parameter being passed into the function
        message_from,// parameter being passed into the function
        message_read,//parameter being passed into the function
        message_archived// parameter being passed into the function        
    )

    if (mssgResult) { //opens if statement to determine if a result was received
        //let mssgTableHTML = await utilities.buildMssgDisplayTable(acctData)
        let mssgTableHTML = "table"
        req.flash( //sets a flash message to be displayed.
            "notice",
            "Message Sent" 
        )
        return res.status(201).render("account/inbox", { // calls render function to return the login view with an HTTP 201 status for a successful insertion of data
            title: `${acctName} Inbox`,
            nav, 
            mssgTableHTML,           
            errors: null,
        })
      } else { // closes the if block and opens the else block
        req.flash("notice", "Sorry, message not sent.") // calls render function, sends thr route to trigger a return to the registration view 
        
        return res.status(501).render("account/new-message", { //sends HTTP 501 status code. (not successful)
            title: "New Message",//elements of the data obj being sent to the view.
            nav,
            messageToSelect,
            errors: null,
        })
      }    
}

  

   






module.exports = { buildLogin, buildRegistration, registerAccount, accountLogin, buildAccountManagement, buildAccountUpdate, updateAccount, updatePassword, logoutProcess,
    buildInbox, buildNewMessage, sendMessage
 }