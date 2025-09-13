// Interactive Data Table with Advanced Features
// Sorting, filtering, inline editing, row selection, and advanced interactions

class InteractiveDataTable {
    constructor(tableSelector, options = {}) {
        this.table = document.querySelector(tableSelector);
        if (!this.table) {
            console.warn(`Table not found: ${tableSelector}`);
            return;
        }
        
        this.options = {
            enableSorting: true,
            enableFiltering: true,
            enableInlineEditing: true,
            enableRowSelection: true,
            enablePagination: true,
            enableExport: true,
            enableColumnResize: true,
            enableRowDrag: true,
            pageSize: 10,
            searchDelay: 300,
            animationDuration: 300,
            ...options
        };
        
        this.currentSort = { column: null, direction: 'asc' };
        this.filters = {};
        this.selectedRows = new Set();
        this.currentPage = 1;
        this.originalData = [];
        this.filteredData = [];
        this.editingCell = null;
        
        this.init();
    }
    
    init() {
        this.setupTableStructure();
        this.cacheOriginalData();
        this.setupSorting();
        this.setupFiltering();
        this.setupInlineEditing();
        this.setupRowSelection();
        this.setupPagination();
        this.setupColumnResize();
        this.setupRowDrag();
        this.setupKeyboardNavigation();
        this.setupContextMenu();
        this.bindEvents();
        this.applyInitialStyles();
    }
    
    setupTableStructure() {
        // Wrap table in container
        const wrapper = document.createElement('div');
        wrapper.className = 'interactive-table-wrapper';
        wrapper.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border-radius: 16px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            border: 1px solid rgba(255, 255, 255, 0.18);
        `;
        
        this.table.parentNode.insertBefore(wrapper, this.table);
        wrapper.appendChild(this.table);
        
        // Add table controls
        this.addTableControls(wrapper);
        
        // Enhance table classes
        this.table.classList.add('interactive-table', 'table-hover');
        
        // Add loading overlay
        this.addLoadingOverlay(wrapper);
    }
    
    addTableControls(wrapper) {
        const controls = document.createElement('div');
        controls.className = 'table-controls d-flex justify-content-between align-items-center mb-3';
        controls.innerHTML = `
            <div class="table-controls-left d-flex align-items-center gap-3">
                <div class="search-container position-relative">
                    <input type="text" class="form-control table-search" placeholder="Search table..." 
                           style="padding-left: 2.5rem; min-width: 250px;">
                    <i class="fas fa-search position-absolute" 
                       style="left: 0.75rem; top: 50%; transform: translateY(-50%); color: #888;"></i>
                </div>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-light btn-sm filter-toggle" title="Toggle Filters">
                        <i class="fas fa-filter"></i>
                    </button>
                    <button class="btn btn-outline-light btn-sm column-toggle" title="Toggle Columns">
                        <i class="fas fa-columns"></i>
                    </button>
                    <button class="btn btn-outline-light btn-sm refresh-table" title="Refresh Data">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
            <div class="table-controls-right d-flex align-items-center gap-2">
                <div class="table-info text-muted">
                    <span class="row-count">0</span> rows
                </div>
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-success btn-sm export-csv" title="Export CSV">
                        <i class="fas fa-file-csv"></i>
                    </button>
                    <button class="btn btn-outline-primary btn-sm export-excel" title="Export Excel">
                        <i class="fas fa-file-excel"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm export-pdf" title="Export PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                </div>
            </div>
        `;
        
        wrapper.insertBefore(controls, this.table);
        this.controls = controls;
        
        // Add filter panel
        this.addFilterPanel(wrapper);
        
        // Add column toggle panel
        this.addColumnTogglePanel(wrapper);
    }
    
    addFilterPanel(wrapper) {
        const filterPanel = document.createElement('div');
        filterPanel.className = 'filter-panel mb-3';
        filterPanel.style.display = 'none';
        
        const headers = this.table.querySelectorAll('thead th');
        const filterInputs = Array.from(headers).map((header, index) => {
            const columnName = header.textContent.trim();
            return `
                <div class="col-md-3 mb-2">
                    <label class="form-label">${columnName}</label>
                    <input type="text" class="form-control form-control-sm column-filter" 
                           data-column="${index}" placeholder="Filter ${columnName}...">
                </div>
            `;
        }).join('');
        
        filterPanel.innerHTML = `
            <div class="card bg-dark">
                <div class="card-body">
                    <h6 class="card-title mb-3">
                        <i class="fas fa-filter me-2"></i>Column Filters
                    </h6>
                    <div class="row">
                        ${filterInputs}
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-primary btn-sm apply-filters">Apply Filters</button>
                        <button class="btn btn-secondary btn-sm clear-filters">Clear All</button>
                    </div>
                </div>
            </div>
        `;
        
        wrapper.insertBefore(filterPanel, this.table);
        this.filterPanel = filterPanel;
    }
    
    addColumnTogglePanel(wrapper) {
        const columnPanel = document.createElement('div');
        columnPanel.className = 'column-panel mb-3';
        columnPanel.style.display = 'none';
        
        const headers = this.table.querySelectorAll('thead th');
        const columnToggles = Array.from(headers).map((header, index) => {
            const columnName = header.textContent.trim();
            return `
                <div class="form-check form-check-inline">
                    <input class="form-check-input column-toggle-checkbox" type="checkbox" 
                           id="col-${index}" data-column="${index}" checked>
                    <label class="form-check-label" for="col-${index}">${columnName}</label>
                </div>
            `;
        }).join('');
        
        columnPanel.innerHTML = `
            <div class="card bg-dark">
                <div class="card-body">
                    <h6 class="card-title mb-3">
                        <i class="fas fa-columns me-2"></i>Toggle Columns
                    </h6>
                    ${columnToggles}
                </div>
            </div>
        `;
        
        wrapper.insertBefore(columnPanel, this.table);
        this.columnPanel = columnPanel;
    }
    
    addLoadingOverlay(wrapper) {
        const overlay = document.createElement('div');
        overlay.className = 'table-loading-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 16px;
        `;
        
        overlay.innerHTML = `
            <div class="text-center text-white">
                <div class="spinner-border mb-3" role="status"></div>
                <div>Loading data...</div>
            </div>
        `;
        
        wrapper.style.position = 'relative';
        wrapper.appendChild(overlay);
        this.loadingOverlay = overlay;
    }
    
