const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build inventory item by inventory_id view
 * *************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInvItemByInvId(inv_id)
  const grid = await utilities.buildInvItemDetails(data)
  let nav = await utilities.getNav()
  const vehicleMake = data.inv_make
  const vehicleModel = data.inv_model
  const vehicleYear = data.inv_year
  res.render("./inventory/details", {
    title: `${vehicleYear} ${vehicleMake} ${vehicleModel}`,
    nav,
    grid,
  })
}

/* ***************************
 * Build Inventory Management View
 * *************************** */
invCont.buildInvManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/inventory-management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
  })
}

/* ****************************
 * Deliver add-classificaton view
 * **************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
    
}

/* *****************************
 * Process classification_name DB insertion
 * ***************************** */
invCont.insertClassificationName = async function(req, res) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const invResult = await invModel.postClassificationName( // calls the function, from model, uses "await" to indicate that result should be returned and wait until it arrives.
    classification_name // parameter being passed into the function
  )

  if (!invResult) { //opens if statement to determine if a result was received
    req.flash( //sets a flash message to be displayed.
        "notice",
        `congratulations,${classification_name} successfully inserted into the database`
    )
    return res.status(201).render("inventory/add-classification", { // calls render function to return the add-classification view with an HTTP 201 status for a successful insertion of data
        title: "Add Classification",
        nav,
        errors: null,
    })
  } else { // closes the if block and opens the else block
    req.flash("notice", "Sorry, the classification name failed to insert in database.") // calls render function, sends thr route to trigger a return to the add-classification view 
    return res.status(501).render("inventory/add-classification", { //sends HTTP 501 status code. (not successful)
        title: "Add Classification ",//elements of the data obj being sent to the view.
        nav,
        errors: null,
    })
  }      
}

/* ****************************
 * Deliver add-invetory view
 * **************************** */
invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav()

  let classificationList = await utilities.buildClassificationList()

  res.render('inventory/add-inventory', {
    title: "Add Vehicle Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* *****************************
 * Process add-inventory DB insertion
 * ***************************** */
invCont.insertAddInventory = async function(req, res) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body

  const invResult = await invModel.postAddInventory( // calls the function, from model, uses "await" to indicate that result should be returned and wait until it arrives.
    classification_id, // parameter being passed into the function
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  )

  if (!invResult) { //opens if statement to determine if a result was received
    req.flash( //sets a flash message to be displayed.
        "notice",
        "Congratulations, vehicle has been successfully inserted into the database."
    )
    return res.status(201).render("inventory/add-inventory", { // calls render function to return the add-inventory view with an HTTP 201 status for a successful insertion of data
        title: "Add Inventory",
        nav,
        classificationList,        
        errors: null,
    })
  } else { // closes the if block and opens the else block
    req.flash("notice", "Sorry, the vehicle has failed to insert in database.") // calls render function, sends thr route to trigger a return to the add-classification view 
    return res.status(501).render("inventory/add-inventory", { //sends HTTP 501 status code. (not successful)
        title: "Add inventory ",//elements of the data obj being sent to the view.
        nav,
        classificationList,
        errors: null,
    })
  }      
}

/* *****************************
 * Return Inventory by Classification As JSON
 * ***************************** */
invCont.getInventoryJSON = async (req, res, next) => { // The opening of the function.
  const classification_id = parseInt(req.params.classification_id) // collects and stores the classification_id that has been passed as a parameter through the URL. Uses the JavaScript parseInt() to cast it as an integer, which is also a security step.
  const invData = await invModel.getInventoryByClassificationId(classification_id) // calls the model-based function to get the data based on the classification_id.
  if (invData[0].inv_id) { // checks to make sure there is a value in the first element of the array being returned.
    return res.json(invData) // if data is present, returns the result set as a JSON object.
  } else { // ends the "if" check and opens and "else" 
    next(new Error("No data returned")) // throws an error for the Express error handler if no data is found.
  } // ends the "else" structure
} // ends the function




module.exports = invCont