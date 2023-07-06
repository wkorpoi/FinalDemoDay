
const editButton = document.querySelectorAll('.editButton')

Array.from(editButton).forEach( button => 
    console.log('im working'),
    button.addEventListener('click', function(e){
        const input = e.target.parentNode.childNodes[1]
        input.select()
        input.focus()
        input.readOnly = false
        const newNumber = input
        console.log(input)
    
        fetch("/contacts", {
            method: "PUT",
          })
            .then((response) => {
              if (response.ok) {
                console.log("Contact Edited");
              } else {
                console.error("Error sending message:", response.statusText);
              }
            })
            .catch((error) => console.error("Error sending message:", error));
    }
    )
)

// made the input highlight
function startEditing(e) {
    const input = e.target.parentNode.childNodes[1]
    input.select()
    input.focus()
    input.readOnly = false
    const newNumber = input
    console.log(input)

    fetch("/contacts", {
        method: "PUT",
      })
        .then((response) => {
          if (response.ok) {
            console.log("Contact Edited");
          } else {
            console.error("Error sending message:", response.statusText);
          }
        })
        .catch((error) => console.error("Error sending message:", error));
}

// listen for a change in the input, and everytime its been changed store in a variable. 

const newNumber = 
const id = 



// grab the data attriubute that was stored in the button.

// submit both to backend. 

// fetch to the backend. in fetch body newNumber and id need to be passed in. 

// refresh browser w new values. 

// create event listner that listens for onblur event on the input & everytime it's called we should set read only to true. 

// create an app.delete method is routes.js using the findOneAndUpdate method from mongoDb. we will pass in the ID wrapped in an object ID & use the $set method from mongoDb to set the value of the phoneNumber to = the req.body.newNumber
