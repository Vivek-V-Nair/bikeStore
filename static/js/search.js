// Professional Search and Filtering System
// Real-time search with debouncing, fuzzy matching, and smart filters

class SearchManager {
    constructor(options = {}) {
        this.options = {
            debounceTime: 300,
            minSearchLength: 2,
            highlightClass: 'search-highlight',
            ...options
        };
        
        this.searchTimeout = null;
        this.cache = new Map();
        this.filters = new Map();
        this.sortOptions = {
            field: 'name',
            order: 'asc'
        };
        
        this.init();
    }
    
    init() {
        this.setupSearchInput();
        this.setupFilters();
        this.setupSorting();
        this.setupKeyboardShortcuts();
        this.setupAutoComplete();
    }
    
    setupSearchInput() {
        const searchInputs = document.querySelectorAll('.search-input');
        
        searchInputs.forEach(input => {
            // Create search wrapper with advanced features
            this.enhanceSearchInput(input);
            
            input.addEventListener('input', (e) => {
                this.handleSearch(e.target.value, e.target);
            });
            
            input.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
            
            // Add search suggestions
            input.addEventListener('focus', () => {
                this.showSearchSuggestions(input);
            });
        });
    }
    
    enhanceSearchInput(input) {
        const wrapper = document.createElement('div');
        wrapper.className = 'search-wrapper position-relative';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        
        // Add search icon
        const searchIcon = document.createElement('i');
        searchIcon.className = 'fas fa-search search-icon';
        wrapper.appendChild(searchIcon);
        
        // Add clear button
        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'btn btn-sm search-clear';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.style.display = 'none';
        wrapper.appendChild(clearBtn);
        
        clearBtn.addEventListener('click', () => {
            input.value = '';
            this.clearSearch();
            clearBtn.style.display = 'none';
            input.focus();
        });
        
        // Show/hide clear button
        input.addEventListener('input', () => {
            clearBtn.style.display = input.value ? 'block' : 'none';
        });
        
        // Add suggestions dropdown
        const suggestions = document.createElement('div');
        suggestions.className = 'search-suggestions dropdown-menu';
        wrapper.appendChild(suggestions);
    }
    
    handleSearch(query, inputElement) {
        clearTimeout(this.searchTimeout);
        
        // Show loading indicator
        this.showSearchLoading(inputElement);
        
        this.searchTimeout = setTimeout(() => {
            if (query.length >= this.options.minSearchLength) {
                this.performSearch(query, inputElement);
            } else if (query.length === 0) {
                this.clearSearch();
            }
            this.hideSearchLoading(inputElement);
        }, this.options.debounceTime);
    }
    
    performSearch(query, inputElement) {
        const searchType = inputElement.dataset.searchType || 'general';
        const targetContainer = inputElement.dataset.targetContainer;
        
        // Check cache first
        const cacheKey = `${searchType}_${query}`;
        if (this.cache.has(cacheKey)) {
            this.displayResults(this.cache.get(cacheKey), targetContainer, query);
            return;
        }
        
        // Perform AJAX search
        this.searchAPI(query, searchType, targetContainer);
    }
    
