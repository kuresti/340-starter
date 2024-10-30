/* *****************************
 * Needed Resources
 * Account routes
 * ***************************** */
const express = require("express")
const router = new express.Router() 
const accountController = require("../controllers/acctController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")
/* *****************************
 * Deliver Login View
 * ***************************** */
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* ****************************
 * Deliver registration view
 * **************************** */
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))

/* ****************************
 * Deliver management view
 * **************************** */
router.get("/account-management", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

/* ****************************
 * account-update Route
 * **************************** */
router.get("/account-update/:accountId", utilities.checkLogin,  utilities.handleErrors(accountController.buildAccountUpdate))

/* ****************************
 * Account logout Process
 * ****************************/
router.get("/logout", utilities.handleErrors(accountController.logoutProcess))

/* ****************************
 * Deliver inbox view
 * ****************************/
router.get("/inbox/:accountId", utilities.handleErrors(accountController.buildInbox))

/* ****************************
 * Deliver create-message view
 * ****************************/
router.get("/new-message", utilities.handleErrors(accountController.buildNewMessage))

/* ****************************
 * Deliver read-messages-view
 * ****************************/
router.get("/read-messages/:messageId", utilities.handleErrors(accountController.buildReadMessages))

/* ****************************
 * Deliver reply-message view
 * ****************************/
router.get("/reply-message/:messageId", utilities.handleErrors(accountController.buildReplyMessage))

/* ****************************
 * Process Registration
 * **************************** */
// Process the reigstration data
router.post( // Router object using a "post" property.
    "/registration", // Path being watched for in the route.
    regValidate.registrationRules(), // The function containing the rules to be used in the validation process.
    regValidate.checkRegData, // The call to run the validation and handle the errors, if any.
    utilities.handleErrors(accountController.registerAccount) // The call to the controller to handle the registration, if no errors occur in the validation process.
)

/* ****************************
 *  Process the login attempt
 * ****************************/
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
  )

  /* ***************************
   * Post Account Update
   * *************************** */
  router.post(
    "/account-update",
    regValidate.accountUpdateRules(),
    regValidate.checkAcctUpdateData,
    utilities.handleErrors(accountController.updateAccount)
  )

  /* ****************************
   * Post change password
   * ****************************/
  router.post(
    "/account-update/password",
    regValidate.changePasswordRules(),
    regValidate.checkUpdatePasswordData,
    utilities.handleErrors(accountController.updatePassword)
  )

  /* *****************************
   * Post create message
   * *****************************/
  router.post(
    "/new-message",
    regValidate.newMssgValidationRules(),
    regValidate.checkNewMssgData,
    utilities.handleErrors(accountController.sendMessage)
  )

  /* *****************************
   * Post reply message
   * *****************************/
  router.post(
    "/reply-message",
    regValidate.replyMssgValidationRules(),
    regValidate.checkReplyMssgData,
    utilities.handleErrors(accountController.sendReplyMessage)
  )

  /* *******************************
   * Post toggle-read-status
   * *******************************/
  router.post(
    "/read-messages/:messageId/read",
    accountController.markMessageRead,
  )

  router.post(
    "/read-messages/:messageId/archive",
    accountController.archiveMessage
  )

  router.post(
    "/read-messages/:messageId/delete",
    accountController.deleteMessage
  )

 












module.exports = router


