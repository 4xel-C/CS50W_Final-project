import { createProduct } from "./api.js";
import { showAlert } from "./helpers.js";

document.addEventListener('DOMContentLoaded', () => {

    // Create query selectors
    const locationInput = document.querySelector('#inputLocation');
    const submitButton = document.querySelector('.submitButton')

    // Create grouped queryselectors for inputs
    const inputs = document.querySelectorAll('input');

    // Create event listener for the submit button
    submitButton.addEventListener('click', async () => {

        let data = {
            'name': inputs[0].value,
            'cas': inputs[1].value,
            'smile': inputs[2].value,
            'producer': inputs[3].value,
            'quantity': inputs[4].value,
            'purity': inputs[5].value,
            'laboratory': locationInput.dataset.laboratory,
            'box': locationInput.value
        }

        // Checking if mandatory input are all filled
        const keysToCheck = ['name', 'producer', 'quantity', 'purity', 'laboratory', 'box']
        const hasNull = keysToCheck.some(key => data[key] === null || data[key] === undefined || data[key] === '');

        if (hasNull){
            showAlert('Missing informations!', 'danger');
            return;
        }

        // Call the API to add a new product
        try{
            await createProduct(data);
            showAlert('Your product has been successfully created!', 'success')     
        } catch (error) {
            showAlert(`Impossible to create the product: ${error.message}`, 'danger');
        }
    });
});