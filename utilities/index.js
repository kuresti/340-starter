/* *********************************
 * Required resources
 * ********************************* */
const invModel = require("../models/inventory-model")
const acctModel = require("../models/account-model")
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
        res.locals.accountData = accountData // add the accountData obj to the response.locals obj to be forwarded on through the rest of this request -response cycle.
        res.locals.loggedin = 1 // adds "loggedin" flag with a value of "1" (true) to the response.locals obj to be forwarded on to the rest of this request-response cycle.
        next() // next function directing Express server to move to the next step in the application's work flow.
      }) // ends the callback function and the jwt.verify function.
  } else { // ends the "if" statment and begins and "else" block
    next() // Calls the next fn, to move forward in the app process. In this case, there is no JWT cookie, so the process moves to the next step.
  } // ends the else block
} // ends the function

/* ************************************
 * Middleware Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => { // creates function and assigns it to the "Util" obj with a name of "checkLogin". Passes req, res, next as parameters
  if (res.locals.loggedin) { // an "if" check to see if the login flag exists and is "true" in the response object.
    next() // allows the process of the app to continue by using the "next()" function.
  } else { //ends the "if" and begins an "else" block.
    req.flash("notice", "Please log in.") // creates a flash message
    return res.redirect("/account/login") // redirects the login route, because the login flag does not exist
  } // ends the "else block"
} // ends the function

/* ***************************************
 * Middleware to check Account Type
 * *************************************** */
Util.checkAccountType = (req, res, next) => { // begins function and assigns it to "checkJWTToken"property of Util obj. Function accepts the req, res, next parameters.
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
        res.locals.accountData = accountData // add the accountData obj to the response.locals obj to be forwarded on through the rest of this request -response cycle.
        res.locals.loggedin = 1 // adds "loggedin" flag with a value of "1" (true) to the response.locals obj to be forwarded on to the rest of this request-response cycle.

        if (accountData.account_type === "Admin" || accountData.account_type ==="Employee") { // Check to see if account type has add/edit/delete privileges
          next() // next function directing Express server to move to the next step in the application's work flow.
        } else {
          req.flash("notice", "You do not have permission to modify inventory.")
          return res.redirect("/account/login")
        }
       
      }) // ends the callback function and the jwt.verify function.
  } else { // ends the "if" statment and begins an "else" block
    next() // Calls the next fn, to move forward in the app process. In this case, there is no JWT cookie, so the process moves to the next step.
  } // ends the else block
} // ends the function

/* *************************************
 * Constructs the drop-down messageToList
 * ************************************* */
Util.buildMessageToList = async function (message_to = null) {
  let data = await acctModel.getAccounts()
  let messageToList = '<select name="message_to" id="messageToList"  required >'
  messageToList += "<option value=''>Select a recipient</option>"
  data.rows.forEach((row) => {
    messageToList += '<option value="' + row.account_id + '"'
    if ( message_to != null && row.account_id == message_to ) {
      messageToList += " selected "
    }
    messageToList += ">" + row.account_firstname + " " +row.account_lastname + "</option>"
  })
  messageToList += "</select>"
  return messageToList
}

/* **************************************
 * Build message display table
 * **************************************/
Util.buildMssgDisplayTable = async function (inboxMssg){
  let messageDisplay = '<table' //starts the table structure
  // Set up the table labels 
  messageDisplay += '<thead>'; // Creates a JS variable and stores the beginning HTML element into it as a string.
  messageDisplay += '<tr><td>Received</td><td>Subject</td><td>From</td><td>Read</td></tr>'; // Creates the table row and three table cells as a string and appends it to "dataTable"
  messageDisplay += '</thead>'; // Adds the closing "thead" element to the variable using the append operator
  // Set up the table body 
  messageDisplay += '<tbody>'; // Appends the opening "tbody" tag to the string stored in the variable.

  // Create a new array of promises to fetch messageFrom names
  const promises = inboxMssg.map(async (message) => {
      const mssgFromData = await acctModel.getMssgFromAccountByAccountId(message.message_from) // Get the account data for the value of message_from
      const mssgFromName = `${mssgFromData.account_firstname}+ " " +${mssgFromData.account_lastname}`
      // Return table elements with message data. Also first and last name of message_from
      return `
          <tr> 
              <td id="table-message-received">${newDate(message.message_created).toLocalDateString()}</td>
              <td class="table-message-subject"><a href='/account/read-new-message/${message.message_id}'>${message.message_subject}</a>
              </td>
              <td class="table-message-from">${mssgFromName}</td>
              <td class="table-message-read">${message.message_read}</td>
          </tr>`
  })

  //Wait for promises to resolve
  const rows = await Promise.all(promises)
  messageDisplay += rows.join("") //Append all rows to the table body
  messageDisplay += '</tbody>'
  messageDisplay += '</table>'

  return messageDisplay
  
}

module.exports = Util