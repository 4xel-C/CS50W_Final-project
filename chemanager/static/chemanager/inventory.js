import { createRow, filterData } from "./helpers.js";

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
    const data = await fetchProducts(labId);

    // get the GET parameter for the search function and filter the datas if present
    const query = new URLSearchParams(window.location.search).get('q');
    let products = [];

    if (query) {
        products = filterData(data.products, query);
    } else {
        products = data?.products;
    }
    
    // Build the table
    if (!products || products?.length === 0){
        tableContainer.hidden = true;
        noProduct.hidden = false;
    } else {
        products?.forEach(product => {
            const newRow = createRow(product);
            table.append(newRow)
        });
    }

})