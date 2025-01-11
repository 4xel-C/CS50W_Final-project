import { allFilled, showAlert } from "./helpers.js";

document.addEventListener('DOMContentLoaded', () => {

    // declare the event listener
    const passwordInput = document.querySelector('#passwordInput');
    const confirmInput = document.querySelector('#confirmationInput');
    const labInput = document.querySelector('#labInput');
    const noLab = document.querySelector('#noLab')
    const submitButton = document.querySelector('#submitButton');
    const registerForm = document.querySelector('#registerForm');
    const inputs = document.querySelectorAll("input");

    // Disable the submit button and the lab selector if needed
    submitButton.disabled = true;
    labInput.disabled = noLab.checked;

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

    // Add the event listener for the no lab checkbox
    noLab.addEventListener('change', () => {
        labInput.disabled = noLab.checked;
    })
});