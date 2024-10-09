/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")

/* ***********************
 * Middleware
 * *********************** */
app.use(session({ // invokes app.use applies what is being invoked throughout the entire application
  store: new (require('connect-pg-simple')(session))({ //where session data will be stored. New session table created. { indicates a new object sent into the connectino with config info
    createTableIfMissing: true,//tells the session to create a "session" table in the DB if it does not exist
    pool, //uses the DB connection pool to interact with the DB server
  }), //closes the config data object and the "new" session store creation function
  secret: process.env.SESSION_SECRET,// indicates a "secret" name-value pair used to protect the session.
  resave: true, //usually false, but need to resave the session table after each message because we are using "flash" messages
  saveUninitialized: true, //Important to the creation process when the session is first created.
  name: 'sessionId'// "name" assigned to the unique "id" created for each session. Session id will be stored in a cookie passes back and forth from server to browser to maintain "state".
}))

// Express Messages Middleware
app.use(require('connect-flash')()) //requires connect-flash, within an app.use function, it is now accessible throughout the app
app.use(function(req, res, next){ //app.use is applied and a function is passed as a parameter. The function accepts the req, res and next objects as parameters
  res.locals.messages = require('express-messages')(req, res)//express-messages is required as a function. It accepts the req, res obj as params. functionality is assigned to the res obj using
  //locals option and a name of "messages". Allows any message to be stored into the response, making it available in a view.
  next()//calls "next()" function, passing control to the next piece of middleware in the app. This allows messages to be set, then pass on to the next process. When a view
  //is built, the message can be displayed in it.
})


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
app.use("/account",utilities.handleErrors(accountRoute))
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
