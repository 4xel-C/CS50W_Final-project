import { allFilled } from "./helpers.js";

document.addEventListener('DOMContentLoaded', () => {

    // declare the event listener and select all inputs and check if all input are all filled.
    const submitButton = document.querySelector('#submit');

    // select all inputs
    const inputs = document.querySelectorAll("input");

    // Disable the submit button by default
    submitButton.disabled = true;

    // Add event listener to each inputs to enable the button if all field compelte
    inputs.forEach(input => {
        input.addEventListener('keyup', () => {
            submitButton.disabled = !allFilled(inputs);
        });
    });
});