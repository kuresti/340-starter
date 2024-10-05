/* *****************************
 * Controller function that simulates the Error
 * ***************************** */
const errCont = {}

errCont.triggerServerError = (req, res, next) => {
    try {
        const error = new Error('This is a purposefully injected error.')
        error.status = 500
        throw error
    } catch (error) {
        next(error)
    }
}

module.exports = errCont