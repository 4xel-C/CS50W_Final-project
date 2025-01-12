import { deleteProduct, favoriteProduct } from "./api.js";

// -----------------------------------------------------------general helper functions

// Create a bootstrap alert and append it to the alert container to dislay it using bootstrap classes.
// take 2 arguments: message, and type of the alert (default: success)
export function showAlert(message, type="success") {
    const alert = document.createElement("div");
    alert.className = `alert alert-${type} alert-dismissible text-center position-fixed top-0 start-50 translate-middle-x w-100`;
    alert.role = "alert";
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Display the alert in front of all the other elements
    alert.style.zIndex = '9999';

    // Delete the previous alert and Add the alert to the container
    const alertContainer = document.getElementById("alertContainer");
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Remove the alert after 5 seconds
    setTimeout(() => {
        alert.classList.remove("show");
        alert.classList.add("fade");
        setTimeout(() => alert.remove(), 500);
    }, 2000);
}

// Function to get cookies (for csrf validation)
export function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            
            // Check for the right cookie
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to check if a NodeList of input are all filled
export function allFilled (inputs) {
    if (Array.from(inputs).every(input => input.value.trim() !== '')){
        return true
    }
    return false
}

// Filter the data from a GET parameter '?q=' to get only the data by keywords, take into consideration name, cas, and laboratory
export function filterData(products, query){
    let productsFiltered = []
    
    products.forEach(product => {
        if (product.name.includes(query) || product.cas.includes(query) || product.lab.includes(query)) {
            productsFiltered.push(product);
        }
    });
    return productsFiltered;
}

// -------------------------------------------------------------------Element Builder functions

// Function to build row for the table displaying products
export function createRow(product){
    let newRow = document.createElement('tr');
    newRow.innerHTML = `
            <td data-idPdt=${product.id}>${product.name}</th>
            <td>${product.cas}</td>
            <td>${product.quantity} g</td>
            <td>${product.purity}%</td>
            <td>${product.lab} / Box: ${product.box}</td>
            <td class='actions'> 
                <button class="btn p-0 like-button text-warning favorite"><i class="bi bi-star${product.isFavorite? '-fill' : ''}"></i></button> 
                <button class="btn p-0 like-button text-danger delete"><i class="bi bi-trash"></i></button>
            </td>
    `
    const favoriteButton = newRow.querySelector('.favorite');
    const deleteButton = newRow.querySelector('.delete');

    // add the event listener to the delete button
    deleteButton.addEventListener('click', async () => {
        try {
            deleteProduct(product.id);
            newRow.remove();
        } catch {
            showAlert('Product could not have been removed', 'danger');
        }
    });

    // add the event listener to the favorite button
    favoriteButton.addEventListener('click', async (event) => {

        const confirmation = await favoriteProduct(product.id);
        
        // Change the icon if clicked
        if (confirmation.action == "favorite"){
            favoriteButton.querySelector('i').classList.remove('bi-star');
            favoriteButton.querySelector('i').classList.add('bi-star-fill');
        } else if (confirmation.action == "unfavorite") {
            favoriteButton.querySelector('i').classList.add('bi-star');
            favoriteButton.querySelector('i').classList.remove('bi-star-fill');
        }
    });

    return newRow
}