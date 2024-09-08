document.addEventListener('DOMContentLoaded', (event) => {
    Chart.register(ChartDataLabels);

    const ctx = document.getElementById('sale-summary-pie-chart').getContext('2d');
    const saleSummaryPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Number of Sales', 'Profit'],
            datasets: [{
                label: 'Sale Tracker',
                data: [3000, 1500], // Example data
                backgroundColor: ['#FFCE56', '#36A2EB'], // Ensure number of colors matches the number of data points
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
                            return `${tooltipItem.label}: $${tooltipItem.raw}`;
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
                        const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${percentage}%`;
                    }
                }
            }
        }
    });
});
