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

    // query selectors and constants
    const tableBody = document.querySelector('.table-body');
    const ctx = document.querySelector('#productChart').getContext('2d');
    const labNames = [];
    const productCount = [];


    // Fetch site data
    const data = await fetchSite();
     
    // Complete the table and use the loop to get the informations for the bar chart
    data.laboratories.forEach(lab => {
        labNames.push(lab.labNumber);
        productCount.push(lab.productCount);
        const newRow = createRow(lab);
        tableBody.append(newRow);
    });

    // Add the total line
    const totalRow = createTotalRow(data.total);
    tableBody.append(totalRow);

    // feed the bar chart
    const productChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labNames,
            datasets: [{
                label: 'Product count',
                data: productCount,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    })
});