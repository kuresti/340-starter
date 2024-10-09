/* ***************************
 * Required resources
 * *************************** */
const utilities = require("../utilities/")


/* *************************** 
 * Deliver login view
 * *************************** */
async function buildLogin(req, res, next) { // Function is declared as an async function, passing in req, res, nex as params
    let nav = await utilities.getNav() // Retrieves and stores the nav bar string for use in the view
    res.render("account/login", { // Calls the render function and indicates the view to be returned
        title: "Login", // data item to be sent to the view
        nav // data item to be sent to the view
    })
}

module.exports = { buildLogin }