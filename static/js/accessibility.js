// Keyboard Navigation and Accessibility Enhancement System
// Professional keyboard shortcuts, focus management, and accessibility features

class AccessibilityManager {
    constructor(options = {}) {
        this.options = {
            enableKeyboardShortcuts: true,
            enableFocusTrapping: true,
            enableSkipLinks: true,
            enableHighContrast: true,
            announceChanges: true,
            ...options
        };
        
        this.shortcuts = new Map();
        this.focusStack = [];
        this.currentModal = null;
        this.skipLinkContainer = null;
        this.announcer = null;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardShortcuts();
        this.setupFocusManagement();
        this.setupSkipLinks();
        this.setupScreenReaderSupport();
        this.setupHighContrastMode();
        this.setupAccessibilityToolbar();
        this.bindEvents();
    }
    
    setupKeyboardShortcuts() {
        // Global shortcuts
        this.addShortcut('Alt+1', () => this.focusMainContent(), 'Jump to main content');
        this.addShortcut('Alt+2', () => this.focusNavigation(), 'Jump to navigation');
        this.addShortcut('Alt+3', () => this.focusSearch(), 'Jump to search');
        this.addShortcut('Alt+/', () => this.showShortcutsHelp(), 'Show keyboard shortcuts');
        this.addShortcut('Alt+h', () => this.toggleHighContrast(), 'Toggle high contrast');
        this.addShortcut('Alt+f', () => this.toggleFontSize(), 'Toggle font size');
        
        // Navigation shortcuts
        this.addShortcut('g h', () => this.navigateTo('/'), 'Go to home');
        this.addShortcut('g d', () => this.navigateTo('/dashboard/'), 'Go to dashboard');
        this.addShortcut('g b', () => this.navigateTo('/bikes/'), 'Go to bikes');
        this.addShortcut('g c', () => this.navigateTo('/customers/'), 'Go to customers');
        this.addShortcut('g s', () => this.navigateTo('/sales/'), 'Go to sales');
        this.addShortcut('g r', () => this.navigateTo('/reports/'), 'Go to reports');
        
        // Form shortcuts
        this.addShortcut('Ctrl+Enter', () => this.submitCurrentForm(), 'Submit current form');
        this.addShortcut('Escape', () => this.closeModal(), 'Close modal/dialog');
        
        if (this.options.enableKeyboardShortcuts) {
            this.bindKeyboardEvents();
        }
    }
    
    addShortcut(keys, handler, description) {
        this.shortcuts.set(keys.toLowerCase(), {
            handler: handler,
            description: description,
            keys: keys
        });
    }
    
    bindKeyboardEvents() {
        let keySequence = [];
        let sequenceTimer = null;
        
        document.addEventListener('keydown', (e) => {
            // Skip if user is typing in an input
            if (this.isTypingInInput(e.target)) return;
            
            const key = this.getKeyString(e);
            
            // Handle immediate shortcuts (with modifiers)
            if (e.altKey || e.ctrlKey || e.metaKey) {
                const shortcut = this.shortcuts.get(key.toLowerCase());
                if (shortcut) {
                    e.preventDefault();
                    shortcut.handler();
                    this.announceShortcut(shortcut);
                    return;
                }
            }
            
            // Handle key sequences (like 'g h')
            if (!e.altKey && !e.ctrlKey && !e.metaKey) {
                keySequence.push(e.key.toLowerCase());
                
                // Clear old sequence
                clearTimeout(sequenceTimer);
                sequenceTimer = setTimeout(() => {
                    keySequence = [];
                }, 1000);
                
                // Check for sequence matches
                const sequence = keySequence.join(' ');
                const shortcut = this.shortcuts.get(sequence);
                
                if (shortcut) {
                    e.preventDefault();
                    shortcut.handler();
                    this.announceShortcut(shortcut);
                    keySequence = [];
                    clearTimeout(sequenceTimer);
                }
            }
        });
    }
    
