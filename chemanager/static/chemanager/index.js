import { fetchSite } from "./api.js";

// Function to create row of the table from the index page displaying lab informationS
function createRow(lab){
    let newRow = document.createElement('tr');
    newRow.innerHTML = `
        <th scope="row">${lab.labNumber}</th>
        <td>${lab.productCount}</td>
    `
    return newRow
}

// Function to create the last row of the table containing the total number of compounds
function createTotalRow(total){
    let totalRow = document.createElement('tr');
    totalRow.classList.add('table-active');
    totalRow.innerHTML = `
        <th scope="row">Total</th>
        <td>${total}</td>
    `
    return totalRow;
}

// Main function
document.addEventListener("DOMContentLoaded", async () => {

    // query selectors
    const tableBody = document.querySelector('.table-body');

    // Fetch site data
    const data = await fetchSite();
     
    // Complete the table
    data.laboratories.forEach(lab => {
        const newRow = createRow(lab);
        tableBody.append(newRow);
    });

    // Add the total line
    const totalRow = createTotalRow(data.total);
    tableBody.append(totalRow);
});