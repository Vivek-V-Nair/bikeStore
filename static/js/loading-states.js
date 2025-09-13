// Loading States and Skeleton Screens System
// Professional loading animations, skeleton screens, and progress indicators

class LoadingStateManager {
    constructor(options = {}) {
        this.options = {
            enableSkeletonScreens: true,
            enableProgressIndicators: true,
            enableLoadingOverlays: true,
            skeletonAnimationDuration: 1500,
            loadingTimeout: 30000,
            enableSmartPreloading: true,
            ...options
        };
        
        this.activeLoaders = new Map();
        this.skeletonTemplates = new Map();
        this.loadingTimers = new Map();
        
        this.init();
    }
    
    init() {
        this.setupSkeletonTemplates();
        this.setupGlobalLoadingOverlay();
        this.setupLoadingStyles();
        this.setupProgressIndicators();
        this.interceptAjaxRequests();
        this.bindEvents();
    }
    
    setupSkeletonTemplates() {
        // Table skeleton template
        this.skeletonTemplates.set('table', `
            <div class="skeleton-table">
                <div class="skeleton-header d-flex mb-3">
                    <div class="skeleton-line skeleton-line-title flex-grow-1"></div>
                    <div class="skeleton-button ms-3"></div>
                </div>
                <div class="skeleton-table-container">
                    <div class="skeleton-table-header d-flex mb-2">
                        <div class="skeleton-line skeleton-line-sm flex-fill me-2"></div>
                        <div class="skeleton-line skeleton-line-sm flex-fill me-2"></div>
                        <div class="skeleton-line skeleton-line-sm flex-fill me-2"></div>
                        <div class="skeleton-line skeleton-line-sm flex-fill"></div>
                    </div>
                    <div class="skeleton-table-rows">
                        ${Array(5).fill().map(() => `
                            <div class="skeleton-table-row d-flex mb-1">
                                <div class="skeleton-line skeleton-line-xs flex-fill me-2"></div>
                                <div class="skeleton-line skeleton-line-xs flex-fill me-2"></div>
                                <div class="skeleton-line skeleton-line-xs flex-fill me-2"></div>
                                <div class="skeleton-line skeleton-line-xs flex-fill"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `);
        
        // Card skeleton template
        this.skeletonTemplates.set('card', `
            <div class="skeleton-card">
                <div class="skeleton-card-header mb-3">
                    <div class="skeleton-line skeleton-line-title mb-2"></div>
                    <div class="skeleton-line skeleton-line-subtitle w-75"></div>
                </div>
                <div class="skeleton-card-body">
                    <div class="skeleton-line skeleton-line-text mb-2"></div>
                    <div class="skeleton-line skeleton-line-text mb-2 w-90"></div>
                    <div class="skeleton-line skeleton-line-text mb-3 w-80"></div>
                    <div class="skeleton-button-group d-flex gap-2">
                        <div class="skeleton-button"></div>
                        <div class="skeleton-button skeleton-button-outline"></div>
                    </div>
                </div>
            </div>
        `);
        
        // Chart skeleton template
        this.skeletonTemplates.set('chart', `
            <div class="skeleton-chart">
                <div class="skeleton-chart-header d-flex justify-content-between mb-3">
                    <div class="skeleton-line skeleton-line-title"></div>
                    <div class="skeleton-button skeleton-button-sm"></div>
                </div>
                <div class="skeleton-chart-container">
                    <div class="skeleton-chart-placeholder">
                        <div class="skeleton-chart-bars d-flex align-items-end justify-content-around h-100">
                            ${Array(6).fill().map((_, i) => `
                                <div class="skeleton-chart-bar" style="height: ${30 + Math.random() * 70}%"></div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="skeleton-chart-legend d-flex justify-content-center mt-3">
                        ${Array(3).fill().map(() => `
                            <div class="skeleton-legend-item d-flex align-items-center me-3">
                                <div class="skeleton-legend-color me-2"></div>
                                <div class="skeleton-line skeleton-line-xs"></div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `);
        
        // Form skeleton template
        this.skeletonTemplates.set('form', `
            <div class="skeleton-form">
                <div class="skeleton-form-header mb-4">
                    <div class="skeleton-line skeleton-line-title mb-2"></div>
                    <div class="skeleton-line skeleton-line-subtitle w-75"></div>
                </div>
                <div class="skeleton-form-body">
                    ${Array(4).fill().map(() => `
                        <div class="skeleton-form-group mb-3">
                            <div class="skeleton-line skeleton-line-label mb-2 w-25"></div>
                            <div class="skeleton-input"></div>
                        </div>
                    `).join('')}
                    <div class="skeleton-form-actions d-flex gap-2 mt-4">
                        <div class="skeleton-button skeleton-button-primary"></div>
                        <div class="skeleton-button skeleton-button-outline"></div>
                    </div>
                </div>
            </div>
        `);
        
        // List skeleton template
        this.skeletonTemplates.set('list', `
            <div class="skeleton-list">
                ${Array(6).fill().map(() => `
                    <div class="skeleton-list-item d-flex align-items-center mb-3">
                        <div class="skeleton-avatar me-3"></div>
                        <div class="skeleton-list-content flex-grow-1">
                            <div class="skeleton-line skeleton-line-sm mb-1"></div>
                            <div class="skeleton-line skeleton-line-xs w-75"></div>
                        </div>
                        <div class="skeleton-button skeleton-button-sm"></div>
                    </div>
                `).join('')}
            </div>
        `);
    }
    
    setupLoadingStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            /* Skeleton animations */
            @keyframes skeleton-pulse {
                0% { opacity: 1; }
                50% { opacity: 0.4; }
                100% { opacity: 1; }
            }
            
            @keyframes skeleton-wave {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
                100% { transform: translateX(100%); }
            }
            
            .skeleton-line {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-wave 2s infinite linear;
                border-radius: 4px;
                position: relative;
                overflow: hidden;
            }
            
            .skeleton-line-title { height: 24px; }
            .skeleton-line-subtitle { height: 18px; }
            .skeleton-line-text { height: 16px; }
            .skeleton-line-sm { height: 14px; }
            .skeleton-line-xs { height: 12px; }
            .skeleton-line-label { height: 14px; }
            
            .skeleton-button {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-wave 2s infinite linear;
                border-radius: 6px;
                height: 38px;
                width: 100px;
            }
            
            .skeleton-button-sm {
                height: 32px;
                width: 80px;
            }
            
            .skeleton-button-outline {
                background: transparent;
                border: 2px solid #e0e0e0;
                animation: skeleton-pulse 2s infinite;
            }
            
            .skeleton-input {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-wave 2s infinite linear;
                border-radius: 6px;
                height: 42px;
            }
            
            .skeleton-avatar {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-wave 2s infinite linear;
                border-radius: 50%;
                width: 40px;
                height: 40px;
            }
            
            .skeleton-chart-placeholder {
                background: #f8f9fa;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                height: 300px;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .skeleton-chart-bar {
                background: linear-gradient(180deg, #007bff 0%, #0056b3 100%);
                width: 20px;
                margin: 0 2px;
                border-radius: 2px 2px 0 0;
                opacity: 0.3;
                animation: skeleton-pulse 2s infinite;
            }
            
            .skeleton-legend-color {
                width: 12px;
                height: 12px;
                background: #e0e0e0;
                border-radius: 2px;
                animation: skeleton-pulse 2s infinite;
            }
            
            /* Loading overlays */
            .loading-overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(2px);
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: inherit;
            }
            
            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #f3f3f3;
                border-top: 4px solid #007bff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .loading-dots {
                display: flex;
                gap: 4px;
            }
            
            .loading-dot {
                width: 8px;
                height: 8px;
                background: #007bff;
                border-radius: 50%;
                animation: loading-bounce 1.4s infinite both;
            }
            
            .loading-dot:nth-child(1) { animation-delay: -0.32s; }
            .loading-dot:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes loading-bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
            
            .loading-progress {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: #f8f9fa;
                z-index: 9999;
            }
            
            .loading-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3);
                transition: width 0.3s ease;
                position: relative;
            }
            
            .loading-progress-bar::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;
                width: 20px;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3));
                animation: loading-shimmer 2s infinite;
            }
            
            @keyframes loading-shimmer {
                0% { transform: translateX(-20px); }
                100% { transform: translateX(20px); }
            }
            
            /* Dark theme adjustments */
            .bg-dark .skeleton-line,
            .bg-dark .skeleton-button,
            .bg-dark .skeleton-input {
                background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%);
            }
            
            .bg-dark .skeleton-chart-placeholder {
                background: #2d3748;
                border-color: #4a5568;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    setupGlobalLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'global-loading-overlay';
        overlay.className = 'loading-overlay position-fixed';
        overlay.style.cssText = `
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: none;
        `;
        
        overlay.innerHTML = `
            <div class="text-center text-white">
                <div class="loading-spinner mb-3"></div>
                <div class="loading-text">Loading...</div>
                <div class="loading-subtitle text-muted mt-2"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.globalOverlay = overlay;
    }
    
    setupProgressIndicators() {
        const progressBar = document.createElement('div');
        progressBar.id = 'global-progress-bar';
        progressBar.className = 'loading-progress';
        progressBar.style.display = 'none';
        
        progressBar.innerHTML = '<div class="loading-progress-bar" style="width: 0%"></div>';
        
        document.body.appendChild(progressBar);
        this.progressBar = progressBar;
    }
    
    interceptAjaxRequests() {
        // Intercept jQuery AJAX requests
        if (window.jQuery) {
            const self = this;
            
            jQuery(document).ajaxStart(() => {
                self.showGlobalProgress();
            });
            
            jQuery(document).ajaxStop(() => {
                self.hideGlobalProgress();
            });
            
            jQuery(document).ajaxError(() => {
                self.hideGlobalProgress();
            });
        }
        
        // Intercept fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            this.showGlobalProgress();
            try {
                const response = await originalFetch(...args);
                this.hideGlobalProgress();
                return response;
            } catch (error) {
                this.hideGlobalProgress();
                throw error;
            }
        };
    }
    
    bindEvents() {
        // Auto-show skeleton for forms during submission
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || `form_${Date.now()}`;
            
            setTimeout(() => {
                this.showSkeleton(formId, 'form');
            }, 100);
        });
        
        // Auto-show loading for buttons with data-loading attribute
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-loading]');
            if (button) {
                this.showButtonLoading(button);
            }
        });
    }
    
    // Public API methods
    showSkeleton(elementId, templateType = 'card', options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const template = this.skeletonTemplates.get(templateType);
        if (!template) return;
        
        // Store original content
        if (!element.dataset.originalContent) {
            element.dataset.originalContent = element.innerHTML;
        }
        
        // Apply skeleton
        element.innerHTML = template;
        element.classList.add('skeleton-loading');
        
        this.activeLoaders.set(elementId, {
            type: 'skeleton',
            templateType: templateType,
            startTime: Date.now()
        });
        
        // Auto-hide after timeout
        if (this.options.loadingTimeout > 0) {
            const timer = setTimeout(() => {
                this.hideSkeleton(elementId);
            }, this.options.loadingTimeout);
            
            this.loadingTimers.set(elementId, timer);
        }
    }
    
    hideSkeleton(elementId) {
        const element = document.getElementById(elementId);
        if (!element || !element.dataset.originalContent) return;
        
        // Restore original content
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
        element.classList.remove('skeleton-loading');
        
        this.activeLoaders.delete(elementId);
        
        // Clear timer
        const timer = this.loadingTimers.get(elementId);
        if (timer) {
            clearTimeout(timer);
            this.loadingTimers.delete(elementId);
        }
    }
    
    showLoadingOverlay(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="text-center">
                ${options.spinner !== false ? '<div class="loading-spinner mb-2"></div>' : ''}
                ${options.dots ? '<div class="loading-dots mb-2"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>' : ''}
                ${options.text ? `<div class="loading-text">${options.text}</div>` : ''}
            </div>
        `;
        
        element.style.position = 'relative';
        element.appendChild(overlay);
        
        this.activeLoaders.set(elementId, {
            type: 'overlay',
            overlay: overlay,
            startTime: Date.now()
        });
    }
    
    hideLoadingOverlay(elementId) {
        const loader = this.activeLoaders.get(elementId);
        if (loader && loader.type === 'overlay') {
            loader.overlay.remove();
            this.activeLoaders.delete(elementId);
        }
    }
    
    showButtonLoading(button, text = 'Loading...') {
        if (button.dataset.originalText) return; // Already loading
        
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            ${text}
        `;
        
        button.classList.add('loading');
    }
    
    hideButtonLoading(button) {
        if (!button.dataset.originalText) return;
        
        button.innerHTML = button.dataset.originalText;
        button.disabled = false;
        delete button.dataset.originalText;
        button.classList.remove('loading');
    }
    
    showGlobalLoading(text = 'Loading...', subtitle = '') {
        const overlay = this.globalOverlay;
        overlay.querySelector('.loading-text').textContent = text;
        overlay.querySelector('.loading-subtitle').textContent = subtitle;
        overlay.style.display = 'flex';
    }
    
    hideGlobalLoading() {
        this.globalOverlay.style.display = 'none';
    }
    
    showGlobalProgress() {
        this.progressBar.style.display = 'block';
        this.animateProgress(0, 90, 1000);
    }
    
    hideGlobalProgress() {
        this.animateProgress(90, 100, 200, () => {
            setTimeout(() => {
                this.progressBar.style.display = 'none';
                this.setProgress(0);
            }, 300);
        });
    }
    
    setProgress(percentage) {
        const bar = this.progressBar.querySelector('.loading-progress-bar');
        bar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }
    
    animateProgress(from, to, duration, callback) {
        const start = Date.now();
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = from + (to - from) * progress;
            
            this.setProgress(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else if (callback) {
                callback();
            }
        };
        
        animate();
    }
    
    // Utility methods
    showTableLoading(tableId) {
        this.showSkeleton(tableId, 'table');
    }
    
    showChartLoading(chartId) {
        this.showSkeleton(chartId, 'chart');
    }
    
    showFormLoading(formId) {
        this.showSkeleton(formId, 'form');
    }
    
    showListLoading(listId) {
        this.showSkeleton(listId, 'list');
    }
    
    hideAllLoading() {
        this.activeLoaders.forEach((loader, elementId) => {
            if (loader.type === 'skeleton') {
                this.hideSkeleton(elementId);
            } else if (loader.type === 'overlay') {
                this.hideLoadingOverlay(elementId);
            }
        });
        
        // Hide button loading states
        document.querySelectorAll('button.loading').forEach(button => {
            this.hideButtonLoading(button);
        });
        
        this.hideGlobalLoading();
        this.hideGlobalProgress();
    }
    
    getActiveLoaders() {
        return Array.from(this.activeLoaders.entries()).map(([id, loader]) => ({
            id,
            ...loader,
            duration: Date.now() - loader.startTime
        }));
    }
    
    // Smart preloading
    preloadContent(url, elementId) {
        if (!this.options.enableSmartPreloading) return;
        
        this.showSkeleton(elementId, 'card');
        
        fetch(url)
            .then(response => response.text())
            .then(html => {
                setTimeout(() => {
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.innerHTML = html;
                        this.hideSkeleton(elementId);
                    }
                }, 500); // Minimum loading time for better UX
            })
            .catch(error => {
                console.error('Preload failed:', error);
                this.hideSkeleton(elementId);
            });
    }
}

// Initialize loading manager
let loadingManager;

document.addEventListener('DOMContentLoaded', () => {
    loadingManager = new LoadingStateManager();
    
    // Make globally available
    window.loadingManager = loadingManager;
});

// Export for module use
window.LoadingStateManager = LoadingStateManager;