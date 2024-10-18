// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invCont = require("../controllers/invController");
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invCont.buildByClassificationId));

// Route to build inventory item by invId view
router.get("/details/:invId", utilities.handleErrors(invCont.buildByInvId));

// Route to build inventory management view
router.get("/inventory-management", utilities.handleErrors(invCont.buildInvManagement));

// Route to build add-classification view
router.get("/add-classification", utilities.handleErrors(invCont.buildAddClassification));

// Route to build add-inventory view
router.get("/add-inventory", utilities.handleErrors(invCont.buildAddInventory))

// Route to getInventory
router.get("/getInventory/:classification_id", utilities.handleErrors(invCont.getInventoryJson))

// Route to build delete confirmation by invId vew
router.get("/delete/:invId", utilities.handleErrors(invCont.buildDeleteByInvId))

// Insert new classification to the DB
router.post(
    "/add-classification",
    invValidate.addClassificationRules(),
    invValidate.checkClassificationNameData,
    utilities.handleErrors(invCont.insertClassificationName)
)

// Insert add vehicle to the DB
router.post(
    "/add-inventory",
    invValidate.addInventoryRules(),
    invValidate.checkAddInventoryData,
    utilities.handleErrors(invCont.insertAddInventory)
)

// delete
router.post(
    "/delete",
    utilities.handleErrors(invCont.deleteInventory)
)

module.exports = router;