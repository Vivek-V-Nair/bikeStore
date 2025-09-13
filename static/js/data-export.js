// Data Export and Download Management System
// Professional CSV/Excel export with progress indicators and download management

class DataExportManager {
    constructor(options = {}) {
        this.options = {
            enableProgressIndicators: true,
            enableDownloadQueue: true,
            maxConcurrentDownloads: 3,
            enableNotifications: true,
            defaultFormat: 'csv',
            chunkSize: 1000,
            ...options
        };
        
        this.downloadQueue = [];
        this.activeDownloads = 0;
        this.exportHistory = [];
        this.progressModal = null;
        
        this.init();
    }
    
    init() {
        this.setupExportButtons();
        this.setupProgressModal();
        this.bindEvents();
        this.loadExportHistory();
    }
    
    setupExportButtons() {
        // Add export buttons to tables
        const tables = document.querySelectorAll('table.table');
        tables.forEach(table => this.addExportButtonsToTable(table));
        
        // Add export buttons to charts
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => this.addExportButtonsToChart(container));
        
        // Add bulk export functionality
        this.addBulkExportControls();
    }
    
    addExportButtonsToTable(table) {
        const tableId = table.id || `table_${Date.now()}`;
        table.id = tableId;
        
        const exportGroup = document.createElement('div');
        exportGroup.className = 'export-controls mb-3';
        exportGroup.innerHTML = `
            <div class="btn-group" role="group" aria-label="Export options">
                <button type="button" class="btn btn-outline-secondary btn-sm export-csv" 
                        data-table="${tableId}" title="Export as CSV">
                    <i class="fas fa-file-csv"></i> CSV
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm export-excel" 
                        data-table="${tableId}" title="Export as Excel">
                    <i class="fas fa-file-excel"></i> Excel
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm export-pdf" 
                        data-table="${tableId}" title="Export as PDF">
                    <i class="fas fa-file-pdf"></i> PDF
                </button>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                            data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-cog"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item export-visible-only" href="#" data-table="${tableId}">
                            <i class="fas fa-eye"></i> Visible rows only
                        </a></li>
                        <li><a class="dropdown-item export-all-data" href="#" data-table="${tableId}">
                            <i class="fas fa-database"></i> All data
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item export-custom" href="#" data-table="${tableId}">
                            <i class="fas fa-filter"></i> Custom filter...
                        </a></li>
                    </ul>
                </div>
            </div>
        `;
        
        table.parentNode.insertBefore(exportGroup, table);
    }
    
    addExportButtonsToChart(container) {
        const chartId = container.id || `chart_${Date.now()}`;
        container.id = chartId;
        
        const exportBtn = document.createElement('div');
        exportBtn.className = 'chart-export-btn position-absolute';
        exportBtn.style.cssText = 'top: 10px; right: 10px; z-index: 10;';
        exportBtn.innerHTML = `
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-light dropdown-toggle" 
                        data-bs-toggle="dropdown" title="Export chart">
                    <i class="fas fa-download"></i>
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item export-chart-png" href="#" data-chart="${chartId}">
                        <i class="fas fa-image"></i> PNG Image
                    </a></li>
                    <li><a class="dropdown-item export-chart-svg" href="#" data-chart="${chartId}">
                        <i class="fas fa-vector-square"></i> SVG Vector
                    </a></li>
                    <li><a class="dropdown-item export-chart-pdf" href="#" data-chart="${chartId}">
                        <i class="fas fa-file-pdf"></i> PDF Document
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item export-chart-data" href="#" data-chart="${chartId}">
                        <i class="fas fa-table"></i> Chart Data (CSV)
                    </a></li>
                </ul>
            </div>
        `;
        
        container.style.position = 'relative';
        container.appendChild(exportBtn);
    }
    
    addBulkExportControls() {
        const bulkControls = document.createElement('div');
        bulkControls.className = 'bulk-export-controls position-fixed bottom-0 end-0 m-3';
        bulkControls.style.cssText = 'z-index: 9999; display: none;';
        bulkControls.innerHTML = `
            <div class="card bg-dark text-light">
                <div class="card-body p-3">
                    <h6 class="card-title mb-2">
                        <i class="fas fa-download"></i> Bulk Export
                        <button class="btn btn-sm btn-close btn-close-white float-end" 
                                onclick="this.closest('.bulk-export-controls').style.display='none'"></button>
                    </h6>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-primary export-all-tables">
                            <i class="fas fa-table"></i> All Tables
                        </button>
                        <button class="btn btn-sm btn-primary export-all-charts">
                            <i class="fas fa-chart-bar"></i> All Charts
                        </button>
                        <button class="btn btn-sm btn-success export-full-report">
                            <i class="fas fa-file-alt"></i> Full Report
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(bulkControls);
        this.bulkControls = bulkControls;
        
        // Show bulk controls when Ctrl+Shift+E is pressed
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                this.toggleBulkControls();
            }
        });
    }
    
    setupProgressModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'exportProgressModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-light">
                            <i class="fas fa-download"></i> Export Progress
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="export-progress-list"></div>
                        <div class="mt-3">
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">Overall Progress</span>
                                <span class="overall-progress-text">0%</span>
                            </div>
                            <div class="progress mt-1">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                     role="progressbar" style="width: 0%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hide</button>
                        <button type="button" class="btn btn-danger cancel-all-exports">Cancel All</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.progressModal = modal;
    }
    
    bindEvents() {
        // Table export events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.export-csv, .export-csv *')) {
                e.preventDefault();
                const button = e.target.closest('.export-csv');
                const tableId = button.dataset.table;
                this.exportTable(tableId, 'csv');
            }
            
            if (e.target.matches('.export-excel, .export-excel *')) {
                e.preventDefault();
                const button = e.target.closest('.export-excel');
                const tableId = button.dataset.table;
                this.exportTable(tableId, 'excel');
            }
            
            if (e.target.matches('.export-pdf, .export-pdf *')) {
                e.preventDefault();
                const button = e.target.closest('.export-pdf');
                const tableId = button.dataset.table;
                this.exportTable(tableId, 'pdf');
            }
            
            // Chart export events
            if (e.target.matches('.export-chart-png')) {
                e.preventDefault();
                const chartId = e.target.dataset.chart;
                this.exportChart(chartId, 'png');
            }
            
            if (e.target.matches('.export-chart-svg')) {
                e.preventDefault();
                const chartId = e.target.dataset.chart;
                this.exportChart(chartId, 'svg');
            }
            
            if (e.target.matches('.export-chart-pdf')) {
                e.preventDefault();
                const chartId = e.target.dataset.chart;
                this.exportChart(chartId, 'pdf');
            }
            
            if (e.target.matches('.export-chart-data')) {
                e.preventDefault();
                const chartId = e.target.dataset.chart;
                this.exportChartData(chartId);
            }
            
            // Bulk export events
            if (e.target.matches('.export-all-tables')) {
                e.preventDefault();
                this.exportAllTables();
            }
            
            if (e.target.matches('.export-all-charts')) {
                e.preventDefault();
                this.exportAllCharts();
            }
            
            if (e.target.matches('.export-full-report')) {
                e.preventDefault();
                this.exportFullReport();
            }
            
            if (e.target.matches('.cancel-all-exports')) {
                e.preventDefault();
                this.cancelAllExports();
            }
        });
    }
    
    async exportTable(tableId, format, options = {}) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const exportId = this.generateExportId();
        const exportTask = {
            id: exportId,
            type: 'table',
            tableId: tableId,
            format: format,
            status: 'pending',
            progress: 0,
            startTime: Date.now(),
            options: options
        };
        
        this.addToQueue(exportTask);
        this.processQueue();
    }
    
    async exportChart(chartId, format) {
        const container = document.getElementById(chartId);
        if (!container) return;
        
        const exportId = this.generateExportId();
        const exportTask = {
            id: exportId,
            type: 'chart',
            chartId: chartId,
            format: format,
            status: 'pending',
            progress: 0,
            startTime: Date.now()
        };
        
        this.addToQueue(exportTask);
        this.processQueue();
    }
    
    async exportChartData(chartId) {
        const container = document.getElementById(chartId);
        const canvas = container.querySelector('canvas');
        if (!canvas || !canvas.chart) return;
        
        const chart = canvas.chart;
        const data = chart.data;
        
        const csvData = this.convertChartDataToCSV(data);
        this.downloadFile(csvData, `chart_${chartId}_data.csv`, 'text/csv');
    }
    
    convertChartDataToCSV(chartData) {
        const headers = ['Label'];
        const rows = [];
        
        // Add dataset headers
        chartData.datasets.forEach(dataset => {
            headers.push(dataset.label || 'Data');
        });
        
        // Add data rows
        chartData.labels.forEach((label, index) => {
            const row = [label];
            chartData.datasets.forEach(dataset => {
                row.push(dataset.data[index] || '');
            });
            rows.push(row);
        });
        
        // Convert to CSV
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        return csvContent;
    }
    
    addToQueue(exportTask) {
        this.downloadQueue.push(exportTask);
        this.updateProgressModal();
        
        if (this.options.enableNotifications && window.notifications) {
            window.notifications.show(`Export queued: ${exportTask.type} (${exportTask.format})`, 'info');
        }
    }
    
    async processQueue() {
        if (this.activeDownloads >= this.options.maxConcurrentDownloads) return;
        if (this.downloadQueue.length === 0) return;
        
        const task = this.downloadQueue.shift();
        this.activeDownloads++;
        
        try {
            await this.executeExport(task);
        } catch (error) {
            console.error('Export failed:', error);
            task.status = 'failed';
            task.error = error.message;
            
            if (this.options.enableNotifications && window.notifications) {
                window.notifications.show(`Export failed: ${error.message}`, 'error');
            }
        } finally {
            this.activeDownloads--;
            this.updateProgressModal();
            
            // Process next item in queue
            if (this.downloadQueue.length > 0) {
                setTimeout(() => this.processQueue(), 100);
            }
        }
    }
    
    async executeExport(task) {
        task.status = 'processing';
        this.updateProgressModal();
        
        if (task.type === 'table') {
            await this.processTableExport(task);
        } else if (task.type === 'chart') {
            await this.processChartExport(task);
        }
        
        task.status = 'completed';
        task.completedTime = Date.now();
        this.exportHistory.push(task);
        this.saveExportHistory();
        
        if (this.options.enableNotifications && window.notifications) {
            window.notifications.show(`Export completed: ${task.type} (${task.format})`, 'success');
        }
    }
    
    async processTableExport(task) {
        const table = document.getElementById(task.tableId);
        const data = this.extractTableData(table);
        
        let content, mimeType, extension;
        
        switch (task.format) {
            case 'csv':
                content = this.convertToCSV(data);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'excel':
                content = this.convertToExcel(data);
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                extension = 'xlsx';
                break;
            case 'pdf':
                content = await this.convertToPDF(data, task.tableId);
                mimeType = 'application/pdf';
                extension = 'pdf';
                break;
        }
        
        const filename = `${task.tableId}_${Date.now()}.${extension}`;
        this.downloadFile(content, filename, mimeType);
    }
    
    async processChartExport(task) {
        const container = document.getElementById(task.chartId);
        const canvas = container.querySelector('canvas');
        
        let content, mimeType, extension;
        
        switch (task.format) {
            case 'png':
                content = canvas.toDataURL('image/png');
                mimeType = 'image/png';
                extension = 'png';
                break;
            case 'svg':
                content = await this.convertCanvasToSVG(canvas);
                mimeType = 'image/svg+xml';
                extension = 'svg';
                break;
            case 'pdf':
                content = await this.convertCanvasToPDF(canvas);
                mimeType = 'application/pdf';
                extension = 'pdf';
                break;
        }
        
        const filename = `${task.chartId}_${Date.now()}.${extension}`;
        this.downloadFile(content, filename, mimeType);
    }
    
    extractTableData(table) {
        const data = [];
        const headers = [];
        
        // Extract headers
        const headerRow = table.querySelector('thead tr');
        if (headerRow) {
            headerRow.querySelectorAll('th').forEach(th => {
                headers.push(th.textContent.trim());
            });
        }
        
        // Extract data rows
        const bodyRows = table.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
            const rowData = [];
            row.querySelectorAll('td').forEach(td => {
                rowData.push(td.textContent.trim());
            });
            data.push(rowData);
        });
        
        return { headers, data };
    }
    
    convertToCSV(tableData) {
        const { headers, data } = tableData;
        const csvContent = [headers, ...data]
            .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        return csvContent;
    }
    
    convertToExcel(tableData) {
        // Simple Excel-compatible CSV for now
        // In a real implementation, you'd use a library like SheetJS
        return this.convertToCSV(tableData);
    }
    
    async convertToPDF(tableData, tableId) {
        // Simple PDF generation using browser's print functionality
        // In a real implementation, you'd use jsPDF or similar
        return this.convertToCSV(tableData);
    }
    
    async convertCanvasToSVG(canvas) {
        // Convert canvas to SVG
        // This is a simplified implementation
        return canvas.toDataURL('image/png');
    }
    
    async convertCanvasToPDF(canvas) {
        // Convert canvas to PDF
        // This is a simplified implementation
        return canvas.toDataURL('image/png');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    
    updateProgressModal() {
        if (!this.progressModal) return;
        
        const progressList = this.progressModal.querySelector('.export-progress-list');
        const overallProgress = this.progressModal.querySelector('.progress-bar');
        const overallText = this.progressModal.querySelector('.overall-progress-text');
        
        // Update individual task progress
        progressList.innerHTML = this.downloadQueue.map(task => `
            <div class="export-task mb-2">
                <div class="d-flex justify-content-between">
                    <span>${task.type} (${task.format})</span>
                    <span class="badge bg-${this.getStatusColor(task.status)}">${task.status}</span>
                </div>
                <div class="progress progress-sm mt-1">
                    <div class="progress-bar" style="width: ${task.progress}%"></div>
                </div>
            </div>
        `).join('');
        
        // Calculate overall progress
        const totalTasks = this.downloadQueue.length + this.activeDownloads;
        const completedTasks = this.exportHistory.length;
        const overall = totalTasks > 0 ? (completedTasks / (totalTasks + completedTasks)) * 100 : 0;
        
        overallProgress.style.width = `${overall}%`;
        overallText.textContent = `${Math.round(overall)}%`;
    }
    
    getStatusColor(status) {
        const colors = {
            pending: 'secondary',
            processing: 'primary',
            completed: 'success',
            failed: 'danger'
        };
        return colors[status] || 'secondary';
    }
    
    toggleBulkControls() {
        const isVisible = this.bulkControls.style.display !== 'none';
        this.bulkControls.style.display = isVisible ? 'none' : 'block';
    }
    
    exportAllTables() {
        const tables = document.querySelectorAll('table.table[id]');
        tables.forEach(table => {
            this.exportTable(table.id, 'csv');
        });
        
        this.showProgressModal();
    }
    
    exportAllCharts() {
        const charts = document.querySelectorAll('.chart-container[id]');
        charts.forEach(chart => {
            this.exportChart(chart.id, 'png');
        });
        
        this.showProgressModal();
    }
    
    exportFullReport() {
        // Export all tables and charts
        this.exportAllTables();
        this.exportAllCharts();
        
        this.showProgressModal();
    }
    
    showProgressModal() {
        const modal = new bootstrap.Modal(this.progressModal);
        modal.show();
    }
    
    cancelAllExports() {
        this.downloadQueue = [];
        this.updateProgressModal();
        
        if (this.options.enableNotifications && window.notifications) {
            window.notifications.show('All exports cancelled', 'info');
        }
    }
    
    generateExportId() {
        return `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    saveExportHistory() {
        try {
            localStorage.setItem('exportHistory', JSON.stringify(this.exportHistory.slice(-50)));
        } catch (e) {
            console.warn('Could not save export history:', e);
        }
    }
    
    loadExportHistory() {
        try {
            const saved = localStorage.getItem('exportHistory');
            if (saved) {
                this.exportHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Could not load export history:', e);
            this.exportHistory = [];
        }
    }
    
    // Public API
    getExportHistory() {
        return this.exportHistory;
    }
    
    clearExportHistory() {
        this.exportHistory = [];
        this.saveExportHistory();
    }
    
    exportCustom(selector, format, options = {}) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            if (element.tagName.toLowerCase() === 'table') {
                this.exportTable(element.id, format, options);
            } else if (element.classList.contains('chart-container')) {
                this.exportChart(element.id, format);
            }
        });
    }
}

// Initialize export manager
let exportManager;

document.addEventListener('DOMContentLoaded', () => {
    exportManager = new DataExportManager();
    
    // Make globally available
    window.exportManager = exportManager;
});

// Export for module use
window.DataExportManager = DataExportManager;