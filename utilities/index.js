const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li class="inv-card">'
      grid +=  '<a href="../../inv/details/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + ' details"><img class="center-inv-img" src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" ></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/details/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ***************************************
 * Build the details view HTML
 * *************************************** */
Util.buildInvItemDetails = async function(data) {
  let grid = " "
  if (data) {   
    grid += '<div class="details-wrapper">' 
    grid += '<div class="vehicle-title-img">'
    grid += `<img src="${data.inv_image}" alt="Image of ${data.inv_make} ${data.inv_model} on CSE Motors">`
    grid += '</div>'
    grid += '<div class="vehicle-details">'
    grid += `<h2>${data.inv_make} ${data.inv_model} Details</h2>`
    grid += `<div class="vehicle-price"><h3>Price: </h3><span>$${new Intl.NumberFormat('en-US').format(data.inv_price)}</span></div>`
    grid += `<div class="vehicle-description"><h3>Description: </h3><p>${data.inv_description}</p></div>`
    grid += `<div class="vehicle-color"><h3>Color: </h3><p>${data.inv_color}</p></div>`
    grid += `<div class="vehicle-miles"><h3>Miles: </h3><span>${new Intl.NumberFormat('en-US').format(data.inv_miles)}</span></div> `
    grid += '</div>'
    grid += '</div>'
  } else {
    grid += '<p class="notice">Sorry, no vehicle details could be found.'
  }
  return grid
}


module.exports = Util