/* *******************************
 * Required resources
 * ******************************* */
const accountModel = require("../models/account-model")
const utilities = require(".") // require the utilities > index.js file
const { body, validationResult } = require("express-validator") // require the express validator. This line contains two tools: body (allows validator to access body obj) and validationResult (contains all errors detected by validation process)
    const validate = {} // create a "validate" object

/* *******************************
 * Registration Data Validation Rules
 * ******************************* */
validate.registrationRules = () => { // anonymous function assigned to "registrationRules" property of the "validate" obj.
    return [ // "return" command and opening of array of checks for incoming data
        // firstname is required and must be a string
        body("account_firstname") //looks inside HTTPRequest for name-value pair, "account_firstname".
            .trim() // sanitizing function that removes whitespace at the beginning and end of incoming string
            .escape() // finds any special charachter and transforms it to an HTML entity rendering it not operational as code.
            .notEmpty() // validator ensuring that a value exists.
            .isLength({ min: 1 }) // validator checking for specified length requirement.
            .withMessage("Please provide a first name."), // On error message is sent

        // lastname is required and must be a string
        body("account_lastname") // Rule for lastname that is similar to rule for firstname
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // On error message is sent

        // valid email is required and cannot already exist in the DB
        body("account_email") // looks inside HTTPRequest for name-value pair, "account-email"
            .trim()
            .escape()
            .notEmpty()
            .isEmail() // function that checks the string for characters that should be present in a valid email address.
            .normalizeEmail()  // sanitization function that makes all email lowercse, as well as additional alterations to "canonicalize" an email.
            .withMessage("A valid email is required.") // On error message is sent
            .custom(async (account_email) => { //creates "custom" check. In custom check an async arrow function is created and the "account_email" variable is a parameter
                const emailExists = await accountModel.checkExistingEmail(account_email) // calling the function from the model and collecting the value returned (should be 0 or 1)
                if (emailExists){ // "if" control structure to check the result. Remember that "0" is FALSE, while any other value is TRUE.
                    throw new Error("Email exists. Please log in or use a different email") // throws an error and an error mssg indicating email exists and can't be reused if row count is 1.
                }
            }),

        //password is required and must be a strong password
        body("account_password") // begins password check process
            .trim()
            .notEmpty()
            .isStrongPassword({ // function for checking a passowrd string to meet specific requirements to be considered a strong password. Returns boolean term. Optionally can return a strength score.
                minLength: 12, //name-value pair that indicates the min length of the password
                minLowercase: 1, // name-value pair that indicates the min number of lowercase alphabetic characters
                minUppercase: 1, // name-value pair that indicates the min number of Uppercase alphabetic characters
                minNumbers: 1, // name-value pair that indicates the min number of numeric characters
                minSymbols: 1, // name-value pair that indicates the min number of symbol characters
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/* *********************************
 * Check data and return errors or continue to registration
 * ********************************* */
validate.checkRegData = async (req, res, next) => { // creates async, anonymous function accepts(req, res, next) as params, assigns it to the "checkRegData" property of the validate object.
    const { account_firstname, account_lastname, account_email, } = req.body //uses JS destructuring method to collect and store firstname, lastname, adn email values from the request body.
    let errors = [] // creates an empty "errors" array
    errors = validationResult(req) // calls the express-validator "validationResult" function and sends the request obj that contains all incoming data as a parameter. If there are errors they are stored in the errors array.
    if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
        let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
        res.render("account/registration", { // calls the render function to rebuild the registration view.
            errors, // this and items below are sent back to the view.
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email
        })
        return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
    }
    next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the registration to be carried out.
}

/* ***********************************
 * Login Data validation rules
 * *********************************** */
validate.loginRules = () => {
    return [
        // valid email is required
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),

        // password is required 
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1, 
            minUppercase: 1, 
            minNumbers: 1, 
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements.")
    ]
}

/* ************************************
 * Check data and return errors or continue to registration
 * ************************************ */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors,
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/* ******************************
 * Account Update Validation Rules
 * ****************************** */
validate.accountUpdateRules = () => {
    return [
         // firstname is required and must be a string
         body("account_firstname") //looks inside HTTPRequest for name-value pair, "account_firstname".
         .trim() // sanitizing function that removes whitespace at the beginning and end of incoming string
         .escape() // finds any special charachter and transforms it to an HTML entity rendering it not operational as code.
         .notEmpty() // validator ensuring that a value exists.
         .isLength({ min: 1 }) // validator checking for specified length requirement.
         .withMessage("Please provide a first name."), // On error message is sent

         // lastname is required and must be a string
        body("account_lastname") // Rule for lastname that is similar to rule for firstname
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // On error message is sent

        // valid email is required and cannot already exist in the DB
        body("account_email") // looks inside HTTPRequest for name-value pair, "account-email"
            .trim()
            .escape()
            .notEmpty()
            .isEmail() // function that checks the string for characters that should be present in a valid email address.
            .normalizeEmail()  // sanitization function that makes all email lowercse, as well as additional alterations to "canonicalize" an email.
            .withMessage("A valid email is required.") // On error message is sent
            .custom(async (account_id) => { //creates "custom" check. In custom check an async arrow function is created and the "account_email" variable is a parameter
                const currentAcctData  = await accountModel.getAccountByAccountId(account_id) // calling the function from the model and collecting the value returned 
                const currentEmail = currentAcctData.account_email
                if("account_email" !== currentEmail){
                    const emailExists = await accountModel.checkExistingEmail("account_email")
                    if (emailExists){ // "if" control structure to check the result. Remember that "0" is FALSE, while any other value is TRUE.
                        throw new Error("Email exists. Please log in or use a different email") // throws an error and an error mssg indicating email exists and can't be reused if row count is 1.
                    }
                }
                
            }),
    ]
}

/* *******************************
 * account change password rules
 * *******************************/
validate.changePasswordRules = () => {
    return [
         //password is required and must be a strong password
         body("account_password") // begins password check process
         .trim()
         .notEmpty()
         .isStrongPassword({ // function for checking a passowrd string to meet specific requirements to be considered a strong password. Returns boolean term. Optionally can return a strength score.
             minLength: 12, //name-value pair that indicates the min length of the password
             minLowercase: 1, // name-value pair that indicates the min number of lowercase alphabetic characters
             minUppercase: 1, // name-value pair that indicates the min number of Uppercase alphabetic characters
             minNumbers: 1, // name-value pair that indicates the min number of numeric characters
             minSymbols: 1, // name-value pair that indicates the min number of symbol characters
         })
         .withMessage("Password does not meet requirements."),
    ]
}

/* *********************************
 * Check update password data
 * *********************************/
validate.checkUpdatePasswordData = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body 
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {   
        let nav = await utilities.getNav()     
        const acctData = await accountModel.getAccountByAccountId (account_id) 
        req.flash("notice", "Password does not meet requirements.")
        const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`
        res.render("account/account-update", {
            errors,
            title: `Update ${acctName}'s Account`,
            nav,
            account_id,
            account_firstname: acctData.account_firstname,
            account_lastname: acctData.account_lastname,
            account_email: acctData.account_email
        })
        return
    }
    next()
}

