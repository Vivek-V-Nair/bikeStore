// Interactive Dashboard with Real-time Updates and Advanced Chart Functionality
// Enhanced charts with animations, drill-down capabilities, and live data updates

class DashboardManager {
    constructor() {
        this.charts = new Map();
        this.updateInterval = null;
        this.refreshRate = 30000; // 30 seconds
        this.isRealTimeEnabled = true;
        this.chartColors = {
            primary: '#0d6efd',
            secondary: '#6c757d',
            success: '#198754',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#0dcaf0',
            light: '#f8f9fa',
            dark: '#212529'
        };
        
        this.chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e9ecef',
                        font: {
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#6c757d',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#6c757d'
                    },
                    grid: {
                        color: '#495057'
                    }
                },
                y: {
                    ticks: {
                        color: '#6c757d'
                    },
                    grid: {
                        color: '#495057'
                    }
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupChartsContainer();
        this.loadDashboardData();
        this.setupRealTimeUpdates();
        this.setupChartControls();
        this.setupKeyboardShortcuts();
        this.setupExportFeatures();
    }
    
    setupChartsContainer() {
        // Add chart controls
        const chartsContainer = document.getElementById('charts-container');
        if (chartsContainer) {
            this.addChartControls(chartsContainer);
        }
    }
    
