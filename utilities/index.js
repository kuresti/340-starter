/* *********************************
 * Required resources
 * ********************************* */
const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

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

/* *************************************
 * Constructs the drop-down classificationList
 * ************************************* */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList"  required >'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if ( classification_id != null && row.classification_id == classification_id ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
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
Util.handleErrors = fn => (req, res, next) => {
  try {
    return Promise.resolve(fn(req, res, next)).catch(next)
  } catch (err) {
    next(err)
  }
}

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

/* ***************************************
 * Middleware to check token validity
 * *************************************** */
Util.checkJWTToken = (req, res, next) => { // begins function and assigns it to "checkJWTToken"property of Util obj. Function accepts the req, res, next parameters.
  if (req.cookies.jwt) { // an "if" check to see if the JWT cookie exists.
    jwt.verify( // if cookie exists, uses the jsonwebtoken "verify"fn to check the validity of the token. Takes three args 1)token from the cookie 2)secret value in env 3)callback function
      req.cookies.jwt, // the JWT token from the cookie
      process.env.ACCESS_TOKEN_SECRET, // the "secret" which is stored in the .env file
      function (err, accountData) { // the callback function (which returns an error or the account data from the token payload)
        if (err) { // and "if" to see if an error exists
          req.flash("Please log in") // if token is not valid, a flash mssg is created.
          res.clearCookie('jwt') // the cookie is deleted.
          return res.redirect('/account/login') // redirects to the "login" route, so the client can "login".
        } // ends the "if" statement
        res.locals.accountData = accountData // add teh accountData obj to the response.locals obj to be forwarded on through the rest of this request -response cycle.
        res.locals.loggedin = 1 // adds "loggedin" flag with a value of "1" (true) to the response.locals obj to be forwarded on to the rest of this request-response cycle.
        next() // next function directing Express server to move to the next step in the application's work flow.
      }) // ends the callback function and the jwt.verify function.
  } else { // ends the "if" statment and begins and "else" block
    next() // Calls the next fn, to move forward in the app process. In this case, there is no JWT cookie, so the process moves to the next step.
  } // ends the else block
} // ends the function


module.exports = Util