    cacheOriginalData() {
        const rows = this.table.querySelectorAll('tbody tr');
        this.originalData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                element: row,
                data: Array.from(cells).map(cell => cell.textContent.trim()),
                originalIndex: Array.from(rows).indexOf(row)
            };
        });
        this.filteredData = [...this.originalData];
        this.updateRowCount();
    }
    
    setupSorting() {
        if (!this.options.enableSorting) return;
        
        const headers = this.table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            header.style.position = 'relative';
            header.classList.add('sortable-header');
            
            // Add sort icon
            const sortIcon = document.createElement('i');
            sortIcon.className = 'fas fa-sort sort-icon';
            sortIcon.style.cssText = `
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                opacity: 0.5;
                transition: all 0.3s ease;
            `;
            header.appendChild(sortIcon);
            
            header.addEventListener('click', () => {
                this.sortByColumn(index);
            });
            
            header.addEventListener('mouseenter', () => {
                sortIcon.style.opacity = '1';
            });
            
            header.addEventListener('mouseleave', () => {
                if (this.currentSort.column !== index) {
                    sortIcon.style.opacity = '0.5';
                }
            });
        });
    }
    
    sortByColumn(columnIndex) {
        const direction = (this.currentSort.column === columnIndex && this.currentSort.direction === 'asc') 
            ? 'desc' : 'asc';
        
        this.currentSort = { column: columnIndex, direction };
        
        // Update sort icons
        const headers = this.table.querySelectorAll('thead th');
        headers.forEach((header, index) => {
            const icon = header.querySelector('.sort-icon');
            if (index === columnIndex) {
                icon.className = `fas fa-sort-${direction === 'asc' ? 'up' : 'down'} sort-icon`;
                icon.style.opacity = '1';
                header.classList.add('sorted');
            } else {
                icon.className = 'fas fa-sort sort-icon';
                icon.style.opacity = '0.5';
                header.classList.remove('sorted');
            }
        });
        
        // Sort data
        this.filteredData.sort((a, b) => {
            const aVal = a.data[columnIndex];
            const bVal = b.data[columnIndex];
            
            // Try to parse as numbers
            const aNum = parseFloat(aVal.replace(/[^\d.-]/g, ''));
            const bNum = parseFloat(bVal.replace(/[^\d.-]/g, ''));
            
            let comparison;
            if (!isNaN(aNum) && !isNaN(bNum)) {
                comparison = aNum - bNum;
            } else {
                comparison = aVal.localeCompare(bVal);
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
        
        this.renderTable();
        this.animateSort();
    }
    
    animateSort() {
        const rows = this.table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.animation = 'none';
            setTimeout(() => {
                row.style.animation = `fadeInUp 0.3s ease ${index * 0.05}s both`;
            }, 10);
        });
    }
    
    setupFiltering() {
        if (!this.options.enableFiltering) return;
        
        const searchInput = this.controls.querySelector('.table-search');
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.applyGlobalFilter(e.target.value);
            }, this.options.searchDelay);
        });
        
        // Column filters
        const columnFilters = this.filterPanel.querySelectorAll('.column-filter');
        columnFilters.forEach(filter => {
            filter.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyColumnFilter(e.target.dataset.column, e.target.value);
                }, this.options.searchDelay);
            });
        });
        
        // Filter controls
        this.controls.querySelector('.filter-toggle').addEventListener('click', () => {
            this.toggleFilterPanel();
        });
        
        this.filterPanel.querySelector('.apply-filters').addEventListener('click', () => {
            this.applyAllFilters();
        });
        
        this.filterPanel.querySelector('.clear-filters').addEventListener('click', () => {
            this.clearAllFilters();
        });
    }
    
    applyGlobalFilter(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredData = [...this.originalData];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredData = this.originalData.filter(row => {
                return row.data.some(cell => 
                    cell.toLowerCase().includes(term)
                );
            });
        }
        
        this.renderTable();
        this.updateRowCount();
        this.animateFilter();
    }
    
    applyColumnFilter(columnIndex, filterValue) {
        this.filters[columnIndex] = filterValue.toLowerCase();
        this.applyAllFilters();
    }
    
    applyAllFilters() {
        let filtered = [...this.originalData];
        
        // Apply global search
        const globalSearch = this.controls.querySelector('.table-search').value.toLowerCase();
        if (globalSearch) {
            filtered = filtered.filter(row => {
                return row.data.some(cell => 
                    cell.toLowerCase().includes(globalSearch)
                );
            });
        }
        
        // Apply column filters
        Object.entries(this.filters).forEach(([columnIndex, filterValue]) => {
            if (filterValue.trim()) {
                filtered = filtered.filter(row => {
                    return row.data[columnIndex].toLowerCase().includes(filterValue);
                });
            }
        });
        
        this.filteredData = filtered;
        this.renderTable();
        this.updateRowCount();
        this.animateFilter();
    }
    
    clearAllFilters() {
        this.filters = {};
        this.controls.querySelector('.table-search').value = '';
        this.filterPanel.querySelectorAll('.column-filter').forEach(input => {
            input.value = '';
        });
        this.filteredData = [...this.originalData];
        this.renderTable();
        this.updateRowCount();
    }
    
    animateFilter() {
        const rows = this.table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            row.style.animation = 'none';
            setTimeout(() => {
                row.style.animation = `slideInFromLeft 0.3s ease ${index * 0.03}s both`;
            }, 10);
        });
    }
    
    toggleFilterPanel() {
        const isVisible = this.filterPanel.style.display !== 'none';
        this.filterPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.filterPanel.style.animation = 'slideDown 0.3s ease';
        }
    }
    
    setupInlineEditing() {
        if (!this.options.enableInlineEditing) return;
        
        this.table.addEventListener('dblclick', (e) => {
            const cell = e.target.closest('td');
            if (cell && !cell.classList.contains('non-editable')) {
                this.startInlineEdit(cell);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editingCell) {
                this.cancelInlineEdit();
            }
            if (e.key === 'Enter' && this.editingCell) {
                this.saveInlineEdit();
            }
        });
    }
    
    startInlineEdit(cell) {
        if (this.editingCell) {
            this.saveInlineEdit();
        }
        
        this.editingCell = cell;
        const originalValue = cell.textContent;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalValue;
        input.className = 'form-control form-control-sm inline-edit-input';
        input.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid #00d4ff;
            color: white;
            width: 100%;
        `;
        
        cell.innerHTML = '';
        cell.appendChild(input);
        input.focus();
        input.select();
        
        input.addEventListener('blur', () => {
            this.saveInlineEdit();
        });
        
        cell.classList.add('editing');
    }
    
    saveInlineEdit() {
        if (!this.editingCell) return;
        
        const input = this.editingCell.querySelector('.inline-edit-input');
        const newValue = input ? input.value : '';
        
        this.editingCell.textContent = newValue;
        this.editingCell.classList.remove('editing');
        
        // Update cached data
        const row = this.editingCell.closest('tr');
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        const cellIndex = Array.from(row.children).indexOf(this.editingCell);
        
        const dataRow = this.filteredData[rowIndex];
        if (dataRow) {
            dataRow.data[cellIndex] = newValue;
        }
        
        // Show save animation
        this.editingCell.style.animation = 'cellSave 0.5s ease';
        
        this.editingCell = null;
        
        // Trigger save event
        this.table.dispatchEvent(new CustomEvent('cellEdited', {
            detail: { row: rowIndex, cell: cellIndex, value: newValue }
        }));
    }
    
    cancelInlineEdit() {
        if (!this.editingCell) return;
        
        const originalValue = this.editingCell.dataset.originalValue || '';
        this.editingCell.textContent = originalValue;
        this.editingCell.classList.remove('editing');
        this.editingCell = null;
    }
    
    setupRowSelection() {
        if (!this.options.enableRowSelection) return;
        
        // Add select all checkbox
        const headerRow = this.table.querySelector('thead tr');
        const selectAllTh = document.createElement('th');
        selectAllTh.innerHTML = `
            <div class="form-check">
                <input class="form-check-input select-all-checkbox" type="checkbox">
            </div>
        `;
        headerRow.insertBefore(selectAllTh, headerRow.firstChild);
        
        // Add row checkboxes
        const bodyRows = this.table.querySelectorAll('tbody tr');
        bodyRows.forEach(row => {
            const selectTd = document.createElement('td');
            selectTd.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input row-checkbox" type="checkbox">
                </div>
            `;
            row.insertBefore(selectTd, row.firstChild);
        });
        
        // Bind events
        const selectAllCheckbox = this.table.querySelector('.select-all-checkbox');
        selectAllCheckbox.addEventListener('change', (e) => {
            this.selectAllRows(e.target.checked);
        });
        
        this.table.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                this.toggleRowSelection(e.target.closest('tr'), e.target.checked);
            }
        });
        
        // Add bulk actions
        this.addBulkActions();
    }
    
    selectAllRows(selected) {
        const checkboxes = this.table.querySelectorAll('.row-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = selected;
            this.toggleRowSelection(checkbox.closest('tr'), selected);
        });
    }
    
    toggleRowSelection(row, selected) {
        if (selected) {
            row.classList.add('row-selected');
            this.selectedRows.add(row);
        } else {
            row.classList.remove('row-selected');
            this.selectedRows.delete(row);
        }
        
        this.updateBulkActions();
    }
    
    addBulkActions() {
        const bulkActions = document.createElement('div');
        bulkActions.className = 'bulk-actions mt-2';
        bulkActions.style.display = 'none';
        bulkActions.innerHTML = `
            <div class="alert alert-info d-flex justify-content-between align-items-center">
                <span class="selected-count">0 rows selected</span>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary bulk-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger bulk-delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    <button class="btn btn-sm btn-outline-success bulk-export">
                        <i class="fas fa-download"></i> Export
                    </button>
                </div>
            </div>
        `;
        
        this.table.parentNode.appendChild(bulkActions);
        this.bulkActions = bulkActions;
        
        // Bind bulk action events
        bulkActions.querySelector('.bulk-delete').addEventListener('click', () => {
            this.bulkDeleteRows();
        });
        
        bulkActions.querySelector('.bulk-export').addEventListener('click', () => {
            this.bulkExportRows();
        });
    }
    
    updateBulkActions() {
        const selectedCount = this.selectedRows.size;
        
        if (selectedCount > 0) {
            this.bulkActions.style.display = 'block';
            this.bulkActions.querySelector('.selected-count').textContent = 
                `${selectedCount} row${selectedCount > 1 ? 's' : ''} selected`;
        } else {
            this.bulkActions.style.display = 'none';
        }
    }
    
    bulkDeleteRows() {
        if (this.selectedRows.size === 0) return;
        
        if (window.notifications) {
            window.notifications.confirm(
                `Delete ${this.selectedRows.size} selected row(s)?`,
                'This action cannot be undone.'
            ).then(confirmed => {
                if (confirmed) {
                    this.selectedRows.forEach(row => {
                        row.style.animation = 'fadeOutRight 0.3s ease';
                        setTimeout(() => {
                            if (row.parentNode) {
                                row.parentNode.removeChild(row);
                            }
                        }, 300);
                    });
                    
                    this.selectedRows.clear();
                    this.updateBulkActions();
                    this.cacheOriginalData();
                }
            });
        }
    }
    
    bulkExportRows() {
        if (this.selectedRows.size === 0) return;
        
        const selectedData = Array.from(this.selectedRows).map(row => {
            const cells = row.querySelectorAll('td');
            return Array.from(cells).slice(1).map(cell => cell.textContent.trim()); // Skip checkbox column
        });
        
        if (window.exportManager) {
            window.exportManager.exportCustomData(selectedData, 'selected_rows.csv');
        }
    }
    
    renderTable() {
        const tbody = this.table.querySelector('tbody');
        
        // Clear current rows
        tbody.innerHTML = '';
        
        // Render filtered data
        this.filteredData.forEach(rowData => {
            tbody.appendChild(rowData.element);
        });
        
        this.updateRowCount();
    }
    
    updateRowCount() {
        const countElement = this.controls.querySelector('.row-count');
        if (countElement) {
            countElement.textContent = this.filteredData.length;
        }
    }
    
    applyInitialStyles() {
        // Add CSS for interactive table
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            .interactive-table-wrapper {
                margin-bottom: 2rem;
            }
            
            .interactive-table th.sortable-header:hover {
                background: rgba(255, 255, 255, 0.1) !important;
            }
            
            .interactive-table th.sorted {
                background: rgba(102, 126, 234, 0.2) !important;
            }
            
            .interactive-table tr.row-selected {
                background: rgba(0, 212, 255, 0.1) !important;
                border-left: 3px solid #00d4ff;
            }
            
            .interactive-table td.editing {
                background: rgba(0, 212, 255, 0.2) !important;
                box-shadow: inset 0 0 0 2px #00d4ff;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInFromLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes cellSave {
                0%, 100% { background: transparent; }
                50% { background: rgba(74, 172, 254, 0.3); }
            }
            
            @keyframes fadeOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
            
            .table-controls {
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            @media (max-width: 768px) {
                .table-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                
                .table-controls-left,
                .table-controls-right {
                    justify-content: center;
                }
                
                .search-container {
                    width: 100%;
                }
                
                .search-container input {
                    min-width: auto;
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(styleSheet);
    }
    
    bindEvents() {
        // Refresh button
        this.controls.querySelector('.refresh-table').addEventListener('click', () => {
            this.refreshData();
        });
        
        // Column toggle
        this.controls.querySelector('.column-toggle').addEventListener('click', () => {
            this.toggleColumnPanel();
        });
        
        // Export buttons
        this.controls.querySelector('.export-csv').addEventListener('click', () => {
            this.exportData('csv');
        });
        
        this.controls.querySelector('.export-excel').addEventListener('click', () => {
            this.exportData('excel');
        });
        
        this.controls.querySelector('.export-pdf').addEventListener('click', () => {
            this.exportData('pdf');
        });
        
        // Column visibility toggles
        this.columnPanel.addEventListener('change', (e) => {
            if (e.target.classList.contains('column-toggle-checkbox')) {
                this.toggleColumn(e.target.dataset.column, e.target.checked);
            }
        });
    }
    
    refreshData() {
        this.showLoading();
        
        // Simulate data refresh
        setTimeout(() => {
            this.cacheOriginalData();
            this.applyAllFilters();
            this.hideLoading();
            
            if (window.notifications) {
                window.notifications.show('Table data refreshed', 'success', { duration: 2000 });
            }
        }, 1000);
    }
    
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }
    
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }
    
    toggleColumnPanel() {
        const isVisible = this.columnPanel.style.display !== 'none';
        this.columnPanel.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            this.columnPanel.style.animation = 'slideDown 0.3s ease';
        }
    }
    
    toggleColumn(columnIndex, visible) {
        const column = parseInt(columnIndex);
        
        // Toggle header
        const headers = this.table.querySelectorAll('thead th');
        if (headers[column + 1]) { // +1 for checkbox column
            headers[column + 1].style.display = visible ? '' : 'none';
        }
        
        // Toggle cells
        const rows = this.table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells[column + 1]) { // +1 for checkbox column
                cells[column + 1].style.display = visible ? '' : 'none';
            }
        });
    }
    
    exportData(format) {
        if (window.exportManager) {
            window.exportManager.exportTable(this.table.id || 'interactive-table', format);
        }
    }
    
    // Public API
    getSelectedRows() {
        return Array.from(this.selectedRows);
    }
    
    clearSelection() {
        this.selectAllRows(false);
    }
    
    getFilteredData() {
        return this.filteredData;
    }
    
    destroy() {
        // Cleanup event listeners and restore original table
        this.table.parentNode.outerHTML = this.table.outerHTML;
    }
}

// Auto-initialize interactive tables
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all tables with the interactive-table class
    const tables = document.querySelectorAll('table.table:not(.no-interactive)');
    
    tables.forEach((table, index) => {
        if (!table.id) {
            table.id = `interactive-table-${index}`;
        }
        
        new InteractiveDataTable(`#${table.id}`, {
            enableSorting: true,
            enableFiltering: true,
            enableInlineEditing: true,
            enableRowSelection: true,
            pageSize: 15
        });
    });
    
    console.log('📊 Interactive Data Tables Initialized:');
    console.log('✅ Sorting with visual indicators');
    console.log('✅ Global and column filtering');
    console.log('✅ Inline editing with double-click');
    console.log('✅ Row selection and bulk actions');
    console.log('✅ Column visibility toggles');
    console.log('✅ Data export functionality');
    console.log('✅ Responsive design');
});

// Export for module use
window.InteractiveDataTable = InteractiveDataTable;