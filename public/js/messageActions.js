//  const markReadButton = document.querySelector(".message-read-button")
//  if (markReadButton) {
//     markReadButton.addEventListener("click", async function() {
//         const messageId = this.getAttribute("data-message-id")

//         try {
//             const response = await fetch(`/account/read-messages/${messageId}`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' }
//             })

//             if(response.ok) {
//                 console.log("Message marked as read.")
//             } else {
//                 console.error("Failed to mark message as read.")
//             }
//         } catch (error) {
//             console.error("Error:", error)
//         }
//     })
//  }

document.addEventListener("DOMContentLoaded", () => {
    const messageActionContainer = document.querySelector("#message-actions-container")

    if(messageActionContainer) {
        messageActionContainer.addEventListener("click", async (event) => {
            const targetButton = event.target

            if (targetButton.classList.contains("message-read-button")) {
                const messageId = targetButton.getAttribute("data-message-id")
                await handleMarkAsRead(messageId)
            } else if (targetButton.classList.contains("message-archived-button")) {
                const messageId = targetButton.getAttribute("data-message-id")
                await handleArchivedMessage(messageId)
            } else if (targetButton.classList.contains("message-delete-button")) {
                const messageId = targetButton.getAttribute("data-message-id")
                await handleDeleteMessage(messageId)
            }
        })
    }
})

async function handleMarkAsRead(messageId) {
    try {
        const response = await fetch (`/account/read-messages/${messageId}/read`, {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json'}
        })

        if (response.ok) {
            console.log("Message marked as read.")
        } else {
            console.error("Failed to mark message read.")
        }
    } catch (error) {
        console.error ("Error:", error)
    }
}

async function handleArchivedMessage(messageId) {
    try {
        const response = await fetch (`/archive-message/${messageId}/archive`, {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json'}
        })

        if (response.ok) {
            console.log('Message archived.')
        } else {
            console.error("Failed to archive message")
        }
    } catch (error) {
        console.error ("Error:", error)
    }
}

async function handleDeleteMessage(messageId) {
    try {
        const response = await fetch (`/account/delete-message/${messageId}/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type' : 'application/json'}
        })

        if (response.ok) {
            console.log('Message deleted.')
        } else {
            console.error("Failed to delete")
        }
    } catch (error) {
        console.error ("Error:", error)
    }
}
 

 