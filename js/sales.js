const saleForm = document.getElementById('salesForm');
const salesTableBody = document.getElementById('salesTableBody');

// Load existing sales data and populate the table
document.addEventListener('DOMContentLoaded', () => {
    RenderTable();
});

saleForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const saleDate = document.getElementById('saleDate').value;
    const saleItem = capitalizeWords(document.getElementById('saleItem').value);
    const saleCapital = parseFloat(document.getElementById('saleCapital').value) || 0;
    const saleQuantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    const saleNumberOfItems = parseInt(document.getElementById('saleNumberOfItems').value) || 0;
    const saleSellingPrice = parseFloat(document.getElementById('saleSellingPrice').value) || 0;

    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];

    if (window.currentEditItem) {
        const updatedSalesData = salesData.map(sale =>
            (sale.saleDate === window.currentEditItem.saleDate && sale.saleItem === window.currentEditItem.saleItem)
                ? { saleDate, saleItem, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice }
                : sale
        );

        localStorage.setItem('salesData', JSON.stringify(updatedSalesData));
        window.currentEditItem = null;
    } else {
        salesData.push({ saleDate, saleItem, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice });
        localStorage.setItem('salesData', JSON.stringify(salesData));
    }

    RenderTable();
    saleForm.reset();

    const modal = bootstrap.Modal.getInstance(document.getElementById('salesModal'));
    modal.hide();
});

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

