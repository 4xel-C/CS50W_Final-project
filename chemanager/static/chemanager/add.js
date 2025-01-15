import { createProduct } from "./api.js";
import { showAlert } from "./helpers.js";

document.addEventListener('DOMContentLoaded', () => {

    // Create query selectors
    const inputName = document.querySelector('#inputName');
    const inputCas = document.querySelector('#inputCas');
    const inputSmile = document.querySelector('#inputSmile');
    const inputProducer = document.querySelector('#inputProducer');
    const inputQuantity = document.querySelector('#inputQuantity');
    const inputPurity = document.querySelector('#inputPurity');
    const locationInput = document.querySelector('#inputLocation');
    const submitButton = document.querySelector('.submitButton')
    

    // Create event listener for the submit button
    submitButton.addEventListener('click', async () => {

        let data = {
            'name': inputName.value,
            'cas': inputCas.value,
            'smile': inputSmile.value,
            'producer': inputProducer.value,
            'quantity': inputQuantity.value,
            'purity': inputPurity.value,
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