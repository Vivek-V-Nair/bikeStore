// Professional Form Validation with Real-time Feedback and Animations
// Advanced validation with custom rules, async validation, and beautiful animations

class FormValidator {
    constructor(formSelector, options = {}) {
        this.form = typeof formSelector === 'string' ? document.querySelector(formSelector) : formSelector;
        this.options = {
            validateOnInput: true,
            validateOnBlur: true,
            showSuccessState: true,
            animationDuration: 300,
            debounceDelay: 300,
            ...options
        };
        
        this.rules = new Map();
        this.customValidators = new Map();
        this.asyncValidators = new Map();
        this.validationResults = new Map();
        this.debounceTimers = new Map();
        
        this.errorMessages = {
            required: 'This field is required',
            email: 'Please enter a valid email address',
            minLength: 'Must be at least {min} characters long',
            maxLength: 'Must be no more than {max} characters long',
            pattern: 'Please enter a valid format',
            number: 'Please enter a valid number',
            min: 'Value must be at least {min}',
            max: 'Value must be no more than {max}',
            equalTo: 'This field must match {target}',
            phone: 'Please enter a valid phone number',
            url: 'Please enter a valid URL',
            date: 'Please enter a valid date',
            unique: 'This value already exists'
        };
        
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.setupFormStructure();
        this.bindEvents();
        this.setupRealTimeValidation();
        this.addValidationStyles();
    }
    
    setupFormStructure() {
        // Add validation container to each form group
        const formGroups = this.form.querySelectorAll('.mb-3, .form-group');
        
        formGroups.forEach(group => {
            const input = group.querySelector('input, select, textarea');
            if (input && !group.querySelector('.validation-feedback')) {
                this.addValidationFeedback(group, input);
            }
        });
    }
    
    addValidationFeedback(group, input) {
        // Create validation feedback container
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'validation-feedback';
        
        // Success feedback
        const successFeedback = document.createElement('div');
        successFeedback.className = 'valid-feedback';
        successFeedback.innerHTML = '<i class="fas fa-check-circle me-1"></i>Looks good!';
        
        // Error feedback
        const errorFeedback = document.createElement('div');
        errorFeedback.className = 'invalid-feedback';
        
        // Validation progress indicator
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'validation-progress';
        progressIndicator.innerHTML = '<div class="progress-bar"></div>';
        
        feedbackContainer.appendChild(successFeedback);
        feedbackContainer.appendChild(errorFeedback);
        feedbackContainer.appendChild(progressIndicator);
        
        group.appendChild(feedbackContainer);
        
        // Add validation icons
        this.addValidationIcons(group, input);
    }
    