/* *********************************
 * Check data and return errors or continue to update account
 * ********************************* */
validate.checkAcctUpdateData = async (req, res, next) => { // creates async, anonymous function accepts(req, res, next) as params, assigns it to the "checkRegData" property of the validate object.
    const { account_id, account_firstname, account_lastname, account_email } = req.body //uses JS destructuring method to collect and store firstname, lastname, and email values from the request body.
    
    let errors = [] // creates an empty "errors" array
    errors = validationResult(req) // calls the express-validator "validationResult" function and sends the request obj that contains all incoming data as a parameter. If there are errors they are stored in the errors array.
    if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
        let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
        const acctData = await accountModel.getAccountByAccountId(account_id)
        const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`
        res.render("account/account-update", { // calls the render function to rebuild the registration view.
            errors, // this and items below are sent back to the view.
            title: `Update ${acctName}'s Account`,
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email
        })
        return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
    }
    next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the registration to be carried out.
}

/* **********************************
 * New Message Validation Rules
 * **********************************/
validate.newMssgValidationRules = () => {
    return [
        // Selector must have a selection
        body("message_to")
        .not()
        .notEmpty()
        .withMessage("Please Select A Recipient."),

        //Subject must be a string
        body("message_subject")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a subject."),

        //Message Body must be a string
        body("message_body")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min:2 })
        .withMessage("Please provide a message.")
    ]
}

/* *******************************
 * Check new-message data and return errors or continue
 * *******************************/
validate.checkNewMssgData= async (req, res, next) => {
    const { message_subject, message_body, message_to } = req.body //uses JS destructuring method to collect and store firstname, lastname, adn email values from the request body.
        let errors = [] // creates an empty "errors" array
        errors = validationResult(req) // calls the express-validator "validationResult" function and sends the request obj that contains all incoming data as a parameter. If there are errors they are stored in the errors array.
        if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
            let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
            let messageToSelect = await utilities.buildMessageToList(message_to)
            res.render("account/new-message", { // calls the render function to rebuild the new-message view.
                errors, // this and items below are sent back to the view.
                title: "New Message",
                nav,
                messageToSelect: messageToSelect,
                message_subject,
                message_body,
                message_to
            })
            return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
        }
        next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the message to be sent.
    }

/* *******************************
 * Reply message validation rules
 * *******************************/
validate.replyMssgValidationRules = () => {
    return [
        // Message To must be a string
        body("message_to")
        .trim()
        .escape()
        .notEmpty(),
        //Subject must be a string
        body("message_subject")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a subject."),

        //Message Body must be a string
        body("message_body")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min:2 })
        .withMessage("Please provide a message.")
    ]
}

/* *************************************
 * Check Reply Message Data
 * *************************************/
validate.checkReplyMssgData = async (req, res, next) => { // creates async, anonymous function accepts(req, res, next) as params, assigns it to the "checkRegData" property of the validate object.
    const {
        message_subject,
        message_body,
        message_to,
        message_from,
        message_read,
        message_archived,
        original_message_id,
        original_message_from,
        original_message_subject,
        original_message_body,
        original_replyMssgToName,
        message_to_display,
        original_account_id
    } = req.body//uses JS destructuring method to collect and store firstname, lastname, and email values from the request body.
    
    let errors = [] // creates an empty "errors" array
    errors = validationResult(req) // calls the express-validator "validationResult" function and sends the request obj that contains all incoming data as a parameter. If there are errors they are stored in the errors array.
    if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
        let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
        const acctData = await accountModel.getAccountByAccountId(original_account_id)
        const acctName = `${acctData.account_firstname} ${acctData.account_lastname}`
        res.render("account/reply-message", { // calls the render function to rebuild the reply-message view.
            errors, // this and items below are sent back to the view.
            title: "Create Reply Message",
            nav,
            message_from,
            original_message_id,
            original_message_from,
            original_message_subject,
            original_replyMssgToName,
            message_to_display,
            original_message_body,
            original_account_id,
            message_subject,
            message_body,
            message_to,
            message_read,
            message_archived
        })
        return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
    }
    next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the registration to be carried out.
}



module.exports = validate