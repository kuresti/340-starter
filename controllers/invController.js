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


module.exports = invCont