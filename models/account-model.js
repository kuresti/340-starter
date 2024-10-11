const pool = require("../database/")

/* **************************
 * Register new account
 * ************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){ // opens the async function lists four parameters
    try { // Opens a "try", part of "try - catch" error handling block
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]) // This line and above declares "sql" variable and query to write data to database

    } catch (error) { // closes the "try" block and opens the "catch" block. Accepts an "error" variable to store any error that is thrown should the "try" block fail.
        return error.message // sends back any error message that is found in the error object.
    }
}

/* **************************
 * Check for existing email
 * ************************** */
async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

module.exports = { registerAccount, checkExistingEmail }