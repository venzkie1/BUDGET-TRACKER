document.addEventListener('DOMContentLoaded', () => {
    Chart.register(ChartDataLabels);

    const ctx = document.getElementById('sale-summary-bar-chart').getContext('2d');
    const saleSummaryBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Sales', 'Total Profit'],
            datasets: [{
                label: 'Sale Tracker',
                data: getDataForChart(), // Initial data for all items
                backgroundColor: ['#FFCE56', '#36A2EB'],
                borderColor: ['black', 'black'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${formatCurrency(tooltipItem.raw)}`;
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
                        top: 10,
                        bottom: 10
                    },
                    formatter: (value, context) => {
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${percentage}%`;
                    }
                }
            }
        }
    });

    // Populate item filter dropdown
    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    const itemSet = new Set(salesData.map(sale => sale.saleItem));
    const itemFilter = document.getElementById('itemFilter');

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Items';
    itemFilter.appendChild(defaultOption);

    // Add options for each item
    itemSet.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        itemFilter.appendChild(option);
    });

    // Event listener for filter changes
    itemFilter.addEventListener('change', (event) => {
        const selectedItem = event.target.value;
        const data = getDataForChart(selectedItem);
        saleSummaryBarChart.data.datasets[0].data = data;
        saleSummaryBarChart.update();
    });
});

function getDataForChart(selectedItem = '') {
    const salesData = JSON.parse(localStorage.getItem('salesData')) || [];
    const itemTotals = {};
    let totalSales = 0;
    let totalProfit = 0;

    salesData.forEach(sale => {
        const { saleItem, saleCapital, saleQuantity, saleNumberOfItems, saleSellingPrice } = sale;
        const costPerItem = saleCapital / saleNumberOfItems;
        const totalCost = costPerItem * saleQuantity;
        const totalSellingPrice = saleSellingPrice * saleQuantity;
        const profit = totalSellingPrice - totalCost;

        if (!itemTotals[saleItem]) {
            itemTotals[saleItem] = { totalSales: 0, totalProfit: 0 };
        }
        itemTotals[saleItem].totalSales += totalSellingPrice;
        itemTotals[saleItem].totalProfit += profit;
    });

    if (selectedItem) {
        // Return data for selected item
        return [
            itemTotals[selectedItem]?.totalSales || 0,
            itemTotals[selectedItem]?.totalProfit || 0
        ];
    } else {
        // Return combined data for all items
        for (const totals of Object.values(itemTotals)) {
            totalSales += totals.totalSales;
            totalProfit += totals.totalProfit;
        }
        return [totalSales, totalProfit];
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}