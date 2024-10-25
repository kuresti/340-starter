/* *******************************
 * Toggle to show and hide passwords
 * ******************************* */

    const toggleButton = document.querySelector(".pswdbutton");
    const pswdInput = document.querySelector("#password");
    toggleButton.addEventListener("click", function() {
        const type = pswdInput.getAttribute("type");
        if(type == "password") {
            pswdInput.setAttribute("type", "text");
            toggleButton.textContent = "Hide Password";
        } else {
            pswdInput.setAttribute("type", "password");
            toggleButton.textContent = "Show Password";
        }
    });
