/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require("./database/")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errRoute")
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")
const utilities = require("./utilities/")

/* ***************************
 * Middleware
 * *************************** */
app.use(session({ // invokes the app.use() function and indicates the session is to be applied.
  store: new (require('connect-pg-simple')(session))({ // store is referring to where the session data will be stored. A new table in the PostgreSQL database is created using "connect-pg-simple"
    createTableIfMissing: true, // tells the session to create a "session" table in the db if it does not already exist
    pool, // uses our db connection pool to interact with the db server
  }),
  secret: process.env.SESSION_SECRET, // indicates a "secret" name-value pair that will be used to protect the session.
  resave: true, // This session for the session in the db is typically "false", But, because we are using "flash" mssg we need to resave the session table after each mssg, so it must be true
  saveUninitialized: true, // This setting is important to the creation process when the session is first created.
  name: 'sessionId', // This is the "name"  we are assigning to the unique "id" that will be created for each session.
}))

// Express Messages Middleware
app.use(require('connect-flash')()) //requires connect-flash, within an app.use function, it is now accessible throughout the app
app.use(function(req, res, next){ //app.use is applied and a function is passed as a parameter. The function accepts the req, res and next objects as parameters
  res.locals.messages = require('express-messages')(req, res)//express-messages is required as a function. It accepts the req, res obj as params. functionality is assigned to the res obj using
  //locals option and a name of "messages". Allows any message to be stored into the response, making it available in a view.
  next()//calls "next()" function, passing control to the next piece of middleware in the app. This allows messages to be set, then pass on to the next process. When a view
  //is built, the message can be displayed in it.
})

// Body Parser
app.use(bodyParser.json()) // tells express to use body parser to work with JSON data
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded








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
app.use("/inv", require("./routes/inventoryRoute"))
// Account routes
app.use("/account", require("./routes/accountRoute"))
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

  let message = "An unexpected error occurred."
  let image = "/images/errors/car-crash.webp"
  
  if(err.status == 404){
    message = err.message || 'Page not found.'
    image = "/images/errors/alien-phon-home.jpg"
  } else if(err.status == 500) {
    message = 'Oh no! There was a crash. Maybe try a different route?'
    image = "/images/errors/car-crash.webp"
  }
  res.status(err.status ||500).render("errors/error", {
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
