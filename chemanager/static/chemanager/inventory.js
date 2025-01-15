import { createRow, filterData } from "./helpers.js";

import { fetchProducts } from "./api.js"

document.addEventListener('DOMContentLoaded', async () => {
    
    // declare the query selectors and get data about url and user's lab_id
    const tableContainer = document.querySelector('.table-container');
    const table = document.querySelector('.table-body');
    const title = document.querySelector('.page-title');
    const noProduct = document.querySelector('.no-product');

    const labId = table.getAttribute('data-myLab');
    const labNumber = title.getAttribute('data-labNumber');
    const path = window.location.pathname;

    // Update the title
    if (path.includes('mylab')) {
        title.innerHTML = 'My laboratory'
    } else if  (path.includes('watchlist')){
        title.innerHTML = 'My favorite products'
    } else if (path.includes('laboratory')){
        title.innerHTML = `Laboratory ${labNumber}`
    }

    // fetch data
    const data = await fetchProducts(labId);

    // SEARCH FUNCTION get the GET parameter for the search function and filter the datas if present
    const query = new URLSearchParams(window.location.search).get('q');
    let products = [];

    if (query) {
        products = filterData(data.products, query);
    } else {
        products = data?.products;
    }
    
    // Build the table

    // Display each product into the table using the createRow function
    function displayProducts(products){
        if (!products || products?.length === 0){
            tableContainer.hidden = true;
            noProduct.hidden = false;
        } else {
            table.innerHTML = ''
            products?.forEach(product => {
                const newRow = createRow(product);
                table.append(newRow)
            });
        }
    };
    displayProducts(products);
    
    // query selectors for sorting buttons
    const sortName = document.querySelector('.sort-name');
    const sortLab = document.querySelector('.sort-lab');
    const sortQty = document.querySelector('.sort-qty');
    const sortCas = document.querySelector('.sort-cas');
    const sortPurity = document.querySelector('.sort-purity');
    

    // ------------------------------ Sort by name functions
    let ascendingName = false;
    sortName.addEventListener('click', () => {
        products.sort((a, b) => ascendingName ? a?.name?.localeCompare(b.name) : b?.name?.localeCompare(a.name));
        ascendingName = !ascendingName;
        sortName.classList.toggle('bi-sort-alpha-down', !ascendingName);
        sortName.classList.toggle('bi-sort-alpha-up', ascendingName);
        displayProducts(products);
    })

    
    // ------------------------------ Sort by laboratory function and by box if lab is the same
    let ascendingLab = false;
    sortLab.addEventListener('click', () => {
        products.sort((a, b) => {

            // Compare labs first
            const labComparison = ascendingLab ? a?.lab?.localeCompare(b.lab) : b?.lab?.localeCompare(a.lab);
    
            // If labs are the same, compare boxes
            if (labComparison === 0) {
                return ascendingLab ? a?.box?.localeCompare(b.box) : b?.box?.localeCompare(a.box);
            }
            return labComparison;
        });
        ascendingLab = !ascendingLab;
        sortLab.classList.toggle('bi-sort-alpha-down', !ascendingLab);
        sortLab.classList.toggle('bi-sort-alpha-up', ascendingLab);
        displayProducts(products);
    })

    // ------------------------------ Sort by quantity function
    let ascendingQty = false;
    sortQty.addEventListener('click', () => {
        products.sort((a, b) => ascendingQty ? a.quantity - b.quantity : b.quantity - a.quantity);
        ascendingQty = !ascendingQty;
        sortQty.classList.toggle('bi-sort-numeric-down', !ascendingQty);
        sortQty.classList.toggle('bi-sort-numeric-up', ascendingQty);
        displayProducts(products);
    })

       // ------------------------------ Sort by CAS functions
    let ascendingCas = false;
    sortCas.addEventListener('click', () => {
        products.sort((a, b) => ascendingCas ? a?.cas?.localeCompare(b.cas) : b?.cas?.localeCompare(a.cas));
        ascendingCas = !ascendingCas;
        sortCas.classList.toggle('bi-sort-alpha-down', !ascendingCas);
        sortCas.classList.toggle('bi-sort-alpha-up', ascendingCas);
        displayProducts(products);
    })

        // ------------------------------ Sort by purity function
        let ascendingPurity = false;
        sortPurity.addEventListener('click', () => {
            products.sort((a, b) => ascendingPurity ? a.purity - b.purity : b.purity - a.purity);
            ascendingPurity = !ascendingPurity;
            sortPurity.classList.toggle('bi-sort-numeric-down', !ascendingPurity);
            sortPurity.classList.toggle('bi-sort-numeric-up', ascendingPurity);
            displayProducts(products);
        })
    
   
})