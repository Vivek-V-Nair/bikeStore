// Advanced Notification System with Toast Messages, Alerts, and Modals
// Professional notification management with animations, queuing, and customization

class NotificationManager {
    constructor(options = {}) {
        this.options = {
            position: 'top-end', // top-start, top-center, top-end, bottom-start, bottom-center, bottom-end
            autoHide: true,
            defaultTimeout: 5000,
            maxNotifications: 5,
            animationDuration: 300,
            stackSpacing: 10,
            ...options
        };
        
        this.notifications = [];
        this.notificationQueue = [];
        this.container = null;
        this.soundEnabled = true;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.setupSounds();
        this.bindGlobalEvents();
        this.setupKeyboardShortcuts();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        
        // Position the container
        const positionClasses = {
            'top-start': 'top-0 start-0',
            'top-center': 'top-0 start-50 translate-middle-x',
            'top-end': 'top-0 end-0',
            'bottom-start': 'bottom-0 start-0',
            'bottom-center': 'bottom-0 start-50 translate-middle-x',
            'bottom-end': 'bottom-0 end-0'
        };
        
        this.container.className += ` position-fixed ${positionClasses[this.options.position]} p-3`;
        this.container.style.zIndex = '9999';
        this.container.style.pointerEvents = 'none';
        
        document.body.appendChild(this.container);
    }
    
    setupSounds() {
        this.sounds = {
            success: this.createSound('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCT2ZzN8='),
            error: this.createSound('data:audio/wav;base64,UklGRrAGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYwGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCT2ZzN8='),
            warning: this.createSound('data:audio/wav;base64,UklGRuIGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YT4GAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCT2ZzN8='),
            info: this.createSound('data:audio/wav;base64,UklGRkoGAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YfYFAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYfCT2ZzN8=')
        };
    }
    
    createSound(dataUrl) {
        const audio = new Audio(dataUrl);
        audio.volume = 0.3;
        return audio;
    }
    
