document.addEventListener('DOMContentLoaded', () => {

    // declare the event listener
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
    const submitButton = document.querySelector('#submit');

    // Disable the submit button by default
    submitButton.disabled = true;

    // Function to activate the button if both input fields are not empty
    const checkInputs = () => {
        
        // Check if inputs are not empty
        if (usernameInput.value.trim() !== '' && passwordInput.value.trim() !== '') {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    // Add event listener to enable the button if text is entered
    usernameInput.addEventListener('keyup', checkInputs);
    passwordInput.addEventListener('keyup', checkInputs);
})