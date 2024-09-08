const budgetForm = document.getElementById('budgetForm');
const budgetList = document.getElementById('budgetList');
const inputDateField = document.getElementById('inputDate');
let budgets = JSON.parse(localStorage.getItem('budgets')) || [];
let editIndex = null;

function capitalizeWords(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

budgetForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const description = capitalizeWords(document.getElementById('description').value);
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const inputDate = document.getElementById('inputDate').value;

    if (editIndex !== null) {
        // Update logic
        budgets[editIndex].description = description;
        budgets[editIndex].category = category;
        budgets[editIndex].amount = amount;
        budgets[editIndex].inputDate = inputDate;
        showModal('Budget updated successfully!');
    } else {
        // Create new budget entry
        const budgetItem = {
            description,
            category,
            amount,
            inputDate,
            amountToPay: 0, // Initialize amountToPay
            status: false, // Default status
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
        // Filter budgets by category
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
                                <th>STAUTS</th>
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
    const budget = budgets[index];
    document.getElementById('description').value = budget.description;
    document.getElementById('category').value = budget.category;
    document.getElementById('amount').value = budget.amount;
    document.getElementById('amountToPay').value = budget.amountToPay || 0;
    inputDateField.value = budget.inputDate;

    editIndex = index;
    updateButtonLabel('Update Budget');
}

function cancelEdit() {
    editIndex = null;
    updateButtonLabel('Add Budget');
}

function deleteBudget(index) {
    budgets.splice(index, 1);
    saveBudgets();
    renderTable();
}

function saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(budgets));
}

renderTable();