    bindGlobalEvents() {
        // Listen for Django messages
        window.addEventListener('django:message', (e) => {
            this.showDjangoMessage(e.detail);
        });
        
        // Listen for AJAX errors
        $(document).ajaxError((event, xhr, settings) => {
            if (xhr.status !== 200) {
                this.error('Request failed', 'Please try again later');
            }
        });
        
        // Listen for network status
        window.addEventListener('online', () => {
            this.success('Connection restored', 'You are back online');
        });
        
        window.addEventListener('offline', () => {
            this.warning('No internet connection', 'Some features may not work');
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to dismiss all notifications
            if (e.key === 'Escape') {
                this.dismissAll();
            }
            
            // Ctrl+Shift+N to toggle sound
            if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                this.toggleSound();
            }
        });
    }
    
    // Public API methods
    success(title, message, options = {}) {
        return this.show({
            type: 'success',
            title: title,
            message: message,
            icon: 'fas fa-check-circle',
            ...options
        });
    }
    
    error(title, message, options = {}) {
        return this.show({
            type: 'error',
            title: title,
            message: message,
            icon: 'fas fa-exclamation-circle',
            autoHide: false, // Errors should be manually dismissed
            ...options
        });
    }
    
    warning(title, message, options = {}) {
        return this.show({
            type: 'warning',
            title: title,
            message: message,
            icon: 'fas fa-exclamation-triangle',
            ...options
        });
    }
    
    info(title, message, options = {}) {
        return this.show({
            type: 'info',
            title: title,
            message: message,
            icon: 'fas fa-info-circle',
            ...options
        });
    }
    
    loading(title, message, options = {}) {
        return this.show({
            type: 'loading',
            title: title,
            message: message,
            icon: 'fas fa-spinner fa-spin',
            autoHide: false,
            dismissible: false,
            ...options
        });
    }
    
    progress(title, message, progressValue = 0, options = {}) {
        return this.show({
            type: 'progress',
            title: title,
            message: message,
            progress: progressValue,
            icon: 'fas fa-tasks',
            autoHide: false,
            ...options
        });
    }
    
    custom(options = {}) {
        return this.show(options);
    }
    
    show(config) {
        const notification = this.createNotification(config);
        
        // Check if we need to queue this notification
        if (this.notifications.length >= this.options.maxNotifications) {
            this.notificationQueue.push(notification);
            return notification;
        }
        
        this.addNotification(notification);
        return notification;
    }
    
    createNotification(config) {
        const id = 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const notification = {
            id: id,
            type: config.type || 'info',
            title: config.title || '',
            message: config.message || '',
            icon: config.icon || 'fas fa-bell',
            autoHide: config.autoHide !== undefined ? config.autoHide : this.options.autoHide,
            timeout: config.timeout || this.options.defaultTimeout,
            dismissible: config.dismissible !== undefined ? config.dismissible : true,
            actions: config.actions || [],
            progress: config.progress || null,
            persistent: config.persistent || false,
            className: config.className || '',
            data: config.data || {},
            onShow: config.onShow || null,
            onHide: config.onHide || null,
            onClick: config.onClick || null
        };
        
        return notification;
    }
    
    addNotification(notification) {
        // Create DOM element
        const element = this.createNotificationElement(notification);
        notification.element = element;
        
        // Add to tracking array
        this.notifications.push(notification);
        
        // Add to DOM
        this.container.appendChild(element);
        
        // Position notifications
        this.positionNotifications();
        
        // Animate in
        this.animateIn(element);
        
        // Play sound
        if (this.soundEnabled && this.sounds[notification.type]) {
            this.sounds[notification.type].play().catch(() => {
                // Sound play failed, ignore
            });
        }
        
        // Set auto-hide timer
        if (notification.autoHide) {
            this.setAutoHideTimer(notification);
        }
        
        // Call onShow callback
        if (notification.onShow) {
            notification.onShow(notification);
        }
        
        // Emit custom event
        this.emit('notification:show', notification);
    }
    
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification toast show ${notification.className}`;
        element.setAttribute('role', 'alert');
        element.setAttribute('aria-live', 'assertive');
        element.setAttribute('aria-atomic', 'true');
        element.setAttribute('data-notification-id', notification.id);
        element.style.pointerEvents = 'auto';
        
        // Determine theme based on type
        const themes = {
            success: 'text-bg-success',
            error: 'text-bg-danger',
            warning: 'text-bg-warning',
            info: 'text-bg-info',
            loading: 'text-bg-primary',
            progress: 'text-bg-info'
        };
        
        element.classList.add(themes[notification.type] || 'text-bg-secondary');
        
        // Build notification content
        element.innerHTML = `
            <div class="toast-header">
                <i class="${notification.icon} me-2"></i>
                <strong class="me-auto">${notification.title}</strong>
                ${notification.dismissible ? `
                    <button type="button" class="btn-close btn-close-white" data-notification-dismiss="${notification.id}">
                        <span aria-hidden="true">&times;</span>
                    </button>
                ` : ''}
            </div>
            <div class="toast-body">
                ${notification.message}
                ${notification.progress !== null ? `
                    <div class="progress mt-2" style="height: 4px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${notification.progress}%" 
                             aria-valuenow="${notification.progress}" 
                             aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                ` : ''}
                ${notification.actions.length > 0 ? `
                    <div class="notification-actions mt-2">
                        ${notification.actions.map((action, index) => `
                            <button type="button" class="btn btn-sm ${action.className || 'btn-outline-light'} me-2" 
                                    data-action="${index}">
                                ${action.icon ? `<i class="${action.icon} me-1"></i>` : ''}
                                ${action.label}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        // Bind events
        this.bindNotificationEvents(element, notification);
        
        return element;
    }
    
    bindNotificationEvents(element, notification) {
        // Dismiss button
        const dismissBtn = element.querySelector('[data-notification-dismiss]');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.dismiss(notification.id);
            });
        }
        
        // Action buttons
        const actionBtns = element.querySelectorAll('[data-action]');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const action = notification.actions[index];
                if (action.handler) {
                    action.handler(notification, btn);
                }
                
                if (action.dismissOnClick !== false) {
                    this.dismiss(notification.id);
                }
            });
        });
        
        // Click handler
        if (notification.onClick) {
            element.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    notification.onClick(notification, e);
                }
            });
        }
        
        // Pause auto-hide on hover
        if (notification.autoHide) {
            element.addEventListener('mouseenter', () => {
                this.pauseAutoHide(notification);
            });
            
            element.addEventListener('mouseleave', () => {
                this.resumeAutoHide(notification);
            });
        }
    }
    
    positionNotifications() {
        let offset = 0;
        
        this.notifications.forEach((notification, index) => {
            if (notification.element) {
                notification.element.style.transform = `translateY(${offset}px)`;
                notification.element.style.zIndex = 9999 - index;
                offset += notification.element.offsetHeight + this.options.stackSpacing;
            }
        });
    }
    
    animateIn(element) {
        element.style.opacity = '0';
        element.style.transform += ' translateX(100%)';
        element.style.transition = `all ${this.options.animationDuration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = element.style.transform.replace('translateX(100%)', 'translateX(0)');
        });
    }
    
    animateOut(element) {
        return new Promise(resolve => {
            element.style.transition = `all ${this.options.animationDuration}ms ease-in`;
            element.style.opacity = '0';
            element.style.transform += ' translateX(100%)';
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                resolve();
            }, this.options.animationDuration);
        });
    }
    
    setAutoHideTimer(notification) {
        notification.timer = setTimeout(() => {
            this.dismiss(notification.id);
        }, notification.timeout);
    }
    
    pauseAutoHide(notification) {
        if (notification.timer) {
            clearTimeout(notification.timer);
            notification.timer = null;
        }
    }
    
    resumeAutoHide(notification) {
        if (notification.autoHide && !notification.timer) {
            this.setAutoHideTimer(notification);
        }
    }
    
    dismiss(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;
        
        // Clear timer
        if (notification.timer) {
            clearTimeout(notification.timer);
        }
        
        // Animate out
        this.animateOut(notification.element).then(() => {
            // Remove from tracking array
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
            
            // Reposition remaining notifications
            this.positionNotifications();
            
            // Process queue
            this.processQueue();
            
            // Call onHide callback
            if (notification.onHide) {
                notification.onHide(notification);
            }
            
            // Emit custom event
            this.emit('notification:hide', notification);
        });
    }
    
    dismissAll() {
        const notificationIds = this.notifications.map(n => n.id);
        notificationIds.forEach(id => this.dismiss(id));
    }
    
    processQueue() {
        if (this.notificationQueue.length > 0 && this.notifications.length < this.options.maxNotifications) {
            const notification = this.notificationQueue.shift();
            this.addNotification(notification);
        }
    }
    
    updateProgress(notificationId, progress) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && notification.element) {
            const progressBar = notification.element.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = progress + '%';
                progressBar.setAttribute('aria-valuenow', progress);
                notification.progress = progress;
                
                // Auto-dismiss when complete
                if (progress >= 100 && notification.autoHide) {
                    setTimeout(() => this.dismiss(notificationId), 1000);
                }
            }
        }
    }
    
    updateMessage(notificationId, message) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && notification.element) {
            const messageElement = notification.element.querySelector('.toast-body');
            if (messageElement) {
                // Preserve progress bar and actions
                const progress = messageElement.querySelector('.progress');
                const actions = messageElement.querySelector('.notification-actions');
                
                messageElement.innerHTML = message;
                
                if (progress) messageElement.appendChild(progress);
                if (actions) messageElement.appendChild(actions);
                
                notification.message = message;
            }
        }
    }
    
    showDjangoMessage(data) {
        const typeMapping = {
            'debug': 'info',
            'info': 'info',
            'success': 'success',
            'warning': 'warning',
            'error': 'error'
        };
        
        const method = typeMapping[data.level] || 'info';
        this[method]('', data.message, {
            timeout: data.level === 'error' ? 10000 : this.options.defaultTimeout
        });
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        this.info(
            'Sound ' + (this.soundEnabled ? 'enabled' : 'disabled'),
            'Notification sounds have been ' + (this.soundEnabled ? 'enabled' : 'disabled')
        );
        
        // Save preference
        localStorage.setItem('notifications_sound', this.soundEnabled);
    }
    
    // Batch operations
    showBatch(notifications) {
        notifications.forEach(config => this.show(config));
    }
    
    // Confirmation dialogs
    confirm(title, message, options = {}) {
        return new Promise((resolve) => {
            this.show({
                type: 'warning',
                title: title,
                message: message,
                icon: 'fas fa-question-circle',
                autoHide: false,
                actions: [
                    {
                        label: options.confirmLabel || 'Confirm',
                        className: 'btn-outline-light',
                        icon: 'fas fa-check',
                        handler: () => resolve(true)
                    },
                    {
                        label: options.cancelLabel || 'Cancel',
                        className: 'btn-outline-secondary',
                        icon: 'fas fa-times',
                        handler: () => resolve(false)
                    }
                ],
                ...options
            });
        });
    }
    
    // Prompt dialogs
    prompt(title, message, defaultValue = '', options = {}) {
        return new Promise((resolve) => {
            const promptId = 'prompt_' + Date.now();
            
            this.show({
                type: 'info',
                title: title,
                message: `
                    ${message}
                    <div class="mt-2">
                        <input type="text" class="form-control" id="${promptId}" 
                               value="${defaultValue}" placeholder="Enter value...">
                    </div>
                `,
                icon: 'fas fa-edit',
                autoHide: false,
                actions: [
                    {
                        label: 'OK',
                        className: 'btn-outline-light',
                        icon: 'fas fa-check',
                        handler: () => {
                            const input = document.getElementById(promptId);
                            resolve(input ? input.value : null);
                        }
                    },
                    {
                        label: 'Cancel',
                        className: 'btn-outline-secondary',
                        icon: 'fas fa-times',
                        handler: () => resolve(null)
                    }
                ],
                onShow: () => {
                    // Focus input after animation
                    setTimeout(() => {
                        const input = document.getElementById(promptId);
                        if (input) {
                            input.focus();
                            input.select();
                        }
                    }, this.options.animationDuration);
                },
                ...options
            });
        });
    }
    
    // Event system
    emit(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(event);
    }
    
    // Get notification count
    getCount() {
        return this.notifications.length;
    }
    
    // Get all notifications
    getAll() {
        return [...this.notifications];
    }
    
    // Clear all
    clear() {
        this.dismissAll();
        this.notificationQueue = [];
    }
    
    // Destroy instance
    destroy() {
        this.clear();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Global instance
let notificationManager;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Load sound preference
    const soundEnabled = localStorage.getItem('notifications_sound') !== 'false';
    
    notificationManager = new NotificationManager({
        position: 'top-end',
        soundEnabled: soundEnabled
    });
    
    // Make it globally available
    window.notify = {
        success: (title, message, options) => notificationManager.success(title, message, options),
        error: (title, message, options) => notificationManager.error(title, message, options),
        warning: (title, message, options) => notificationManager.warning(title, message, options),
        info: (title, message, options) => notificationManager.info(title, message, options),
        loading: (title, message, options) => notificationManager.loading(title, message, options),
        progress: (title, message, progress, options) => notificationManager.progress(title, message, progress, options),
        confirm: (title, message, options) => notificationManager.confirm(title, message, options),
        prompt: (title, message, defaultValue, options) => notificationManager.prompt(title, message, defaultValue, options),
        dismiss: (id) => notificationManager.dismiss(id),
        dismissAll: () => notificationManager.dismissAll(),
        updateProgress: (id, progress) => notificationManager.updateProgress(id, progress),
        updateMessage: (id, message) => notificationManager.updateMessage(id, message)
    };
});

// Export for module use
window.NotificationManager = NotificationManager;