import { getCookie } from "./helpers.js";

// ----------------------------------------------------------API for USER management

// Edit a user information using a put method
export async function editUser(updatedData){

    const csrfToken = getCookie('csrftoken');

    try {
        // try to fetch the data
        const response = await fetch(`user/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(updatedData)
        });

        
        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${response.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const confirmation = await response.json();
        return confirmation;

    } catch(error) {
        throw error;
    }
}

// --------------------------------------------------------API for products

// Fetch the informations containing all laboratories on site with the count of products in each lab
export async function fetchSite(){

    try {
        // try to fetch the data
        const response = await fetch(`/site`);

        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${errorData.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const data = await response.json();
        return data

    } catch(error) {
        console.error('Problem occured while fetching datas: ', error.message);
        throw error;
    }
}

// Fetch all the products, speicific product by Id, or product tagged as favorites
export async function fetchProducts(labId = null, productId = null){

    // API URL
    const path = window.location.pathname;
    let URL='/products'

    // fethcing only the specific lab depending of url (mylab = user lab or another selected laboratory)
    if (path.includes('mylab') || path.includes('laboratory')) {

        // if no lab specified for the user and try to access my lab, return none object
        if(!labId){
            return null
        }
        URL += `/laboratory/${labId}`
    } else if (path.includes('watchlist')) {
        URL += '/watchlist'
    }

    // get the products with the correct URL
    try {
        // try to fetch the data
        const response = await fetch(URL);

        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${response.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const data = await response.json();
        return data

    } catch(error) {
        throw error;
}
}

// delete a product
export async function deleteProduct(id){
    const csrfToken = getCookie('csrftoken');

    try {
        // try to fetch the data
        const response = await fetch(`/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
        });

        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${response.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const confirmation = await response.json();
        return confirmation;

    } catch(error) {
        throw error;
    }
}

// Add a product to favorite
export async function favoriteProduct(id){

    const csrfToken = getCookie('csrftoken');

    try {
        // try to fetch the data
        const response = await fetch(`/products/${id}/favorite`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
        });

        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${response.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const confirmation = await response.json();
        return confirmation;

    } catch(error) {
        throw error;
    }
}

// Edit a product
export async function editProduct(id, updatedData){

    const csrfToken = getCookie('csrftoken');

    try {
        // try to fetch the data
        const response = await fetch(`products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(updatedData)
        });

        // Fetching error handling
        if (!response.ok){
            const errorData = await response.json();
            throw new Error(`HTTP error : ${response.status}, Message : ${errorData.error || 'Unknown Error'}`);
        }

        const confirmation = await response.json();
        return confirmation;

    } catch(error) {
        throw error;
    }
}