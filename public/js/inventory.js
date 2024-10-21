'use strict' // Tells the JavaScript parser to follow all rules strictly.

// Get a list of items in inventory based on tHE classification_id
let classificationList = document.querySelector("#classificationList") // Finds the classification select element based on its ID, and stores its reference into a local variable.
classificationList.addEventListener("change", function () { // Attaches the eventListener to classificationList and listens for any "change". When a "change" occurs an anonymous function is executed.
    let classification_id = classificationList.value // Captures the new value from the classification select element and stores it into a JS variable
    console.log(`classification_id is: ${classification_id}`)// logging the classification_id in the console for debugging
    let classIdURL ="/inv/getInventory/"+ classification_id // The URL used to request inv data from the invController. Uses classification_id
    fetch(classIdURL) // Method of initiating an AJAX (asynchronous) request.
    .then(function (response) { // "then" method waits for data to be returned from fetch. The response is passed into an anonymous function for processing.
        if (response.ok) { // "if" test to see if the response was returned successfully. If not, the error occurs
            return response.json(); // If the response was successful, then the JSON obj that was returned is converted to a JS obj and passed on to the next "then"
        } //Ends the "if" test
        throw Error("Network response was not OK"); // The erro that occurs if the "if" test fails
    }) // Ends the "then" process above
    .then(function (data) { // Accepts JS obj and passes it as a parameter into an anonymous function
        console.log(data); // Sends the JS obj to the console log for testing purposes.
        buildInventoryList(data); // Sends the JS obj to a new function that will parse the data into HTML table elements and inject them into the inventory management view
    })// Ends the "then" process above
    .catch(function (error) { // "catch" which captures any errors and sends them into an anonymous function
        console.log("There was a problem: ", error.message) // Writes teh caught error to the console log for us to see for troubleshooting.
    }) // Ends the "catch"
}) // Ends the eventListener

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) { // Declares teh function and indicates the JS obj is a required parameter
    let inventoryDisplay = document.getElementById("inventory-display"); // Reaches into the HTML doc, uses the ID to capture the element and assigns it to a JS variable
    // Set up the table labels 
    let dataTable = '<thead>'; // Creates a JS variable and stores the beginning HTML element into it as a string.
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>'; // Creates the table row and three table cells as a string and appends it to "dataTable"
    dataTable += '</thead>'; // Adds the closing "thead" element to the variable using the append operator
    // Set up the table body 
    dataTable += '<tbody>'; // Appends teh opening "tbody" tag to the string stored in the variable.
    // Iterate over all vehicles in the array and put each in a row
    data.forEach(function (element){ // Implements the foreach method on the data obj. Each element in the obj is sent into an anonymous function as a parameter
        console.log(element.inv_id + ", " + element.inv_model); //Sends the name and id of each element to the console log for testing purposes.
        dataTable += `<tr><td id="table-make-model">${element.inv_make} ${element.inv_model}</td>`; // Creates a table cell with the vehicle name and appends it to the variable.
        dataTable += `<td class="inv-modify-button"><a href='/inv/edit-inventory/${element.inv_id}' title='Click to update'>Modify</a></td>`; // Creates a table cell with a link to begin the update process for this item and appends it to the variable.
        dataTable += `<td class="inv-delete-button"><a href='/inv/delete-confirm/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`; // Creates a table cell wiht a link to begin the delete process for this item and apends it to the variable.
    }) // Ends teh forEach loop and its embeded anonymous function.
    dataTable += '<tbody>'; // Appends teh closing tbody element to the variable
    // Display the contents in the Inventory Management view
    inventoryDisplay.innerHTML = dataTable; // Injects the finished table components into the inventory management view DOM element that was identified on line 3.
} // Ends the function