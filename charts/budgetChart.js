document.addEventListener('DOMContentLoaded', (event) => {
    Chart.register(ChartDataLabels);

    // Fetch budget data from local storage
    let budgets = JSON.parse(localStorage.getItem('budgets')) || [];

    // Function to calculate remaining amounts by category
    function calculateCategoryRemaining(budgets) {
        return budgets.reduce((totals, budget) => {
            if (!totals[budget.category]) {
                totals[budget.category] = { total: 0, amountToPay: 0 };
            }
            totals[budget.category].total += budget.amount; // Total amount for the category
            totals[budget.category].amountToPay += budget.amountToPay; // Amount to pay for the category
            return totals;
        }, {});
    }

    // Calculate remaining amounts by category
    const categoryTotals = calculateCategoryRemaining(budgets);

    // Data for the chart
    const chartData = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            label: 'Remaining Budget',
            data: Object.values(categoryTotals).map(cat => cat.total - cat.amountToPay), // Calculate remaining amount
            backgroundColor: ['#FFCE56', '#36A2EB', '#F3A012'], // Adjust colors as needed
            borderColor: ['black', 'black', 'black'],
            borderWidth: 1
        }]
    };

    // Initialize the chart
    const ctx = document.getElementById('budget-summary-pie-chart').getContext('2d');
    const budgetSummaryPieChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20, // Add padding to avoid overlapping
                        boxWidth: 20 // Adjust box width if needed
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(tooltipItem.raw)}`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 16
                    },
                    anchor: 'center',
                    align: 'center',
                    padding: {
                        top: 10,  // Adjust this value as needed
                        bottom: 10 // Adjust this value as needed
                    },
                    formatter: (value, context) => {
                        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value); // Format as PHP
                    }
                }
            }
        }
    });
});