import { editProduct } from "./api.js";
import { showAlert } from "./helpers.js";

// display a message if the page is reloaded after updating the values
window.onload = function() {
    const message = localStorage.getItem('updateSuccess');
    if (message) {
        showAlert(message, 'success'); 
        localStorage.removeItem('updateSuccess'); 
    }
};


document.addEventListener('DOMContentLoaded', () => {

    // query selectors
    const updateButton = document.querySelector('.updateButton');
    const submitButton = document.querySelector('.submitButton');
    const cancelButton = document.querySelector('.cancelButton');
    const productName = document.querySelector('#productName');

    // group selectors
    const dataTexts = document.querySelectorAll('.data-text');
    const updateInputs = document.querySelectorAll('.update-input');

    // get the id of the product displayed on the page
    const id = productName.dataset.productid;

    // Envent Listener: Updata data
    updateButton.addEventListener('click', () => {
        
        // Toggle the display
        updateButton.hidden = true;
        submitButton.hidden = false;
        cancelButton.hidden = false;

        dataTexts.forEach(dataText => {
            dataText.hidden = true;
        });

        updateInputs.forEach(updateInput => {
            updateInput.hidden = false;
        });
    });

    // Event Listener: Cancel button
    cancelButton.addEventListener('click', () => {
        
        // Toggle the display
        updateButton.hidden = false;
        submitButton.hidden = true;
        cancelButton.hidden = true;

        dataTexts.forEach(dataText => {
            dataText.hidden = false;
        });

        // reinitialize the default values
        updateInputs.forEach(updateInput => {
            updateInput.querySelector('.inputValue').value = updateInput.dataset.origin;
            updateInput.hidden = true;
        });
    });

    // Event Listener: Submit Button
    submitButton.addEventListener('click', async () => {

        // gather the data into an object
        const data = {
            'name': updateInputs[0].querySelector('.inputValue').value,
            'smile': updateInputs[1].querySelector('.inputValue').value,
            'cas': updateInputs[2].querySelector('.inputValue').value,
            'producer': updateInputs[3].querySelector('.inputValue').value,
            'quantity': updateInputs[4].querySelector('.inputValue').value,
            'purity': updateInputs[5].querySelector('.inputValue').value,
            'laboratory': updateInputs[6].querySelector('.inputValue').value,
            'box': updateInputs[7].querySelector('.inputValue').value
        }
        
        // Request the API to update the product
        try {
            await editProduct(data, id);

            // generate a success message in the local storage to be displayed after reloading the page
            localStorage.setItem('updateSuccess', 'The product have been successfully updated.');
            window.location.reload();

        } catch (error) {
            showAlert(`${error.message}`, 'danger')
        }
    })
})
