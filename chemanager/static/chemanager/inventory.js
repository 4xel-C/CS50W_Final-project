import { createRow } from "./helpers.js";
import { fetchProducts } from "./api.js";

document.addEventListener('DOMContentLoaded', async () => {
    
    // declare the query selectors and get data about url and user's lab_id
    const tableContainer = document.querySelector('.table-container');
    const table = document.querySelector('.table-body');
    const title = document.querySelector('.page-title');
    const noProduct = document.querySelector('.no-product');

    const labId = table.getAttribute('data-myLab');
    const path = window.location.pathname;

    // Update the title
    if (path.includes('mylab')) {
        title.innerHTML = 'My laboratory'
    } else if  (path.includes('watchlist')){
        title.innerHTML = 'My favorite products'
    }

    // fetch the correct data of set null 
    const data = await fetchProducts(path, labId);
    
    // Build the table
    if (!data?.products[0]){
        tableContainer.hidden = true;
        noProduct.hidden = false;
    }
    data?.products?.forEach(product => {
        const newRow = createRow(product);
        table.append(newRow)
    });

})