const pool = require("../database/")
const bcrypt = require("bcryptjs")

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

/* ***************************
 * Return account data using email address
 * *************************** */
async function getAccountByEmail (account_email) { // creats the async function and adds the client_email as a parameter
    try { // begins a try-catch block
        const result = await pool.query( // creates a variable to store the results of the query.
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1', // SQL SELECT query. first arg in the pool.query function
            [account_email])// passes in the client_email, as an array element to replace the placeholder of the SQL statement. Second arg in the pool.query
            return result.rows[0] //sends the first records, from the result set returned by the query, back to where this function was called.
    } catch (error) { // ends the "try" block and begins the "catch" block, with the "error" variable to store any errors that are thrown by the "try" block.
        return new Error("No matching email found") // sends an error, if any, to the console for review.
    }
}

/* ***************************
 * Return account data using account_id
 * *************************** */
async function getAccountByAccountId (account_id) { // creates the async function and adds the client_id as a parameter
    try { // begins a try-catch block
        const result = await pool.query( // creates a variable to store the results of the query.
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1', // SQL SELECT query. first arg in the pool.query function
            [account_id])// passes in the client_id, as an array element to replace the placeholder of the SQL statement. Second arg in the pool.query
            return result.rows[0] //sends the first records, from the result set returned by the query, back to where this function was called.
    } catch (error) { // ends the "try" block and begins the "catch" block, with the "error" variable to store any errors that are thrown by the "try" block.
        return new Error("No matching account_id found") // sends an error, if any, to the console for review.
    }
}


/* ***************************
   * Update Account Data
   * *************************/
async function updateAccount(
    account_id, 
    account_firstname,
    account_lastname,
    account_email,
  ) {
   
    try {
      const sql =
        "UPDATE public.account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *"
      const data = await pool.query(sql, [
        account_firstname, 
        account_lastname,
        account_email,
        account_id
      ])
      return data.rows[0]
    } catch (error) {
      console.error("model error: " + error)
    }   
  }

  /* **************************
   * Update Password
   * **************************/
  async function updatePassword(account_id, account_password){
    try {
        const sql = 
            "UPDATE public.account SET account_password = $1 WHERE account_id = $2 RETURNING *"
            console.log(`Running query: ${sql} with account_id: ${account_id} and account_password: ${account_password}`)
        const data = await pool.query(sql, [account_password, account_id])
        return data.rows[0]
    } catch (error) {
        console.error("model error: " + error)
        throw error
    }
  }

  /* ****************************
   * Get Message count by `message_to`
   * ****************************/
  async function getMssgCountByMssgTo(message_to) {
    try {
        const sql = 
        "SELECT COUNT(*) AS mssgcount FROM message WHERE message_to = $1 AND  message_read = FALSE"
        const result = await pool.query(sql, [message_to])
        const mssgCount = result.rows.length > 0 ? result.rows[0].mssgcount : 0
        const parsedCount = parseInt(mssgCount, 10)
                      
        return isNaN(parsedCount) ? 0 : parsedCount
    } catch (error) {
        console.error("model error: " + error)
        throw error
    }
  }

  /* *******************************
   * Get message data  by `message to`
   * *******************************/
  async function getMssgByMssgTo(message_to) { 
    try{ 
        const sql = 
            "SELECT * FROM message WHERE message_to = $1"
        const data = await pool.query(sql, [message_to])
        
        // Check to see if there are any messages in the array
        if (data.rows.length === 0) {
            console.log("No messages found")
            return []
        }
        return data.rows
    } catch (error) {
        console.error("model error: " + error)
        throw error
    }

}

/* ***************************
 * Return message_from account data using account_id
 * *************************** */
async function getMssgFromAccountByAccountId (account_id) { // creates the async function and adds the client_id  of the message_from as a parameter
    try { // begins a try-catch block
        const result = await pool.query( // creates a variable to store the results of the query.
            'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1', // SQL SELECT query. first arg in the pool.query function
            [account_id])// passes in the client_id, as an array element to replace the placeholder of the SQL statement. Second arg in the pool.query

            //check to see if there is any account info
            if (result.rows.length === 0) {
                return result
            }

            return result.rows[0] //sends the first records, from the result set returned by the query, back to where this function was called.

    } catch (error) { // ends the "try" block and begins the "catch" block, with the "error" variable to store any errors that are thrown by the "try" block.
        return new Error("No matching account_id found") // sends an error, if any, to the console for review.
    }
}

/* ***************************
 *  Get all account data
 * ************************** */
async function getAccounts(){
    return await pool.query("SELECT * FROM public.account ORDER BY account_id")
  }

/* ***************************
 * Post Send message
 * ***************************/
async function sendMessage(message_subject, message_body, message_to, message_from, message_read, message_archived){ // opens the async function lists seven parameters
    try { // Opens a "try", part of "try - catch" error handling block
        const sql = "INSERT INTO public.message (message_subject, message_body,  message_to, message_from, message_read, message_archived) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *"
        console.log(sql)
        return await pool.query(sql, [message_subject, message_body, message_to, message_from, message_read, message_archived]) // This line and above declares "sql" variable and query to write data to database

    } catch (error) { // closes the "try" block and opens the "catch" block. Accepts an "error" variable to store any error that is thrown should the "try" block fail.
        return error.message // sends back any error message that is found in the error object.
    }
}

/* ***************************
 * Get message by message_id
 * ***************************/
    async function getMessageByMessageId(message_id) {
        const data = await pool.query(
          "SELECT * FROM public.message WHERE message_id = $1 ORDER BY message_id",
          [message_id]
        )
        return data.rows[0]
      }

  



module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAccountByAccountId , updateAccount, updatePassword, getMssgCountByMssgTo,
    getMssgByMssgTo, getMssgFromAccountByAccountId, getAccounts, sendMessage, getMessageByMessageId
 }