function RenderTable() {
    salesTableBody.innerHTML = '';

    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    const itemTotals = {};

    salesData.forEach(sale => {
        const { saleDate, saleItem, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice } = sale;
        const costPerItem = saleCapital / saleNumberOfItems;
        const totalCost = costPerItem * saleQuantity;
        const totalSellingPrice = saleSellingPrice * saleQuantity;
        const profit = totalSellingPrice - totalCost;

        // Update item totals
        if (!itemTotals[saleItem]) {
            itemTotals[saleItem] = { totalProfit: 0, items: [] };
        }
        itemTotals[saleItem].totalProfit += profit;
        itemTotals[saleItem].items.push({ saleDate, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice, profit });

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${saleDate}</td>
            <td>${capitalizeWords(saleItem)}</td>
            <td>${formatCurrency(saleCapital)}</td>
            <td>${saleQuantity}</td>
            <td>${saleNumberOfItems}</td>
            <td>${formatCurrency(saleSellingPrice)}</td>
            <td>${formatCurrency(profit)}</td>
            <td>
                <button class="btn btn-info btn-sm" onclick="viewItemTotals('${saleItem}')">View All</button>
                <button class="btn btn-warning btn-sm" onclick="editItem('${saleDate}', '${saleItem}', ${saleCapital}, ${saleQuantity}, ${saleNumberOfItems}, ${saleSellingPrice})">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${saleDate}', '${saleItem}')">Delete</button>

            </td>
        `;

        salesTableBody.appendChild(newRow);
    });

    // Refresh item totals modal content
    const itemTotalsBody = document.getElementById('itemTotalsBody');
    itemTotalsBody.innerHTML = '';
    for (const [item, { totalProfit, items }] of Object.entries(itemTotals)) {
        const itemDetails = items.map(({ saleDate, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice, profit }) =>
            `<li>Date: ${saleDate}, Capital: ${formatCurrency(saleCapital)}, Quantity Sold: ${saleQuantity}, Number of Items: ${saleNumberOfItems}, Selling Price: ${formatCurrency(saleSellingPrice)}, Profit: ${formatCurrency(profit)}</li>`
        ).join('');
        itemTotalsBody.innerHTML += `
            <h5>${capitalizeWords(item)}</h5>
            <ul>
                ${itemDetails}
            </ul>
            <p><strong>Total Profit: ${formatCurrency(totalProfit)}</strong></p>
            <hr>
        `;
    }
}

function viewItemTotals(item) {
    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    const itemData = salesData.filter(sale => sale.saleItem === item);

    // Extract unique months from itemData
    const months = [...new Set(itemData.map(sale => sale.saleDate.substring(0, 7)))].sort((a, b) => new Date(b) - new Date(a)); // Sort descending

    const filterDropdown = `
        <div class="mb-3">
            <label for="monthFilter" class="form-label">Filter by Month</label>
            <select id="monthFilter" class="form-select">
                <option value="">All Months</option>
                ${months.map(month => {
                    const [year, monthNumber] = month.split('-');
                    const date = new Date(year, monthNumber - 1);
                    const monthName = date.toLocaleString('default', { month: 'long' });
                    return `<option value="${month}">${monthName} ${year}</option>`;
                }).join('')}
            </select>
        </div>
    `;

    const itemTotalsBody = document.getElementById('itemTotalsBody');
    itemTotalsBody.innerHTML = filterDropdown;

    const monthFilter = document.getElementById('monthFilter');

    monthFilter.addEventListener('change', (event) => {
        const selectedMonth = event.target.value;
        displayItemData(itemData, selectedMonth);
    });    

    function displayItemData(data, month) {
        // Ensure that the saleDate is in the format YYYY-MM-DD and matches the selected month
        const filteredData = month ? data.filter(sale => {
            const saleMonth = sale.saleDate.substring(0, 7); // Extract YYYY-MM from saleDate
            return saleMonth === month;
        }) : data;

        let tableContent = `
            <table class="table table-bordered table-striped">
                <thead class="table-primary">
                    <tr>
                        <th>Date</th>
                        <th>Item Name</th>
                        <th>Capital</th>
                        <th>Quantity Sold</th>
                        <th>Number of Items</th>
                        <th>Selling Price</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let totalCapital = 0, totalQuantitySold = 0, totalNumberOfItems = 0, totalProfit = 0;

        filteredData.forEach(({ saleItem, saleDate, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice }) => {
            const costPerItem = saleCapital / saleNumberOfItems;
            const totalCost = costPerItem * saleQuantity;
            const totalSellingPrice = saleSellingPrice * saleQuantity;
            const profit = totalSellingPrice - totalCost;

            tableContent += `
                <tr>
                    <td>${saleDate}</td>
                    <td>${capitalizeWords(saleItem)}</td>
                    <td>${formatCurrency(saleCapital)}</td>
                    <td>${saleQuantity}</td>
                    <td>${saleNumberOfItems}</td>
                    <td>${formatCurrency(saleSellingPrice)}</td>
                    <td>${formatCurrency(profit)}</td>
                </tr>
            `;
            totalCapital += saleCapital;
            totalQuantitySold += saleQuantity;
            totalNumberOfItems += saleNumberOfItems;
            totalProfit += profit;
        });

        tableContent += `
            </tbody>
            <tfoot class="gray-background">
                <tr>
                    <th>Combined Totals</th>
                    <th>-</th>
                    <th>${formatCurrency(totalCapital)}</th>
                    <th>${totalQuantitySold}</th>
                    <th>${totalNumberOfItems}</th>
                    <th>-</th>
                    <th>${formatCurrency(totalProfit)}</th>
                </tr>
            </tfoot>
        </table>
        `;

        itemTotalsBody.innerHTML = filterDropdown + tableContent;
    }

    // Initial display of item data
    displayItemData(itemData, '');

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('itemTotalsModal'));
    modal.show();
}

function editItem(saleDate, saleItem, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice) {
    // Populate the form fields with the existing data
    document.getElementById('saleDate').value = saleDate;
    document.getElementById('saleItem').value = saleItem;
    document.getElementById('saleCapital').value = saleCapital;
    document.getElementById('saleQuantity').value = saleQuantity;
    document.getElementById('saleNumberOfItems').value = saleNumberOfItems;
    document.getElementById('saleSellingPrice').value = saleSellingPrice;

    // Set a flag or store the item data in a global variable to know which item is being edited
    window.currentEditItem = { saleDate, saleItem };

    // Open the modal
    const modal = new bootstrap.Modal(document.getElementById('salesModal'));
    modal.show();
}

function deleteItem(saleDate, saleItem) {
    // Get existing sales data
    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];

    // Filter out the item to delete
    const updatedSalesData = salesData.filter(sale =>
        !(sale.saleDate === saleDate && sale.saleItem === saleItem)
    );

    // Update local storage
    localStorage.setItem('salesData', JSON.stringify(updatedSalesData));

    // Refresh the table view
    RenderTable();
}