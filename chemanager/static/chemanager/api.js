import { getCookie } from "./helpers.js";

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
export async function fetchProducts(path, labId = null, productId = null){

    // API URL
    let URL='/products'

    // if fetching only current laboratory because user choose 'mylab' menu
    if (path.includes('mylab')) {

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
        const response = await fetch(`products/${id}`, {
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
        const response = await fetch(`products/${id}/favorite`, {
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