const budgetForm = document.getElementById('budgetForm');
const budgetList = document.getElementById('budgetList');
const categoryField = document.getElementById('category');
const inputDateField = document.getElementById('inputDate');
const inputTextDateField = document.getElementById('inputTextDate');
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
let editIndex = null;

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function updateDateInputVisibility() {
    if (categoryField.value === 'FIXED EXPENSES (DUES)') {
        inputDateField.style.display = 'none';
        inputDateField.removeAttribute('required');  // Remove required from hidden input

        inputTextDateField.style.display = 'block';
        inputTextDateField.setAttribute('required', 'required');  // Add required to visible input
    } else {
        inputTextDateField.style.display = 'none';
        inputTextDateField.removeAttribute('required');  // Remove required from hidden input

        inputDateField.style.display = 'block';
        inputDateField.setAttribute('required', 'required');  // Add required to visible input
    }
}

categoryField.addEventListener('change', updateDateInputVisibility);

// Call the updateDateInputVisibility function when the modal is opened
document.getElementById('budgetModal').addEventListener('shown.bs.modal', function () {
    updateDateInputVisibility();
});

budgetForm.addEventListener('submit', function (e) {
    // Call the visibility update function before form submission
    updateDateInputVisibility();

    // Manually check the form validity before proceeding
    if (!budgetForm.checkValidity()) {
        // If form is invalid, show validation errors
        e.preventDefault();
        budgetForm.reportValidity();
        return;
    }

    // Rest of your form submission logic here
    e.preventDefault();
    const description = capitalizeWords(document.getElementById('description').value);
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);

    let dueDate;
    if (category === 'FIXED EXPENSES (DUES)') {
        dueDate = document.getElementById('inputTextDate').value;
    } else {
        dueDate = document.getElementById('inputDate').value;
    }

    // Handle the form submission and saving data logic
    if (editIndex !== null) {
        budgets[editIndex].description = description;
        budgets[editIndex].category = category;
        budgets[editIndex].amount = amount;
        budgets[editIndex].inputDate = dueDate;
        showModal('Budget updated successfully!');
    } else {
        const budgetItem = {
            description,
            category,
            amount,
            inputDate: dueDate,
            amountToPay: 0,
            status: false,
        };
        budgets.push(budgetItem);
        showModal('Budget added successfully!');
    }

    saveBudgets();
    budgetForm.reset();
    renderTable();
    editIndex = null;
    updateButtonLabel('Add Budget');
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
    const categories = ['FIXED EXPENSES (DUES)', 'VARIABLE EXPENSES', 'PAYABLES'];
    budgetList.innerHTML = '';

    categories.forEach(category => {
        const filteredBudgets = budgets.filter(budget => budget.category === category);
        
        if (filteredBudgets.length > 0) {
            let categoryHtml = `<h2>${category}</h2>`;
            categoryHtml += `
                <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                    <table class="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>DESCRIPTION</th>
                                <th>DUE DATE</th>
                                <th>STATUS</th>
                                <th>AMOUNT</th>
                                <th>AMOUNT TO PAY</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            filteredBudgets.forEach((budget, index) => {
                const amount = parseFloat(budget.amount);
                const amountToPay = parseFloat(budget.amountToPay || 0);

                categoryHtml += `
                    <tr>
                        <td>${budget.description}</td>
                        <td>${budget.inputDate}</td>
                        <td><input type="checkbox" ${budget.status ? 'checked' : ''} onclick="toggleStatus(${budgets.indexOf(budget)})"></td>
                        <td>${formatCurrency(amount)}</td>
                        <td><input type="number" value="${amountToPay}" min="0" step="0.01" onchange="updateAmountToPay(${budgets.indexOf(budget)}, this.value)"></td>
                        <td>
                            ${editIndex === budgets.indexOf(budget) 
                                ? `<button class="btn btn-sm btn-warning" onclick="cancelEdit()">Cancel</button>`
                                : `<button class="btn btn-sm btn-success" onclick="editBudget(${budgets.indexOf(budget)})">Edit</button>`
                            }
                            <button class="btn btn-sm btn-danger" onclick="deleteBudget(${budgets.indexOf(budget)})">Delete</button>
                        </td>
                    </tr>
                `;
            });

            const totalAmount = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
            const totalAmountToPay = filteredBudgets.reduce((sum, budget) => sum + budget.amountToPay, 0);
            const totalRemaining = totalAmount - totalAmountToPay;

            categoryHtml += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end">TOTAL:</td>
                                <td>${formatCurrency(totalAmount)}</td>
                                <td colspan="1">${formatCurrency(totalAmountToPay)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end">Remaining:</td>
                                <td colspan="2">${formatCurrency(totalRemaining)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            budgetList.innerHTML += categoryHtml;
        }
    });
}

function formatCurrency(value) {
    return value.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
}

function toggleStatus(index) {
    budgets[index].status = !budgets[index].status;
    saveBudgets();
    renderTable();
}

function updateAmountToPay(index, value) {
    budgets[index].amountToPay = parseFloat(value);
    saveBudgets();
    renderTable();
}

function editBudget(index) {
    editIndex = index;
    const budget = budgets[index];
    
    const editCategory = document.getElementById('editCategory');
    const editDescription = document.getElementById('editDescription');
    const editAmount = document.getElementById('editAmount');
    const editInputDate = document.getElementById('inputDateEdit');
    const editInputTextDate = document.getElementById('inputTextDateEdit');

    if (editCategory && editDescription && editAmount && (editInputDate || editInputTextDate)) {
        editCategory.value = budget.category;
        editDescription.value = budget.description;
        editAmount.value = budget.amount;

        if (budget.category === 'FIXED EXPENSES (DUES)') {
            editInputDate.style.display = 'none';
            editInputDate.removeAttribute('required');  // Remove required from hidden input

            editInputTextDate.style.display = 'block';
            editInputTextDate.value = budget.inputDate;
            editInputTextDate.setAttribute('required', 'required');  // Add required to visible input
        } else {
            editInputTextDate.style.display = 'none';
            editInputTextDate.removeAttribute('required');  // Remove required from hidden input

            editInputDate.style.display = 'block';
            editInputDate.value = budget.inputDate;
            editInputDate.setAttribute('required', 'required');  // Add required to visible input
        }

        updateButtonLabel('Update Budget');

        // Show the edit modal
        var editModal = new bootstrap.Modal(document.getElementById('editBudgetModal'));
        editModal.show();
    }
}

const editBudgetForm = document.getElementById('editBudgetForm');
if (editBudgetForm) {
    editBudgetForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const descriptionElement = document.getElementById('editDescription');
        const categoryElement = document.getElementById('editCategory');
        const amountElement = document.getElementById('editAmount');
        const inputDateElement = document.getElementById('inputDateEdit');
        const inputTextDateElement = document.getElementById('inputTextDateEdit');

        if (descriptionElement && categoryElement && amountElement && (inputDateElement || inputTextDateElement)) {
            const description = capitalizeWords(descriptionElement.value);
            const category = categoryElement.value;
            const amount = parseFloat(amountElement.value);

            let dueDate;
            if (category === 'FIXED EXPENSES (DUES)') {
                dueDate = inputTextDateElement.value;
            } else {
                dueDate = inputDateElement.value;
            }

            if (editIndex !== null) {
                budgets[editIndex].description = description;
                budgets[editIndex].category = category;
                budgets[editIndex].amount = amount;
                budgets[editIndex].inputDate = dueDate;
                showModal('Budget updated successfully!');
                saveBudgets();
                renderTable();
                editIndex = null;
                updateButtonLabel('Add Budget');
                // Hide the edit modal
                var editModal = bootstrap.Modal.getInstance(document.getElementById('editBudgetModal'));
                editModal.hide();
            }
        }
    });
}

function showModal(message) {
    document.getElementById('modalMessage').textContent = message;
    var myModal = new bootstrap.Modal(document.getElementById('successModal'));
    myModal.show();
}

function updateButtonLabel(label) {
    document.querySelector('#budgetForm button[type="submit"]').textContent = label;
}

function renderTable() {
    const categories = ['FIXED EXPENSES (DUES)', 'VARIABLE EXPENSES', 'PAYABLES'];
    budgetList.innerHTML = '';

    categories.forEach(category => {
        const filteredBudgets = budgets.filter(budget => budget.category === category);
        
        if (filteredBudgets.length > 0) {
            let categoryHtml = `<h2>${category}</h2>`;
            categoryHtml += `
                <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                    <table class="table table-bordered mt-3">
                        <thead>
                            <tr>
                                <th>DESCRIPTION</th>
                                <th>DUE DATE</th>
                                <th>STATUS</th>
                                <th>AMOUNT</th>
                                <th>AMOUNT TO PAY</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            filteredBudgets.forEach((budget, index) => {
                const amount = parseFloat(budget.amount);
                const amountToPay = parseFloat(budget.amountToPay || 0);

                categoryHtml += `
                    <tr>
                        <td>${budget.description}</td>
                        <td>${budget.inputDate}</td>
                        <td><input type="checkbox" ${budget.status ? 'checked' : ''} onclick="toggleStatus(${budgets.indexOf(budget)})"></td>
                        <td>${formatCurrency(amount)}</td>
                        <td><input type="number" value="${amountToPay}" min="0" step="0.01" onchange="updateAmountToPay(${budgets.indexOf(budget)}, this.value)"></td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="editBudget(${budgets.indexOf(budget)})">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteBudget(${budgets.indexOf(budget)})">Delete</button>
                        </td>
                    </tr>
                `;
            });

            const totalAmount = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
            const totalAmountToPay = filteredBudgets.reduce((sum, budget) => sum + budget.amountToPay, 0);
            const totalRemaining = totalAmount - totalAmountToPay;

            categoryHtml += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-end">TOTAL:</td>
                                <td>${formatCurrency(totalAmount)}</td>
                                <td colspan="1">${formatCurrency(totalAmountToPay)}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-end">Remaining:</td>
                                <td colspan="2">${formatCurrency(totalRemaining)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;

            budgetList.innerHTML += categoryHtml;
        }
    });
}

function formatCurrency(value) {
    return value.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
}

function toggleStatus(index) {
    budgets[index].status = !budgets[index].status;
    saveBudgets();
    renderTable();
}

function updateAmountToPay(index, value) {
    // Parse the input value as a float and handle invalid cases
    const parsedValue = parseFloat(value);
    budgets[index].amountToPay = isNaN(parsedValue) ? 0 : parsedValue;
    saveBudgets();
    renderTable();
}

function editBudget(index) {
    editIndex = index;
    const budget = budgets[index];
    
    const editCategory = document.getElementById('editCategory');
    const editDescription = document.getElementById('editDescription');
    const editAmount = document.getElementById('editAmount');
    
    if (editCategory && editDescription && editAmount) {
        editCategory.value = budget.category;
        editDescription.value = budget.description;
        editAmount.value = budget.amount;
        
        const editInputDate = document.getElementById('inputDateEdit');
        const editInputTextDate = document.getElementById('inputTextDateEdit');
        
        if (editInputDate && editInputTextDate) {
            if (budget.category === 'FIXED EXPENSES (DUES)') {
                editInputDate.style.display = 'none';
                editInputTextDate.style.display = 'block';
                editInputTextDate.value = budget.inputDate;
            } else {
                editInputDate.style.display = 'block';
                editInputTextDate.style.display = 'none';
                editInputDate.value = budget.inputDate;
            }
        }
        
        updateButtonLabel('Update Budget');
        var myModal = new bootstrap.Modal(document.getElementById('editBudgetModal'));
        myModal.show();
    } else {
        console.error('One or more elements are missing in the DOM.');
    }
}

document.getElementById('editBudgetForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const description = capitalizeWords(document.getElementById('editDescription').value);
    const category = document.getElementById('editCategory').value;
    const amount = parseFloat(document.getElementById('editAmount').value);
    
    let dueDate;
    if (category === 'FIXED EXPENSES (DUES)') {
        dueDate = document.getElementById('editInputTextDate').value;
    } else {
        dueDate = document.getElementById('editInputDate').value;
    }

    budgets[editIndex].description = description;
    budgets[editIndex].category = category;
    budgets[editIndex].amount = amount;
    budgets[editIndex].inputDate = dueDate;
    
    showModal('Budget updated successfully!');
    
    saveBudgets();
    renderTable();

    var editModal = bootstrap.Modal.getInstance(document.getElementById('editBudgetModal'));
    editModal.hide();

    editIndex = null;
});

function cancelEdit() {
    editIndex = null;
    updateButtonLabel('Add Budget');
    
    // Hide the edit modal
    var editModal = bootstrap.Modal.getInstance(document.getElementById('editBudgetModal'));
    if (editModal) {
        editModal.hide();
    }
}

function deleteBudget(index) {
    if (confirm('Are you sure you want to delete this budget?')) {
        budgets.splice(index, 1);
        saveBudgets();
        renderTable();
    }
}

function saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

renderTable();