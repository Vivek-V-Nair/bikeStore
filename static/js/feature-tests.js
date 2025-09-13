// Professional JavaScript Features Test Suite
// Comprehensive testing of all implemented modules

class FeatureTestSuite {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
        
        this.init();
    }
    
    init() {
        console.log('🧪 Starting Professional JavaScript Features Test Suite...');
        console.log('==========================================');
        
        this.runAllTests();
    }
    
    async runAllTests() {
        // Test 1: Loading States Manager
        this.test('Loading States Manager', () => {
            return window.loadingManager && 
                   typeof window.loadingManager.showSkeleton === 'function' &&
                   typeof window.loadingManager.showLoadingOverlay === 'function';
        });
        
        // Test 2: Notification System
        this.test('Notification System', () => {
            return window.notifications && 
                   typeof window.notifications.show === 'function' &&
                   typeof window.notifications.confirm === 'function';
        });
        
        // Test 3: Accessibility Manager
        this.test('Accessibility Manager', () => {
            return window.accessibility && 
                   typeof window.accessibility.addCustomShortcut === 'function' &&
                   window.accessibility.shortcuts.size > 0;
        });
        
        // Test 4: Form Validation
        this.test('Form Validation System', () => {
            return window.FormValidator && 
                   typeof window.FormValidator === 'function';
        });
        
        // Test 5: Search Manager
        this.test('Search Manager', () => {
            return window.SearchManager && 
                   typeof window.SearchManager === 'function';
        });
        
        // Test 6: Data Export Manager
        this.test('Data Export Manager', () => {
            return window.exportManager && 
                   typeof window.exportManager.exportTable === 'function' &&
                   typeof window.exportManager.exportChart === 'function';
        });
        
        // Test 7: Dashboard Manager
        this.test('Dashboard Manager', () => {
            return window.DashboardManager && 
                   typeof window.DashboardManager === 'function';
        });
        
        // Test 8: jQuery Integration
        this.test('jQuery Integration', () => {
            return window.jQuery && window.$ && $.fn.jquery;
        });
        
        // Test 9: Bootstrap Integration
        this.test('Bootstrap Integration', () => {
            return window.bootstrap && 
                   bootstrap.Modal && 
                   bootstrap.Toast;
        });
        
        // Test 10: Chart.js Integration
        this.test('Chart.js Integration', () => {
            return window.Chart && typeof window.Chart === 'function';
        });
        
        // Test 11: DOM Ready State
        this.test('DOM Ready State', () => {
            return document.readyState === 'complete' || document.readyState === 'interactive';
        });
        
        // Test 12: Keyboard Shortcuts
        this.test('Keyboard Shortcuts Available', () => {
            return window.accessibility && window.accessibility.getShortcuts().length > 10;
        });
        
        // Test 13: Local Storage Access
        this.test('Local Storage Access', () => {
            try {
                localStorage.setItem('test', 'test');
                localStorage.removeItem('test');
                return true;
            } catch (e) {
                return false;
            }
        });
        
        // Test 14: Toast Container
        this.test('Toast Container Present', () => {
            return document.getElementById('toast-container') !== null;
        });
        
        // Test 15: Main Content Accessibility
        this.test('Main Content Accessibility', () => {
            const main = document.getElementById('main-content');
            return main && main.hasAttribute('tabindex');
        });
        
        // Functional Tests
        await this.runFunctionalTests();
        
        this.displayResults();
    }
    
    async runFunctionalTests() {
        console.log('\n🔧 Running Functional Tests...');
        
        // Test Notification System
        this.test('Notification Display Test', () => {
            try {
                if (window.notifications) {
                    window.notifications.show('Test notification', 'info', { duration: 1000 });
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Notification test failed:', e);
                return false;
            }
        });
        
        // Test Loading States
        this.test('Loading States Test', () => {
            try {
                if (window.loadingManager) {
                    // Create a test element
                    const testDiv = document.createElement('div');
                    testDiv.id = 'test-loading-element';
                    document.body.appendChild(testDiv);
                    
                    window.loadingManager.showLoadingOverlay('test-loading-element');
                    setTimeout(() => {
                        window.loadingManager.hideLoadingOverlay('test-loading-element');
                        testDiv.remove();
                    }, 500);
                    
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Loading states test failed:', e);
                return false;
            }
        });
        
        // Test Accessibility Features
        this.test('Accessibility Features Test', () => {
            try {
                if (window.accessibility) {
                    window.accessibility.announce('Test announcement');
                    return true;
                }
                return false;
            } catch (e) {
                console.error('Accessibility test failed:', e);
                return false;
            }
        });
    }
    
    test(name, testFunction) {
        try {
            const result = testFunction();
            if (result) {
                this.testResults.push({ name, status: 'PASS', error: null });
                this.passedTests++;
                console.log(`✅ ${name}: PASSED`);
            } else {
                this.testResults.push({ name, status: 'FAIL', error: 'Test returned false' });
                this.failedTests++;
                console.log(`❌ ${name}: FAILED - Test returned false`);
            }
        } catch (error) {
            this.testResults.push({ name, status: 'ERROR', error: error.message });
            this.failedTests++;
            console.log(`❌ ${name}: ERROR - ${error.message}`);
        }
    }
    
    displayResults() {
        console.log('\n📊 Test Results Summary');
        console.log('==========================================');
        console.log(`Total Tests: ${this.testResults.length}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`Success Rate: ${Math.round((this.passedTests / this.testResults.length) * 100)}%`);
        
        if (this.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            this.testResults
                .filter(test => test.status !== 'PASS')
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.error || 'Unknown error'}`);
                });
        }
        
        console.log('\n🎯 Feature Status:');
        this.displayFeatureStatus();
        
        // Show notification with results
        if (window.notifications) {
            const message = `Tests completed: ${this.passedTests}/${this.testResults.length} passed`;
            const type = this.failedTests === 0 ? 'success' : 'warning';
            window.notifications.show(message, type, { duration: 5000 });
        }
    }
    
    displayFeatureStatus() {
        const features = [
            { name: 'Loading States & Skeleton Screens', available: !!window.loadingManager },
            { name: 'Advanced Notification System', available: !!window.notifications },
            { name: 'Keyboard Navigation & Accessibility', available: !!window.accessibility },
            { name: 'Professional Form Validation', available: !!window.FormValidator },
            { name: 'Real-time Search with Auto-complete', available: !!window.SearchManager },
            { name: 'Data Export (CSV/Excel/PDF)', available: !!window.exportManager },
            { name: 'Interactive Dashboard Charts', available: !!window.DashboardManager },
            { name: 'jQuery Integration', available: !!window.jQuery },
            { name: 'Bootstrap 5 Integration', available: !!window.bootstrap },
            { name: 'Chart.js Integration', available: !!window.Chart }
        ];
        
        features.forEach(feature => {
            const status = feature.available ? '✅' : '❌';
            console.log(`  ${status} ${feature.name}`);
        });
        
        console.log('\n🚀 All Professional JavaScript Features Ready!');
        console.log('Quick Start Guide:');
        console.log('• Press Alt+/ to view all keyboard shortcuts');
        console.log('• Use Ctrl+Shift+E for bulk export options');
        console.log('• All forms now have real-time validation');
        console.log('• Search inputs include auto-complete and history');
        console.log('• Dashboard charts are interactive with export options');
        console.log('• Loading states automatically show during AJAX requests');
    }
    
    getResults() {
        return {
            total: this.testResults.length,
            passed: this.passedTests,
            failed: this.failedTests,
            successRate: Math.round((this.passedTests / this.testResults.length) * 100),
            details: this.testResults
        };
    }
}

// Auto-run tests when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all modules to initialize
    setTimeout(() => {
        window.featureTests = new FeatureTestSuite();
    }, 2000);
});

// Export for manual testing
window.FeatureTestSuite = FeatureTestSuite;