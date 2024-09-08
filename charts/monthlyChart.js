Chart.register(ChartDataLabels);

const ctx = document.getElementById('monthly-summary-bar-chart').getContext('2d');
const monthlySummaryBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Total Budget', 'Expenses', 'Balance'],
        datasets: [{
            label: 'Monthly Summary',
            data: [3000, 1500, 500], // Example data
            backgroundColor: ['#FFCE56', '#36A2EB', '#F3A012'],
            borderColor: ['black', 'black', 'black'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: false
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
        },
        scales: {
            x: {
                beginAtZero: true
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return `$${value}`;
                    }
                }
            }
        }
    }
});