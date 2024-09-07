const budgetForm = document.getElementById('budgetForm');
const budgetTableBody = document.getElementById('budgetTableBody');
const totalAmountElement = document.getElementById('totalAmount');
const inputDateField = document.getElementById('inputDate');
const categoryFilter = document.getElementById('categoryFilter');
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
let editIndex = null;

function initializeDateField() {
    const today = new Date().toISOString().split('T')[0];
    inputDateField.setAttribute('max', today);
}

budgetForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const category = capitalizeWords(document.getElementById('category').value);
    const amount = formatCurrency(document.getElementById('amount').value);
    const inputtedBy = capitalizeWords(document.getElementById('inputtedBy').value);

    const currentTime = new Date();
    const formattedTime = formatTime12Hour(currentTime);
    const currentDate = currentTime.toISOString().split('T')[0];

    if (editIndex !== null) {
        // Update logic without affecting the original "Inserted by" value
        budgets[editIndex].category = category;
        budgets[editIndex].amount = amount;
        budgets[editIndex].updatedAt = currentDate + ' <br> ' + formattedTime;
        budgets[editIndex].updatedBy = inputtedBy; // Set the updatedBy value
        showModal('Budget updated successfully!');
    } else {
        // Create new budget entry
        const budgetItem = {
            category,
            amount,
            inputDate: currentDate,
            inputtedBy, // This field should remain the same, untouched by updates
            inputTime: formattedTime,
            updatedAt: "",
            updatedBy: "",
        };
        budgets.push(budgetItem);
        showModal('Budget added successfully!');
    }

    saveBudgets();
    budgetForm.reset();
    inputDateField.disabled = false; // Re-enable date input for new entry
    renderTable();
    editIndex = null;
    updateButtonLabel('Add Budget');
    
    // Change label back to "Inserted by" after form reset
    document.getElementById('inputtedByLabel').textContent = 'Inserted by:';
});

function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    var myModal = new bootstrap.Modal(document.getElementById('successModal'));
    myModal.show();
}

function updateButtonLabel(label) {
    document.querySelector('#budgetForm button[type="submit"]').textContent = label;
}

function renderTable() {
    budgetTableBody.innerHTML = '';
    let totalAmount = 0;
    
    // Get selected category from the filter
    const selectedCategory = categoryFilter.value;

    budgets.forEach((budget, index) => {
        // Only show rows that match the selected category or show all if "All Categories" is selected
        if (selectedCategory === '' || budget.category === selectedCategory) {
            const amount = parseFloat(budget.amount.replace(/[^0-9.-]/g, ''));
            totalAmount += amount;

            budgetTableBody.innerHTML += `
                <tr>
                    <td>${budget.category}</td>
                    <td>${budget.amount}</td>
                    <td>${budget.inputDate} <br> ${budget.inputTime}</td>
                    <td>${budget.inputtedBy}</td>
                    <td>${budget.updatedAt || "N/A"}</td>
                    <td>${budget.updatedBy || "N/A"}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="editBudget(${index})">Edit</button>
                        <button class="btn btn-sm ${editIndex === index ? 'btn-warning' : 'btn-danger'}" onclick="${editIndex === index ? 'cancelEdit()' : 'deleteBudget(' + index + ')'}">${editIndex === index ? 'Cancel' : 'Delete'}</button>
                    </td>
                </tr>
            `;
        }
    });

    totalAmountElement.textContent = formatCurrency(totalAmount);
}

// Function to format time to 12-hour format
function formatTime12Hour(date) {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
}

// Capitalize first letter of each word
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Format amount as currency
function formatCurrency(amount) {
    // Convert amount to a number
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return 'Invalid amount';
    
    // Format the number with commas and add the PHP symbol
    return numAmount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
}

function saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

function editBudget(index) {
    const budget = budgets[index];
    document.getElementById('category').value = budget.category;
    document.getElementById('amount').value = budget.amount.replace(/[^0-9.-]/g, '');
    document.getElementById('inputtedBy').value = budget.inputtedBy;

    document.getElementById('inputtedByLabel').textContent = 'Updated by:';
    
    inputDateField.disabled = true; // Disable date input during editing
    editIndex = index; // Track the current edit mode
    updateButtonLabel('Update Budget');
    renderTable(); // Re-render table to reflect changes in buttons
}

function cancelEdit() {
    editIndex = null; // Reset edit mode
    budgetForm.reset(); // Reset the form
    inputDateField.disabled = false; // Enable date input again
    updateButtonLabel('Add Budget');

    document.getElementById('inputtedByLabel').textContent = 'Inserted by:';

    renderTable(); // Re-render the table to reset buttons
}

function deleteBudget(index) {
    const confirmed = confirm('Are you sure you want to delete this budget?');
    if (confirmed) {
        budgets.splice(index, 1);
        saveBudgets();
        renderTable();
    }
}

// Function to update the category filter dropdown
function updateCategoryFilter() {
    // Clear existing options except the default "All Categories" option
    categoryFilter.innerHTML = '<option value="">All</option>';
    
    // Create a Set to avoid duplicate categories
    const uniqueCategories = new Set(budgets.map(budget => budget.category));

    // Add unique categories to the filter dropdown
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter table whenever the category filter changes
categoryFilter.addEventListener('change', renderTable);

// Update the dropdown and table whenever a new budget is added or updated
budgetForm.addEventListener('submit', function (e) {
    e.preventDefault();
    
    // Existing form submission logic...
    
    saveBudgets();
    updateCategoryFilter(); // Update the category filter
    budgetForm.reset();
    inputDateField.disabled = false; // Re-enable date input for new entry
    renderTable();
    editIndex = null;
    updateButtonLabel('Add Budget');
    
    // Change label back to "Inserted by" after form reset
    document.getElementById('inputtedByLabel').textContent = 'Inserted by:';
});

// Initialize the page on load
initializeDateField();
renderTable();
updateCategoryFilter(); // Initialize the category filter when the page loads