    addChartControls(container) {
        const controlsHtml = `
            <div class="chart-controls d-flex justify-content-between align-items-center mb-4 p-3 bg-dark rounded border border-secondary">
                <div class="chart-filters">
                    <label class="form-label text-light me-2">Time Period:</label>
                    <select class="form-select form-select-sm me-3" id="timePeriod" style="width: auto;">
                        <option value="7">Last 7 days</option>
                        <option value="30" selected>Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                    
                    <label class="form-label text-light me-2">Chart Type:</label>
                    <select class="form-select form-select-sm me-3" id="chartType" style="width: auto;">
                        <option value="line">Line Chart</option>
                        <option value="bar" selected>Bar Chart</option>
                        <option value="doughnut">Doughnut Chart</option>
                        <option value="radar">Radar Chart</option>
                    </select>
                </div>
                
                <div class="chart-actions">
                    <button class="btn btn-sm btn-outline-primary me-2" id="refreshCharts">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                    <button class="btn btn-sm btn-outline-success me-2" id="exportCharts">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="btn btn-sm btn-outline-info" id="toggleRealTime">
                        <i class="fas fa-play"></i> Real-time: ON
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('afterbegin', controlsHtml);
        this.bindControlEvents();
    }
    
    bindControlEvents() {
        // Time period change
        document.getElementById('timePeriod')?.addEventListener('change', (e) => {
            this.refreshChartsWithPeriod(e.target.value);
        });
        
        // Chart type change
        document.getElementById('chartType')?.addEventListener('change', (e) => {
            this.changeChartType(e.target.value);
        });
        
        // Refresh button
        document.getElementById('refreshCharts')?.addEventListener('click', () => {
            this.refreshAllCharts();
        });
        
        // Export button
        document.getElementById('exportCharts')?.addEventListener('click', () => {
            this.exportAllCharts();
        });
        
        // Real-time toggle
        document.getElementById('toggleRealTime')?.addEventListener('click', () => {
            this.toggleRealTime();
        });
    }
    
    async loadDashboardData() {
        try {
            this.showLoadingState();
            
            const response = await fetch('/api/dashboard/data/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.renderAllCharts(data);
                this.updateStatsCards(data.stats);
                this.hideLoadingState();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showErrorState(error.message);
        }
    }
    
    renderAllCharts(data) {
        // Sales by Bike Type Chart
        this.renderSalesByTypeChart(data.salesByType);
        
        // Monthly Sales Chart
        this.renderMonthlySalesChart(data.monthlySales);
        
        // Revenue Trend Chart
        this.renderRevenueTrendChart(data.revenueTrend);
        
        // Customer Activity Chart
        this.renderCustomerActivityChart(data.customerActivity);
        
        // Inventory Status Chart
        this.renderInventoryChart(data.inventory);
    }
    
    renderSalesByTypeChart(data) {
        const ctx = document.getElementById('salesByTypeChart');
        if (!ctx) return;
        
        if (this.charts.has('salesByType')) {
            this.charts.get('salesByType').destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.success,
                        this.chartColors.warning,
                        this.chartColors.danger,
                        this.chartColors.info
                    ],
                    borderColor: '#495057',
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                ...this.chartDefaults,
                plugins: {
                    ...this.chartDefaults.plugins,
                    legend: {
                        ...this.chartDefaults.plugins.legend,
                        position: 'bottom'
                    },
                    tooltip: {
                        ...this.chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                },
                onHover: (event, elements) => {
                    event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const label = data.labels[index];
                        this.drillDownByType(label);
                    }
                }
            }
        });
        
        this.charts.set('salesByType', chart);
    }
    
    renderMonthlySalesChart(data) {
        const ctx = document.getElementById('monthlySalesChart');
        if (!ctx) return;
        
        if (this.charts.has('monthlySales')) {
            this.charts.get('monthlySales').destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Sales Count',
                        data: data.salesCount,
                        borderColor: this.chartColors.primary,
                        backgroundColor: this.chartColors.primary + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: this.chartColors.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: 'Revenue (₹)',
                        data: data.revenue,
                        borderColor: this.chartColors.success,
                        backgroundColor: this.chartColors.success + '20',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: this.chartColors.success,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                ...this.chartDefaults,
                scales: {
                    ...this.chartDefaults.scales,
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        ticks: {
                            color: '#6c757d',
                            callback: (value) => '₹' + value.toLocaleString()
                        },
                        grid: {
                            drawOnChartArea: false,
                            color: '#495057'
                        }
                    }
                },
                plugins: {
                    ...this.chartDefaults.plugins,
                    tooltip: {
                        ...this.chartDefaults.plugins.tooltip,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: (tooltipItems) => `Month: ${tooltipItems[0].label}`,
                            label: (context) => {
                                if (context.datasetIndex === 1) {
                                    return `Revenue: ₹${context.raw.toLocaleString()}`;
                                }
                                return `${context.dataset.label}: ${context.raw}`;
                            }
                        }
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
        
        this.charts.set('monthlySales', chart);
    }
    
    renderRevenueTrendChart(data) {
        const ctx = document.getElementById('revenueTrendChart');
        if (!ctx) return;
        
        if (this.charts.has('revenueTrend')) {
            this.charts.get('revenueTrend').destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Daily Revenue (₹)',
                    data: data.values,
                    backgroundColor: data.values.map(value => {
                        // Color bars based on performance
                        const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
                        if (value > avg * 1.2) return this.chartColors.success + '80';
                        if (value < avg * 0.8) return this.chartColors.danger + '80';
                        return this.chartColors.primary + '80';
                    }),
                    borderColor: data.values.map(value => {
                        const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
                        if (value > avg * 1.2) return this.chartColors.success;
                        if (value < avg * 0.8) return this.chartColors.danger;
                        return this.chartColors.primary;
                    }),
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                ...this.chartDefaults,
                plugins: {
                    ...this.chartDefaults.plugins,
                    tooltip: {
                        ...this.chartDefaults.plugins.tooltip,
                        callbacks: {
                            label: (context) => `Revenue: ₹${context.raw.toLocaleString()}`
                        }
                    }
                },
                scales: {
                    ...this.chartDefaults.scales,
                    y: {
                        ...this.chartDefaults.scales.y,
                        ticks: {
                            ...this.chartDefaults.scales.y.ticks,
                            callback: (value) => '₹' + value.toLocaleString()
                        }
                    }
                },
                animation: {
                    duration: 1200,
                    easing: 'easeOutBounce'
                }
            }
        });
        
        this.charts.set('revenueTrend', chart);
    }
    
    renderCustomerActivityChart(data) {
        const ctx = document.getElementById('customerActivityChart');
        if (!ctx) return;
        
        if (this.charts.has('customerActivity')) {
            this.charts.get('customerActivity').destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Customer Activity',
                    data: data.values,
                    borderColor: this.chartColors.info,
                    backgroundColor: this.chartColors.info + '20',
                    borderWidth: 2,
                    pointBackgroundColor: this.chartColors.info,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                ...this.chartDefaults,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: {
                            color: '#6c757d'
                        },
                        grid: {
                            color: '#495057'
                        },
                        angleLines: {
                            color: '#495057'
                        },
                        pointLabels: {
                            color: '#e9ecef'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutSine'
                }
            }
        });
        
        this.charts.set('customerActivity', chart);
    }
    
    renderInventoryChart(data) {
        const ctx = document.getElementById('inventoryChart');
        if (!ctx) return;
        
        if (this.charts.has('inventory')) {
            this.charts.get('inventory').destroy();
        }
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'In Stock',
                        data: data.inStock,
                        backgroundColor: this.chartColors.success + '80',
                        borderColor: this.chartColors.success,
                        borderWidth: 2
                    },
                    {
                        label: 'Low Stock',
                        data: data.lowStock,
                        backgroundColor: this.chartColors.warning + '80',
                        borderColor: this.chartColors.warning,
                        borderWidth: 2
                    },
                    {
                        label: 'Out of Stock',
                        data: data.outOfStock,
                        backgroundColor: this.chartColors.danger + '80',
                        borderColor: this.chartColors.danger,
                        borderWidth: 2
                    }
                ]
            },
            options: {
                ...this.chartDefaults,
                scales: {
                    ...this.chartDefaults.scales,
                    x: {
                        ...this.chartDefaults.scales.x,
                        stacked: true
                    },
                    y: {
                        ...this.chartDefaults.scales.y,
                        stacked: true
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });
        
        this.charts.set('inventory', chart);
    }
    
    updateStatsCards(stats) {
        // Animate stat cards with counters
        Object.entries(stats).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                this.animateCounter(element, value);
            }
        });
    }
    
    animateCounter(element, targetValue) {
        const startValue = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
            
            if (key === 'total-revenue') {
                element.textContent = '₹' + currentValue.toLocaleString();
            } else {
                element.textContent = currentValue.toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    setupRealTimeUpdates() {
        if (this.isRealTimeEnabled) {
            this.updateInterval = setInterval(() => {
                this.refreshAllCharts();
            }, this.refreshRate);
        }
    }
    
    toggleRealTime() {
        const button = document.getElementById('toggleRealTime');
        
        if (this.isRealTimeEnabled) {
            this.isRealTimeEnabled = false;
            clearInterval(this.updateInterval);
            button.innerHTML = '<i class="fas fa-pause"></i> Real-time: OFF';
            button.classList.remove('btn-outline-info');
            button.classList.add('btn-outline-secondary');
        } else {
            this.isRealTimeEnabled = true;
            this.setupRealTimeUpdates();
            button.innerHTML = '<i class="fas fa-play"></i> Real-time: ON';
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-outline-info');
        }
    }
    
    refreshAllCharts() {
        this.loadDashboardData();
        this.showRefreshFeedback();
    }
    
    showRefreshFeedback() {
        const button = document.getElementById('refreshCharts');
        const originalHtml = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.disabled = false;
        }, 1000);
    }
    
    exportAllCharts() {
        const exportModal = this.createExportModal();
        document.body.appendChild(exportModal);
        
        const modal = new bootstrap.Modal(exportModal);
        modal.show();
        
        exportModal.addEventListener('hidden.bs.modal', () => {
            exportModal.remove();
        });
    }
    
    createExportModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-light">Export Charts</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label text-light">Export Format:</label>
                            <select class="form-select" id="exportFormat">
                                <option value="png">PNG Image</option>
                                <option value="jpg">JPEG Image</option>
                                <option value="pdf">PDF Document</option>
                                <option value="csv">CSV Data</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-light">Charts to Export:</label>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" value="all" id="exportAll" checked>
                                <label class="form-check-label text-light" for="exportAll">All Charts</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="dashboardManager.performExport()">Export</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    performExport() {
        const format = document.getElementById('exportFormat').value;
        
        switch (format) {
            case 'png':
            case 'jpg':
                this.exportChartsAsImages(format);
                break;
            case 'pdf':
                this.exportChartsAsPDF();
                break;
            case 'csv':
                this.exportDataAsCSV();
                break;
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.querySelector('.modal'));
        modal.hide();
    }
    
    exportChartsAsImages(format) {
        this.charts.forEach((chart, key) => {
            const url = chart.toBase64Image(`image/${format}`, 1.0);
            const link = document.createElement('a');
            link.download = `${key}-chart.${format}`;
            link.href = url;
            link.click();
        });
    }
    
    showLoadingState() {
        const chartsContainer = document.getElementById('charts-container');
        if (chartsContainer) {
            chartsContainer.classList.add('loading');
        }
    }
    
    hideLoadingState() {
        const chartsContainer = document.getElementById('charts-container');
        if (chartsContainer) {
            chartsContainer.classList.remove('loading');
        }
    }
    
    showErrorState(message) {
        const errorHtml = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Error loading dashboard:</strong> ${message}
                <button class="btn btn-sm btn-outline-danger ms-3" onclick="dashboardManager.loadDashboardData()">
                    Retry
                </button>
            </div>
        `;
        
        const chartsContainer = document.getElementById('charts-container');
        if (chartsContainer) {
            chartsContainer.innerHTML = errorHtml;
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'r':
                        e.preventDefault();
                        this.refreshAllCharts();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportAllCharts();
                        break;
                    case 't':
                        e.preventDefault();
                        this.toggleRealTime();
                        break;
                }
            }
        });
    }
    
    setupExportFeatures() {
        // Add keyboard shortcuts info
        const shortcutsInfo = document.createElement('div');
        shortcutsInfo.className = 'keyboard-shortcuts text-muted small mt-3';
        shortcutsInfo.innerHTML = `
            <strong>Keyboard Shortcuts:</strong>
            Ctrl+R: Refresh | Ctrl+E: Export | Ctrl+T: Toggle Real-time
        `;
        
        const container = document.getElementById('charts-container');
        if (container) {
            container.appendChild(shortcutsInfo);
        }
    }
    
    drillDownByType(type) {
        // Navigate to detailed view for specific bike type
        window.location.href = `/bikes/?type=${encodeURIComponent(type)}`;
    }
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    }
    
    destroy() {
        // Clean up charts and intervals
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize dashboard manager
let dashboardManager;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('charts-container')) {
        dashboardManager = new DashboardManager();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (dashboardManager) {
        dashboardManager.destroy();
    }
});

// Export for global use
window.DashboardManager = DashboardManager;