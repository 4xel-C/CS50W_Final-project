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
    }

    // fetch the correct data
    const data = await fetchProducts(path, labId);

    // Build the table
    if (!data){
        tableContainer.hidden = true;
        noProduct.hidden = false;
    }
    data?.products?.forEach(product => {
        const newRow = createRow(product);
        table.append(newRow)
    });

})