    searchAPI(query, searchType, targetContainer) {
        const url = `/api/search/${searchType}/`;
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify({
                query: query,
                filters: Object.fromEntries(this.filters),
                sort: this.sortOptions
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Cache results
                this.cache.set(`${searchType}_${query}`, data.results);
                this.displayResults(data.results, targetContainer, query);
                this.updateSearchSuggestions(data.suggestions);
            } else {
                this.showSearchError(data.message);
            }
        })
        .catch(error => {
            console.error('Search error:', error);
            this.showSearchError('Search failed. Please try again.');
        });
    }
    
    displayResults(results, targetContainer, query) {
        const container = document.querySelector(targetContainer || '.search-results');
        if (!container) return;
        
        // Animate out old results
        container.style.opacity = '0.5';
        
        setTimeout(() => {
            container.innerHTML = '';
            
            if (results.length === 0) {
                this.showNoResults(container, query);
            } else {
                this.renderResults(results, container, query);
            }
            
            // Animate in new results
            container.style.opacity = '1';
            this.highlightSearchTerms(container, query);
        }, 150);
    }
    
    renderResults(results, container, query) {
        const resultsList = document.createElement('div');
        resultsList.className = 'search-results-list';
        
        results.forEach((item, index) => {
            const resultItem = this.createResultItem(item, index);
            resultsList.appendChild(resultItem);
        });
        
        container.appendChild(resultsList);
        this.addResultsCount(container, results.length, query);
        this.animateResults(resultsList);
    }
    
    createResultItem(item, index) {
        const div = document.createElement('div');
        div.className = 'search-result-item p-3 border rounded mb-2 bg-dark border-secondary';
        div.style.animationDelay = `${index * 50}ms`;
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1 text-light">${item.title}</h6>
                    <p class="mb-1 text-muted small">${item.description}</p>
                    <div class="search-metadata">
                        ${item.metadata ? this.renderMetadata(item.metadata) : ''}
                    </div>
                </div>
                <div class="search-actions">
                    ${this.renderResultActions(item)}
                </div>
            </div>
        `;
        
        // Add click handler
        div.addEventListener('click', () => {
            this.handleResultClick(item);
        });
        
        return div;
    }
    
    renderMetadata(metadata) {
        return Object.entries(metadata)
            .map(([key, value]) => `<span class="badge bg-secondary me-1">${key}: ${value}</span>`)
            .join('');
    }
    
    renderResultActions(item) {
        const actions = [];
        
        if (item.viewUrl) {
            actions.push(`<a href="${item.viewUrl}" class="btn btn-sm btn-outline-primary">View</a>`);
        }
        
        if (item.editUrl) {
            actions.push(`<a href="${item.editUrl}" class="btn btn-sm btn-outline-secondary">Edit</a>`);
        }
        
        return actions.join(' ');
    }
    
    highlightSearchTerms(container, query) {
        const terms = query.toLowerCase().split(' ').filter(term => term.length > 1);
        
        terms.forEach(term => {
            this.highlightTerm(container, term);
        });
    }
    
    highlightTerm(container, term) {
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent.toLowerCase().includes(term)) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(textNode => {
            const parent = textNode.parentNode;
            if (parent.classList.contains(this.options.highlightClass)) return;
            
            const text = textNode.textContent;
            const regex = new RegExp(`(${term})`, 'gi');
            const highlightedText = text.replace(regex, `<mark class="${this.options.highlightClass}">$1</mark>`);
            
            if (highlightedText !== text) {
                const span = document.createElement('span');
                span.innerHTML = highlightedText;
                parent.replaceChild(span, textNode);
            }
        });
    }
    
    setupFilters() {
        const filterElements = document.querySelectorAll('.search-filter');
        
        filterElements.forEach(filter => {
            filter.addEventListener('change', (e) => {
                const filterName = e.target.name;
                const filterValue = e.target.value;
                
                if (filterValue) {
                    this.filters.set(filterName, filterValue);
                } else {
                    this.filters.delete(filterName);
                }
                
                this.refreshSearch();
            });
        });
    }
    
    setupSorting() {
        const sortElements = document.querySelectorAll('.search-sort');
        
        sortElements.forEach(sort => {
            sort.addEventListener('change', (e) => {
                const [field, order] = e.target.value.split('_');
                this.sortOptions.field = field;
                this.sortOptions.order = order;
                
                this.refreshSearch();
            });
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + F for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                const searchInput = document.querySelector('.search-input');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Escape to clear search
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }
    
    setupAutoComplete() {
        // Implement autocomplete suggestions based on search history
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    }
    
    showSearchSuggestions(input) {
        const wrapper = input.closest('.search-wrapper');
        const suggestions = wrapper.querySelector('.search-suggestions');
        
        if (this.searchHistory.length === 0) return;
        
        suggestions.innerHTML = '';
        suggestions.classList.add('show');
        
        // Show recent searches
        const recentSearches = this.searchHistory.slice(-5).reverse();
        recentSearches.forEach(term => {
            const suggestion = document.createElement('button');
            suggestion.type = 'button';
            suggestion.className = 'dropdown-item';
            suggestion.innerHTML = `<i class="fas fa-history me-2"></i>${term}`;
            
            suggestion.addEventListener('click', () => {
                input.value = term;
                this.handleSearch(term, input);
                suggestions.classList.remove('show');
            });
            
            suggestions.appendChild(suggestion);
        });
    }
    
    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.push(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory.shift();
            }
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        }
    }
    
    showSearchLoading(input) {
        const wrapper = input.closest('.search-wrapper');
        const icon = wrapper.querySelector('.search-icon');
        icon.className = 'fas fa-spinner fa-spin search-icon';
    }
    
    hideSearchLoading(input) {
        const wrapper = input.closest('.search-wrapper');
        const icon = wrapper.querySelector('.search-icon');
        icon.className = 'fas fa-search search-icon';
    }
    
    showNoResults(container, query) {
        container.innerHTML = `
            <div class="no-results text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No results found</h5>
                <p class="text-muted">No items match your search for "<strong>${query}</strong>"</p>
                <button class="btn btn-outline-primary" onclick="searchManager.clearSearch()">
                    Clear Search
                </button>
            </div>
        `;
    }
    
    showSearchError(message) {
        const toast = this.createToast('Error', message, 'danger');
        this.showToast(toast);
    }
    
    createToast(title, message, type = 'info') {
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
        
        return toast;
    }
    
    showToast(toast) {
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
    
    refreshSearch() {
        const activeInput = document.querySelector('.search-input:focus');
        if (activeInput && activeInput.value) {
            this.performSearch(activeInput.value, activeInput);
        }
    }
    
    clearSearch() {
        // Clear all search inputs
        document.querySelectorAll('.search-input').forEach(input => {
            input.value = '';
        });
        
        // Clear results
        document.querySelectorAll('.search-results').forEach(container => {
            container.innerHTML = '';
        });
        
        // Hide suggestions
        document.querySelectorAll('.search-suggestions').forEach(suggestions => {
            suggestions.classList.remove('show');
        });
        
        // Clear cache
        this.cache.clear();
        
        // Reset filters
        this.filters.clear();
        document.querySelectorAll('.search-filter').forEach(filter => {
            filter.value = '';
        });
    }
    
    handleResultClick(item) {
        // Add to search history
        this.addToSearchHistory(item.title);
        
        // Track click for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'search_result_click', {
                'search_term': item.title,
                'result_type': item.type
            });
        }
    }
    
    animateResults(container) {
        const items = container.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }
    
    addResultsCount(container, count, query) {
        const countElement = document.createElement('div');
        countElement.className = 'search-results-count text-muted mb-3';
        countElement.innerHTML = `Found <strong>${count}</strong> results for "<strong>${query}</strong>"`;
        container.insertBefore(countElement, container.firstChild);
    }
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    }
}

// Initialize search manager when DOM is loaded
let searchManager;
document.addEventListener('DOMContentLoaded', () => {
    searchManager = new SearchManager();
});

// Export for global use
window.SearchManager = SearchManager;