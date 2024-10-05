/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errRoute")
const utilities = require("./utilities/")

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") //not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)
// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))
// Inventory routes
app.use("/inv", utilities.handleErrors(inventoryRoute))
// Error route
app.use("/", utilities.handleErrors(errorRoute))
// Route to cause 500 error
app.get("/trigger-error", (req, res, next) => {
  next({
      status: 500,
      message: "Oh no! There was a crash. Maybe try a different route?"
  })
})
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: "It's life Jim, but not as we know it. You are lost, take a tip from E.T. and phone Home. (click the Home button)"})
})


/* ***********************
 * Express Error Handler
 * Place after all other middleware
 * ***********************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){
    message = err.message || 'Page not found.'
    image = "./images/errors/alien-phon-home.jpg"
  } else if(err.status == 500) {
    message = 'Oh no! There was a crash. Maybe try a different route?'
    image = "./images/errors/car-crash.webp"
  }
  res.render("errors/error", {
    title: err.status || ' 500 Server Error',
    message,
    image,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