    getKeyString(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        if (e.metaKey) parts.push('Cmd');
        
        let key = e.key;
        if (key === ' ') key = 'Space';
        if (key === 'Enter') key = 'Enter';
        
        parts.push(key);
        return parts.join('+');
    }
    
    isTypingInInput(element) {
        const tagName = element.tagName.toLowerCase();
        const isInput = ['input', 'textarea', 'select'].includes(tagName);
        const isContentEditable = element.contentEditable === 'true';
        const isReadonly = element.readOnly || element.disabled;
        
        return (isInput || isContentEditable) && !isReadonly;
    }
    
    announceShortcut(shortcut) {
        if (this.options.announceChanges) {
            this.announce(`Shortcut activated: ${shortcut.description}`);
        }
    }
    
    setupFocusManagement() {
        // Focus visible on keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Improved focus indicators
        this.addFocusStyles();
    }
    
    addFocusStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .keyboard-navigation *:focus {
                outline: 3px solid #0066cc !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.3) !important;
            }
            
            .skip-link {
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 10000;
                border-radius: 4px;
                transition: top 0.3s;
            }
            
            .skip-link:focus {
                top: 6px;
                outline: 3px solid #fff;
            }
            
            .high-contrast {
                filter: contrast(200%) brightness(150%);
            }
            
            .large-font {
                font-size: 1.25em !important;
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    setupSkipLinks() {
        if (!this.options.enableSkipLinks) return;
        
        this.skipLinkContainer = document.createElement('div');
        this.skipLinkContainer.className = 'skip-links';
        this.skipLinkContainer.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
            <a href="#search" class="skip-link">Skip to search</a>
        `;
        
        document.body.insertBefore(this.skipLinkContainer, document.body.firstChild);
        this.ensureElementIds();
    }
    
    ensureElementIds() {
        const selectors = {
            '#main-content': 'main, .main-content, .container-fluid',
            '#navigation': 'nav, .navbar, .navigation',
            '#search': '.search-input, [type="search"]'
        };
        
        Object.entries(selectors).forEach(([id, selector]) => {
            const targetId = id.substring(1);
            if (!document.getElementById(targetId)) {
                const element = document.querySelector(selector);
                if (element) {
                    element.id = targetId;
                }
            }
        });
    }
    
    setupScreenReaderSupport() {
        // Create live region for announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.className = 'sr-only';
        this.announcer.id = 'live-announcer';
        document.body.appendChild(this.announcer);
    }
    
    setupHighContrastMode() {
        if (!this.options.enableHighContrast) return;
        
        // Check for saved preference
        const isHighContrast = localStorage.getItem('high-contrast') === 'true';
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
        }
    }
    
    setupAccessibilityToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'accessibility-toolbar position-fixed';
        toolbar.style.cssText = `
            top: 50px;
            right: 20px;
            background: #333;
            border-radius: 8px;
            padding: 10px;
            z-index: 9998;
            display: none;
        `;
        
        toolbar.innerHTML = `
            <div class="d-flex flex-column gap-2">
                <button class="btn btn-sm btn-outline-light" id="toggle-contrast" title="Toggle High Contrast">
                    <i class="fas fa-adjust"></i>
                </button>
                <button class="btn btn-sm btn-outline-light" id="toggle-font-size" title="Toggle Font Size">
                    <i class="fas fa-text-height"></i>
                </button>
                <button class="btn btn-sm btn-outline-light" id="show-shortcuts" title="Show Keyboard Shortcuts">
                    <i class="fas fa-keyboard"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toolbar);
        this.bindToolbarEvents(toolbar);
        
        // Show/hide toolbar with Alt+A
        this.addShortcut('Alt+a', () => this.toggleAccessibilityToolbar(), 'Toggle accessibility toolbar');
    }
    
    bindToolbarEvents(toolbar) {
        toolbar.querySelector('#toggle-contrast').addEventListener('click', () => {
            this.toggleHighContrast();
        });
        
        toolbar.querySelector('#toggle-font-size').addEventListener('click', () => {
            this.toggleFontSize();
        });
        
        toolbar.querySelector('#show-shortcuts').addEventListener('click', () => {
            this.showShortcutsHelp();
        });
    }
    