    addValidationIcons(group, input) {
        const iconContainer = document.createElement('div');
        iconContainer.className = 'validation-icons position-absolute';
        iconContainer.style.cssText = 'right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;';
        
        const successIcon = document.createElement('i');
        successIcon.className = 'fas fa-check-circle text-success validation-icon success-icon';
        successIcon.style.display = 'none';
        
        const errorIcon = document.createElement('i');
        errorIcon.className = 'fas fa-exclamation-circle text-danger validation-icon error-icon';
        errorIcon.style.display = 'none';
        
        const loadingIcon = document.createElement('i');
        loadingIcon.className = 'fas fa-spinner fa-spin text-info validation-icon loading-icon';
        loadingIcon.style.display = 'none';
        
        iconContainer.appendChild(successIcon);
        iconContainer.appendChild(errorIcon);
        iconContainer.appendChild(loadingIcon);
        
        // Make input container relative
        if (group.style.position !== 'relative') {
            group.style.position = 'relative';
        }
        
        group.appendChild(iconContainer);
    }
    
    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm().then(isValid => {
                if (isValid) {
                    this.handleSuccessfulValidation();
                } else {
                    this.handleValidationErrors();
                }
            });
        });
        
        // Input events
        if (this.options.validateOnInput) {
            this.form.addEventListener('input', (e) => {
                if (this.isValidatableField(e.target)) {
                    this.debounceValidation(e.target);
                }
            });
        }
        
        if (this.options.validateOnBlur) {
            this.form.addEventListener('blur', (e) => {
                if (this.isValidatableField(e.target)) {
                    this.validateField(e.target);
                }
            }, true);
        }
        
        // Focus events for better UX
        this.form.addEventListener('focus', (e) => {
            if (this.isValidatableField(e.target)) {
                this.clearFieldState(e.target);
            }
        }, true);
    }
    
    setupRealTimeValidation() {
        // Password strength indicator
        const passwordFields = this.form.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            this.addPasswordStrengthIndicator(field);
        });
        
        // Email validation with suggestions
        const emailFields = this.form.querySelectorAll('input[type="email"]');
        emailFields.forEach(field => {
            this.addEmailSuggestions(field);
        });
        
        // Phone number formatting
        const phoneFields = this.form.querySelectorAll('input[type="tel"], input[name*="phone"]');
        phoneFields.forEach(field => {
            this.addPhoneFormatting(field);
        });
    }
    
    addPasswordStrengthIndicator(field) {
        const group = field.closest('.mb-3, .form-group');
        const strengthIndicator = document.createElement('div');
        strengthIndicator.className = 'password-strength mt-2';
        strengthIndicator.innerHTML = `
            <div class="strength-meter">
                <div class="strength-bar"></div>
            </div>
            <div class="strength-text text-muted small"></div>
            <div class="strength-requirements mt-2">
                <small class="text-muted">
                    <div class="requirement" data-requirement="length">
                        <i class="fas fa-times text-danger"></i> At least 8 characters
                    </div>
                    <div class="requirement" data-requirement="uppercase">
                        <i class="fas fa-times text-danger"></i> One uppercase letter
                    </div>
                    <div class="requirement" data-requirement="lowercase">
                        <i class="fas fa-times text-danger"></i> One lowercase letter
                    </div>
                    <div class="requirement" data-requirement="number">
                        <i class="fas fa-times text-danger"></i> One number
                    </div>
                    <div class="requirement" data-requirement="special">
                        <i class="fas fa-times text-danger"></i> One special character
                    </div>
                </small>
            </div>
        `;
        
        group.appendChild(strengthIndicator);
        
        field.addEventListener('input', () => {
            this.updatePasswordStrength(field, strengthIndicator);
        });
    }
    
    updatePasswordStrength(field, indicator) {
        const password = field.value;
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        
        const score = Object.values(requirements).filter(Boolean).length;
        const percentage = (score / 5) * 100;
        
        // Update strength bar
        const bar = indicator.querySelector('.strength-bar');
        const text = indicator.querySelector('.strength-text');
        
        bar.style.width = percentage + '%';
        
        // Update colors and text based on strength
        if (score <= 1) {
            bar.className = 'strength-bar bg-danger';
            text.textContent = 'Weak';
            text.className = 'strength-text text-danger small';
        } else if (score <= 2) {
            bar.className = 'strength-bar bg-warning';
            text.textContent = 'Fair';
            text.className = 'strength-text text-warning small';
        } else if (score <= 3) {
            bar.className = 'strength-bar bg-info';
            text.textContent = 'Good';
            text.className = 'strength-text text-info small';
        } else if (score <= 4) {
            bar.className = 'strength-bar bg-primary';
            text.textContent = 'Strong';
            text.className = 'strength-text text-primary small';
        } else {
            bar.className = 'strength-bar bg-success';
            text.textContent = 'Very Strong';
            text.className = 'strength-text text-success small';
        }
        
        // Update requirement indicators
        Object.entries(requirements).forEach(([requirement, met]) => {
            const reqElement = indicator.querySelector(`[data-requirement="${requirement}"]`);
            const icon = reqElement.querySelector('i');
            
            if (met) {
                icon.className = 'fas fa-check text-success';
                reqElement.classList.add('text-success');
                reqElement.classList.remove('text-danger');
            } else {
                icon.className = 'fas fa-times text-danger';
                reqElement.classList.add('text-danger');
                reqElement.classList.remove('text-success');
            }
        });
    }
    
    addEmailSuggestions(field) {
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com'];
        
        field.addEventListener('blur', () => {
            const email = field.value;
            if (email && email.includes('@')) {
                const [username, domain] = email.split('@');
                
                // Check for common typos
                const suggestions = this.getEmailSuggestions(domain, commonDomains);
                if (suggestions.length > 0) {
                    this.showEmailSuggestions(field, username, suggestions);
                }
            }
        });
    }
    
    getEmailSuggestions(domain, commonDomains) {
        const suggestions = [];
        const threshold = 2; // Maximum edit distance
        
        commonDomains.forEach(commonDomain => {
            if (this.calculateEditDistance(domain, commonDomain) <= threshold && domain !== commonDomain) {
                suggestions.push(commonDomain);
            }
        });
        
        return suggestions.slice(0, 3); // Limit to 3 suggestions
    }
    
    calculateEditDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[j][i] = matrix[j - 1][i - 1];
                } else {
                    matrix[j][i] = Math.min(
                        matrix[j - 1][i] + 1,
                        matrix[j][i - 1] + 1,
                        matrix[j - 1][i - 1] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    showEmailSuggestions(field, username, suggestions) {
        const group = field.closest('.mb-3, .form-group');
        let suggestionContainer = group.querySelector('.email-suggestions');
        
        if (!suggestionContainer) {
            suggestionContainer = document.createElement('div');
            suggestionContainer.className = 'email-suggestions mt-2';
            group.appendChild(suggestionContainer);
        }
        
        suggestionContainer.innerHTML = `
            <small class="text-muted">Did you mean:</small>
            <div class="suggestion-buttons mt-1">
                ${suggestions.map(domain => `
                    <button type="button" class="btn btn-sm btn-outline-secondary me-1 suggestion-btn" 
                            data-suggestion="${username}@${domain}">
                        ${username}@${domain}
                    </button>
                `).join('')}
            </div>
        `;
        
        // Bind suggestion click events
        suggestionContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                field.value = btn.dataset.suggestion;
                suggestionContainer.remove();
                this.validateField(field);
            });
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (suggestionContainer.parentNode) {
                suggestionContainer.remove();
            }
        }, 10000);
    }
    
    addPhoneFormatting(field) {
        field.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length >= 6) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{3})(\d{3})(\d{0,4})/, '$1-$2-$3');
                } else {
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
            }
            
            e.target.value = value;
        });
    }
    
    addRule(fieldName, rule, message) {
        if (!this.rules.has(fieldName)) {
            this.rules.set(fieldName, []);
        }
        
        this.rules.get(fieldName).push({
            rule: rule,
            message: message || this.getDefaultMessage(rule)
        });
        
        return this;
    }
    
    addCustomValidator(fieldName, validatorFn, message) {
        this.customValidators.set(fieldName, {
            validator: validatorFn,
            message: message
        });
        
        return this;
    }
    
    addAsyncValidator(fieldName, validatorFn, message) {
        this.asyncValidators.set(fieldName, {
            validator: validatorFn,
            message: message
        });
        
        return this;
    }
    
    async validateForm() {
        const validationPromises = [];
        const fields = this.form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (this.isValidatableField(field)) {
                validationPromises.push(this.validateField(field));
            }
        });
        
        const results = await Promise.all(validationPromises);
        return results.every(result => result);
    }
    
    async validateField(field) {
        const fieldName = field.name || field.id;
        if (!fieldName) return true;
        
        this.showLoadingState(field);
        
        try {
            // Built-in validation
            const builtInValid = this.validateBuiltInRules(field);
            if (!builtInValid.isValid) {
                this.showFieldError(field, builtInValid.message);
                return false;
            }
            
            // Custom rules
            const customValid = this.validateCustomRules(field);
            if (!customValid.isValid) {
                this.showFieldError(field, customValid.message);
                return false;
            }
            
            // Async validation
            if (this.asyncValidators.has(fieldName)) {
                const asyncValid = await this.validateAsyncRules(field);
                if (!asyncValid.isValid) {
                    this.showFieldError(field, asyncValid.message);
                    return false;
                }
            }
            
            this.showFieldSuccess(field);
            return true;
            
        } catch (error) {
            console.error('Validation error:', error);
            this.showFieldError(field, 'Validation failed');
            return false;
        } finally {
            this.hideLoadingState(field);
        }
    }
    
    validateBuiltInRules(field) {
        const value = field.value.trim();
        const fieldName = field.name || field.id;
        const rules = this.rules.get(fieldName) || [];
        
        for (const ruleConfig of rules) {
            const result = this.applyRule(value, ruleConfig.rule, field);
            if (!result.isValid) {
                return {
                    isValid: false,
                    message: ruleConfig.message || result.message
                };
            }
        }
        
        return { isValid: true };
    }
    
    validateCustomRules(field) {
        const fieldName = field.name || field.id;
        const customValidator = this.customValidators.get(fieldName);
        
        if (customValidator) {
            try {
                const isValid = customValidator.validator(field.value, field, this.form);
                if (!isValid) {
                    return {
                        isValid: false,
                        message: customValidator.message
                    };
                }
            } catch (error) {
                return {
                    isValid: false,
                    message: 'Custom validation failed'
                };
            }
        }
        
        return { isValid: true };
    }
    
    async validateAsyncRules(field) {
        const fieldName = field.name || field.id;
        const asyncValidator = this.asyncValidators.get(fieldName);
        
        if (asyncValidator) {
            try {
                const isValid = await asyncValidator.validator(field.value, field, this.form);
                if (!isValid) {
                    return {
                        isValid: false,
                        message: asyncValidator.message
                    };
                }
            } catch (error) {
                return {
                    isValid: false,
                    message: 'Async validation failed'
                };
            }
        }
        
        return { isValid: true };
    }
    
    applyRule(value, rule, field) {
        switch (rule.type) {
            case 'required':
                return {
                    isValid: value.length > 0,
                    message: this.errorMessages.required
                };
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    isValid: !value || emailRegex.test(value),
                    message: this.errorMessages.email
                };
                
            case 'minLength':
                return {
                    isValid: !value || value.length >= rule.value,
                    message: this.errorMessages.minLength.replace('{min}', rule.value)
                };
                
            case 'maxLength':
                return {
                    isValid: !value || value.length <= rule.value,
                    message: this.errorMessages.maxLength.replace('{max}', rule.value)
                };
                
            case 'pattern':
                const regex = new RegExp(rule.value);
                return {
                    isValid: !value || regex.test(value),
                    message: this.errorMessages.pattern
                };
                
            case 'number':
                return {
                    isValid: !value || !isNaN(value),
                    message: this.errorMessages.number
                };
                
            case 'min':
                return {
                    isValid: !value || parseFloat(value) >= rule.value,
                    message: this.errorMessages.min.replace('{min}', rule.value)
                };
                
            case 'max':
                return {
                    isValid: !value || parseFloat(value) <= rule.value,
                    message: this.errorMessages.max.replace('{max}', rule.value)
                };
                
            case 'equalTo':
                const targetField = this.form.querySelector(rule.value);
                return {
                    isValid: !value || value === targetField?.value,
                    message: this.errorMessages.equalTo.replace('{target}', rule.value)
                };
                
            default:
                return { isValid: true };
        }
    }
    
    showFieldError(field, message) {
        const group = field.closest('.mb-3, .form-group');
        const errorFeedback = group.querySelector('.invalid-feedback');
        const successIcon = group.querySelector('.success-icon');
        const errorIcon = group.querySelector('.error-icon');
        
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
        
        if (errorFeedback) {
            errorFeedback.textContent = message;
        }
        
        if (successIcon) successIcon.style.display = 'none';
        if (errorIcon) errorIcon.style.display = 'block';
        
        // Shake animation
        this.animateField(field, 'shake');
        
        this.validationResults.set(field.name || field.id, false);
    }
    
    showFieldSuccess(field) {
        if (!this.options.showSuccessState) return;
        
        const group = field.closest('.mb-3, .form-group');
        const successIcon = group.querySelector('.success-icon');
        const errorIcon = group.querySelector('.error-icon');
        
        field.classList.add('is-valid');
        field.classList.remove('is-invalid');
        
        if (successIcon) successIcon.style.display = 'block';
        if (errorIcon) errorIcon.style.display = 'none';
        
        // Success animation
        this.animateField(field, 'success');
        
        this.validationResults.set(field.name || field.id, true);
    }
    
    clearFieldState(field) {
        field.classList.remove('is-valid', 'is-invalid');
        
        const group = field.closest('.mb-3, .form-group');
        const icons = group.querySelectorAll('.validation-icon');
        icons.forEach(icon => icon.style.display = 'none');
    }
    
    showLoadingState(field) {
        const group = field.closest('.mb-3, .form-group');
        const loadingIcon = group.querySelector('.loading-icon');
        const otherIcons = group.querySelectorAll('.success-icon, .error-icon');
        
        otherIcons.forEach(icon => icon.style.display = 'none');
        if (loadingIcon) loadingIcon.style.display = 'block';
    }
    
    hideLoadingState(field) {
        const group = field.closest('.mb-3, .form-group');
        const loadingIcon = group.querySelector('.loading-icon');
        
        if (loadingIcon) loadingIcon.style.display = 'none';
    }
    
    animateField(field, type) {
        const animationClass = type === 'shake' ? 'validation-shake' : 'validation-success';
        
        field.classList.add(animationClass);
        setTimeout(() => {
            field.classList.remove(animationClass);
        }, this.options.animationDuration);
    }
    
    debounceValidation(field) {
        const fieldName = field.name || field.id;
        
        if (this.debounceTimers.has(fieldName)) {
            clearTimeout(this.debounceTimers.get(fieldName));
        }
        
        const timer = setTimeout(() => {
            this.validateField(field);
        }, this.options.debounceDelay);
        
        this.debounceTimers.set(fieldName, timer);
    }
    
    isValidatableField(field) {
        return field.tagName === 'INPUT' || field.tagName === 'SELECT' || field.tagName === 'TEXTAREA';
    }
    
    handleSuccessfulValidation() {
        // Show success message
        this.showSuccessMessage('Form validated successfully!');
        
        // Submit form
        this.submitForm();
    }
    
    handleValidationErrors() {
        // Focus first invalid field
        const firstInvalidField = this.form.querySelector('.is-invalid');
        if (firstInvalidField) {
            firstInvalidField.focus();
            firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Show error summary
        this.showErrorSummary();
    }
    
    showErrorSummary() {
        const invalidFields = this.form.querySelectorAll('.is-invalid');
        const errorCount = invalidFields.length;
        
        if (errorCount > 0) {
            const message = `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting.`;
            this.showErrorMessage(message);
        }
    }
    
    submitForm() {
        // Add loading state to submit button
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
        }
        
        // Actually submit the form
        this.form.submit();
    }
    
    showSuccessMessage(message) {
        this.createToast('Success', message, 'success');
    }
    
    showErrorMessage(message) {
        this.createToast('Error', message, 'danger');
    }
    
    createToast(title, message, type) {
        // Reuse toast creation from search.js or create new implementation
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong><br>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        toastContainer.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }
    
    addValidationStyles() {
        if (document.getElementById('validation-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'validation-styles';
        styles.textContent = `
            .validation-shake {
                animation: shake 0.3s ease-in-out;
            }
            
            .validation-success {
                animation: successPulse 0.5s ease-in-out;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes successPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            .password-strength .strength-meter {
                height: 4px;
                background-color: #e9ecef;
                border-radius: 2px;
                overflow: hidden;
            }
            
            .password-strength .strength-bar {
                height: 100%;
                transition: width 0.3s ease, background-color 0.3s ease;
                border-radius: 2px;
            }
            
            .validation-icons {
                z-index: 10;
            }
            
            .validation-icon {
                transition: all 0.2s ease;
            }
            
            .email-suggestions {
                animation: slideDown 0.3s ease-out;
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
        `;
        
        document.head.appendChild(styles);
    }
    
    getDefaultMessage(rule) {
        return this.errorMessages[rule.type] || 'Invalid input';
    }
    
    destroy() {
        // Clear all timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        
        // Remove event listeners
        // Note: In a real implementation, you'd store references to bound functions
        // and remove them explicitly
    }
}

// Auto-initialize form validators
document.addEventListener('DOMContentLoaded', () => {
    // Initialize validators for all forms with the data-validate attribute
    document.querySelectorAll('form[data-validate]').forEach(form => {
        new FormValidator(form);
    });
});

// Export for global use
window.FormValidator = FormValidator;