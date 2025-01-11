import { allFilled, showAlert } from "./helpers.js";

document.addEventListener('DOMContentLoaded', () => {

    // declare the event listener
    const passwordInput = document.querySelector('#passwordInput');
    const confirmInput = document.querySelector('#confirmationInput');
    const submitButton = document.querySelector('#submitButton');
    const registerForm = document.querySelector('#registerForm');
    const inputs = document.querySelectorAll("input");

    // Disable the submit button by default
    submitButton.disabled = true;

    // Add event listener to each inputs to enable the button if all field compelte
    inputs.forEach(input => {
        input.addEventListener('keyup', () => {
            submitButton.disabled = !allFilled(inputs);
        });
    });

    // Add event listener on submission to check that password and confirm are matching
    registerForm.addEventListener('submit', (event) => {
        const password = passwordInput.value;
        const confirmation = confirmInput.value;
        console.log(password, confirmation)
        // check password match
        if (password !== confirmation){
            event.preventDefault();
            showAlert('Password does not match!', 'danger');
        }
    })
});