    bindEvents() {
        // Form submission announcements
        document.addEventListener('submit', (e) => {
            this.announce('Form submitted, processing...');
        });
    }
    
    // Public methods for shortcut handlers
    focusMainContent() {
        const main = document.getElementById('main-content') || document.querySelector('main, .main-content');
        if (main) {
            main.focus();
            main.scrollIntoView({ behavior: 'smooth' });
            this.announce('Focused main content');
        }
    }
    
    focusNavigation() {
        const nav = document.getElementById('navigation') || document.querySelector('nav, .navbar');
        if (nav) {
            const firstLink = nav.querySelector('a, button');
            if (firstLink) {
                firstLink.focus();
                this.announce('Focused navigation');
            }
        }
    }
    
    focusSearch() {
        const search = document.getElementById('search') || document.querySelector('.search-input, [type="search"]');
        if (search) {
            search.focus();
            this.announce('Focused search');
        }
    }
    
    toggleHighContrast() {
        const isEnabled = document.body.classList.toggle('high-contrast');
        localStorage.setItem('high-contrast', isEnabled);
        this.announce(isEnabled ? 'High contrast enabled' : 'High contrast disabled');
    }
    
    toggleFontSize() {
        const isLarge = document.body.classList.toggle('large-font');
        localStorage.setItem('large-font', isLarge);
        this.announce(isLarge ? 'Large font enabled' : 'Large font disabled');
    }
    
    toggleAccessibilityToolbar() {
        const toolbar = document.querySelector('.accessibility-toolbar');
        if (toolbar) {
            const isVisible = toolbar.style.display !== 'none';
            toolbar.style.display = isVisible ? 'none' : 'block';
            this.announce(isVisible ? 'Accessibility toolbar hidden' : 'Accessibility toolbar shown');
        }
    }
    
    navigateTo(url) {
        window.location.href = url;
    }
    
    submitCurrentForm() {
        const activeElement = document.activeElement;
        const form = activeElement.closest('form');
        if (form) {
            form.submit();
            this.announce('Form submitted');
        }
    }
    
    closeModal() {
        const modals = document.querySelectorAll('.modal.show');
        if (modals.length > 0) {
            const modal = modals[modals.length - 1];
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
                this.announce('Modal closed');
            }
        }
    }
    
    showShortcutsHelp() {
        const modal = this.createShortcutsModal();
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }
    
    createShortcutsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        
        const shortcuts = Array.from(this.shortcuts.entries())
            .map(([key, data]) => ({ key, ...data }))
            .sort((a, b) => a.description.localeCompare(b.description));
        
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content bg-dark">
                    <div class="modal-header border-secondary">
                        <h5 class="modal-title text-light">Keyboard Shortcuts</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12">
                                <div class="shortcut-list">
                                    ${shortcuts.map(s => `
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-muted">${s.description}</span>
                                            <kbd class="bg-secondary text-light">${s.keys}</kbd>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    announce(message) {
        if (this.announcer && this.options.announceChanges) {
            this.announcer.textContent = message;
            
            // Clear after a short delay to allow for new announcements
            setTimeout(() => {
                if (this.announcer.textContent === message) {
                    this.announcer.textContent = '';
                }
            }, 1000);
        }
    }
    
    // Public API
    addCustomShortcut(keys, handler, description) {
        this.addShortcut(keys, handler, description);
    }
    
    removeShortcut(keys) {
        this.shortcuts.delete(keys.toLowerCase());
    }
    
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([key, data]) => ({
            key,
            ...data
        }));
    }
}

// Initialize accessibility manager
let accessibilityManager;

document.addEventListener('DOMContentLoaded', () => {
    accessibilityManager = new AccessibilityManager();
    
    // Make globally available
    window.accessibility = accessibilityManager;
});

// Export for module use
window.AccessibilityManager = AccessibilityManager;