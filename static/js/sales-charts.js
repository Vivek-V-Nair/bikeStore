// Sales Charts for Bike Store Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Chart configuration and colors
    const chartColors = {
        'Mountain': '#dc2626',
        'Road': '#ea580c', 
        'Hybrid': '#d97706',
        'Electric': '#65a30d',
        'BMX': '#0891b2',
        'Cruiser': '#7c3aed'
    };

    // Function to fetch sales data by bike type
    async function fetchSalesByBikeType() {
        try {
            const response = await fetch('/api/sales-by-bike-type/');
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching sales data:', error);
            // Return mock data for demonstration
            return {
                'Mountain': 8,
                'Road': 5,
                'Hybrid': 3,
                'Electric': 2,
                'BMX': 2
            };
        }
    }

    // Function to fetch bike inventory data
    async function fetchBikeInventory() {
        try {
            const response = await fetch('/api/bike-inventory/');
            if (!response.ok) {
                throw new Error('Failed to fetch inventory data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            // Return mock data for demonstration
            return {
                'Mountain': 45,
                'Road': 32,
                'Hybrid': 28,
                'Electric': 15,
                'BMX': 12,
                'Cruiser': 8
            };
        }
    }

    // Create Sales by Bike Type Chart
    async function createSalesByBikeTypeChart() {
        const salesData = await fetchSalesByBikeType();
        const ctx = document.getElementById('salesByBikeTypeChart');
        
        if (!ctx) {
            console.warn('Sales by bike type chart canvas not found');
            return;
        }

        const labels = Object.keys(salesData);
        const data = Object.values(salesData);
        const backgroundColors = labels.map(type => chartColors[type] || '#6b7280');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sales by Bike Type',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#374151',
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });
    }

    // Create Inventory Overview Chart
    async function createInventoryChart() {
        const inventoryData = await fetchBikeInventory();
        const ctx = document.getElementById('inventoryChart');
        
        if (!ctx) {
            console.warn('Inventory chart canvas not found');
            return;
        }

        const labels = Object.keys(inventoryData);
        const data = Object.values(inventoryData);
        const backgroundColors = labels.map(type => chartColors[type] || '#6b7280');

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bikes in Stock',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6b7280'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    }

    // Function to update Total Bikes display with breakdown
    async function updateTotalBikesDisplay() {
        const inventoryData = await fetchBikeInventory();
        const totalBikes = Object.values(inventoryData).reduce((a, b) => a + b, 0);
        
        const totalBikesElement = document.querySelector('.total-bikes-count');
        const breakdownElement = document.querySelector('.bikes-breakdown');
        
        if (totalBikesElement) {
            totalBikesElement.textContent = totalBikes;
        }
        
        if (breakdownElement) {
            breakdownElement.innerHTML = Object.entries(inventoryData)
                .map(([type, count]) => `
                    <div class="breakdown-item">
                        <span class="bike-type" style="color: ${chartColors[type] || '#6b7280'}">${type}:</span>
                        <span class="bike-count">${count}</span>
                    </div>
                `).join('');
        }
    }

    // Initialize all charts and displays
    function initializeCharts() {
        // Load Chart.js if not already loaded
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = function() {
                createSalesByBikeTypeChart();
                createInventoryChart();
                updateTotalBikesDisplay();
            };
            document.head.appendChild(script);
        } else {
            createSalesByBikeTypeChart();
            createInventoryChart();
            updateTotalBikesDisplay();
        }
    }

    // Initialize charts when DOM is ready
    initializeCharts();
});