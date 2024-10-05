const express = require('express')
const router = express.Router()
const errorController = require('../controllers/errorController')
const utilities = require('../utilities/')

// Route that triggers a 500 error
router.get('/trigger-error', utilities.handleErrors(errorController.triggerServerError))

module.exports = router