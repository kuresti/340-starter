/* *******************************
 * Required resources
 * ******************************* */
const utilities = require(".")
const { body, validationResult } = require("express-validator") // require the express validator. This line contains two tools: body (allows validator to access body obj) and validationResult (contains all errors detected by validation process)
    const validate = {} // create a "validate" object

/* *******************************
 * addClassification Data Validation Rules
 * ******************************* */
validate.addClassificationRules = () => {
   return[
    // classification_name cannot contain a space or special character of any kind
    body("classification_name")
        .isAlpha()
        .withMessage("Classification name must contain only alphabetic characters")
        .isLength({ min: 1 })
        .withMessage("Classification name cannot be empty")
    ]
}

/* *******************************
 * Check data and return errors or continue to insert data to DB
 * ******************************* */
validate.checkClassificationNameData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
        let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
        res.render("inventory/add-classification", { // calls the render function to rebuild the registration view.
            errors, // this and items below are sent back to the view.
            title: "Add Classification",
            nav,
            classification_name,
        })
        return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
    }
    next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the classification_name to be inserted into the DB.
}

/* *******************************
 * addInventory Data Validation Rules
 * ******************************* */
validate.addInventoryRules = () => {
    return[
    // Inventory classification option must have a selection
    body("classification_id")
    .not()
    .isEmpty()
    .withMessage("Please select a classification."),

    // Inv_make must be a string
    body("inv_make")
    .trim()
    .escape()
    .notEmpty()
    .isLength(({ min: 1}))
    .withMessage("Please provide make of vehicle"),
    
    // Inv_model must be a string
    body("inv_model")
    .trim()
    .escape()
    .notEmpty()
    .isLength(({ min:1 }))
    .withMessage("Please provide model of vehicle"),

    // Inv_year must be a 4 digit number
    body("inv_year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1})
    .withMessage(`Please enter a year between 1900 and ${new Date().getFullYear() + 1}.`)
    .isLength({ min: 4, max: 4 })
    .withMessage("Please enter a 4 digit year."),

    // Inv_description must be a string.
    body("inv_description")
    .trim()
    .escape()
    .notEmpty()
    .isLength(({ min: 1 }))
    .withMessage("Please provide a description of the vehicle."),

    // inv_Image image path is a valid string and ends with a valid image extension
    body("inv_image")
    .isString()
    .withMessage("Please enter an image path as a valid string.")
    .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
    .withMessage("Please enter an image path that ends with a valid image extension (jpg, jpeg, png, gif, webp"),

    // inv_thumbnail image path is a valid string and ends with a valid image extension
   body("inv_thumbnail")
   .isString()
   .withMessage("Please enter an image path as a valid string.")
   .matches(/\.(jpg|jpeg|png|gif|webp)$/i)
   .withMessage("Please enter an image path that ends with a valid image extension (jpg, jpeg, png, gif, webp"),

   // inv_price must be an integer
   body("inv_price")
   .trim()
   .escape()
   .notEmpty()
   .isLength(({ min: 1 }))
   .withMessage("Please enter the price of the vehicle"),

   // inv_miles must be an integer
   body("inv_miles")
   .trim()
   .escape()
   .notEmpty()
   .isLength(({ min: 1 }))
   .withMessage("Please enter the mileage fo the vehicle"),

   // inv_color must be a valid string
   body("inv_color")
   .trim()
   .escape()
   .notEmpty()
   .isLength(({ min: 1 }))
   .withMessage("Please enter the color of the vehicle.")
 ]
}

/* ***********************************
 * Check data and return errors or continue to insert data to DB
 * *********************************** */
validate.checkAddInventoryData = async (req, res, next) => { // creates async, anonymous function accepts(req, res, next) as params, assigns it to the "checkAddInventoryData" property of the validate object.
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body //uses JS destructuring method to collect and store firstname, lastname, adn email values from the request body.
    let errors = [] // creates an empty "errors" array
    errors = validationResult(req) // calls the express-validator "validationResult" function and sends the request obj that contains all incoming data as a parameter. If there are errors they are stored in the errors array.
    if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
        let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", { // calls the render function to rebuild the add-inventory view.
            errors, // this and items below are sent back to the view.
            title: "Add Inventory",
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
        })
        return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
    }
    next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the registration to be carried out.
}

/* ***********************************
 * Check update data and return errors or continue to insert data to DB
 * *********************************** */
validate.checkUpdateData = async (req, res, next) => { // creates async, anonymous function accepts(req, res, next) as params, assigns it to the "checkAddInventoryData" property of the validate object.
    const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, inv_id } = req.body //uses JS destructuring method to collect and store firstname, lastname, email, and inId values from the request body.
    let errors = [] // creates an empty "errors" array
    errors = validationResult(req) // calls the express-validator "validationResult" function and sends the request obj that contains all incoming data as a parameter. If there are errors they are stored in the errors array.
    if (!errors.isEmpty()) { // checks the errors array to see if any errors exist. 
        let nav = await utilities.getNav() //calls for the nav bar to be queried and built.
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", { // calls the render function to rebuild the add-inventory view.
            errors, // this and items below are sent back to the view.
            title: "Modify " + itemName,
            nav,
            classificationList,
            classification_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            inv_id,
        })
        return // the "return" command sends control of the process back to the application, so the view in the browser does not "hang".
    }
    next() // if no errors are detected, the "next()" function is called, which allows the process to continue into the controller for the registration to be carried out.
}

module.exports = validate

