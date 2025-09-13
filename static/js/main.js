// Main JavaScript for Bike Store Management System

$(document).ready(function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);

    // Confirmation dialogs for delete actions
    $('.delete-confirm').on('click', function(e) {
        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            e.preventDefault();
        }
    });

    // Form validation enhancement
    $('form').on('submit', function() {
        $(this).find('button[type="submit"]').prop('disabled', true).html(
            '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing...'
        );
    });

    // Search form auto-submit with delay
    let searchTimeout;
    $('.search-input').on('input', function() {
        clearTimeout(searchTimeout);
        const form = $(this).closest('form');
        searchTimeout = setTimeout(function() {
            form.submit();
        }, 500);
    });

    // Dynamic bike price update in sale form
    $('#id_bike').on('change', function() {
        const bikeId = $(this).val();
        if (bikeId) {
            $.ajax({
                url: `/api/bike/${bikeId}/price/`,
                method: 'GET',
                success: function(data) {
                    if (data.success) {
                        $('#id_sale_price').val(data.price);
                        $('#stock-info').html(`<small class="text-muted">Available stock: ${data.stock}</small>`);
                    }
                },
                error: function() {
                    console.error('Failed to fetch bike price');
                }
            });
        } else {
            $('#id_sale_price').val('');
            $('#stock-info').html('');
        }
    });

    // Quantity validation in sale form
    $('#id_quantity').on('input', function() {
        const quantity = parseInt($(this).val());
        const maxStock = parseInt($('#stock-info').text().match(/\d+/));
        
        if (quantity > maxStock) {
            $(this).addClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
            $(this).after('<div class="invalid-feedback">Quantity exceeds available stock</div>');
        } else {
            $(this).removeClass('is-invalid');
            $(this).siblings('.invalid-feedback').remove();
        }
    });

    // Table row hover effects
    $('.table tbody tr').hover(
        function() {
            $(this).addClass('table-active');
        },
        function() {
            $(this).removeClass('table-active');
        }
    );

    // Smooth scrolling for anchor links
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').animate({
                scrollTop: target.offset().top - 100
            }, 500);
        }
    });

    // Loading states for AJAX requests
    $(document).ajaxStart(function() {
        $('.loading-indicator').show();
    }).ajaxStop(function() {
        $('.loading-indicator').hide();
    });

    // Auto-refresh for dashboard (every 5 minutes)
    if (window.location.pathname === '/') {
        setInterval(function() {
            $.ajax({
                url: '/api/dashboard/',
                method: 'GET',
                success: function(data) {
                    updateDashboardStats(data);
                }
            });
        }, 300000); // 5 minutes
    }
});

// Function to update dashboard statistics
function updateDashboardStats(data) {
    if (data.total_bikes !== undefined) {
        $('#total-bikes').text(data.total_bikes);
    }
    if (data.total_customers !== undefined) {
        $('#total-customers').text(data.total_customers);
    }
    if (data.total_sales !== undefined) {
        $('#total-sales').text(data.total_sales);
    }
    if (data.total_revenue !== undefined) {
        $('#total-revenue').text('₹' + data.total_revenue.toLocaleString());
    }
}

// Function to format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Function to format numbers
function formatNumber(num) {
    return parseInt(num).toLocaleString('en-IN');
}

// Function to show success message
function showSuccessMessage(message) {
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    $('.container').first().prepend(alertHtml);
}

// Function to show error message
function showErrorMessage(message) {
    const alertHtml = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    $('.container').first().prepend(alertHtml);
}

// Function to validate form fields
function validateForm(formId) {
    let isValid = true;
    const form = $(formId);
    
    form.find('input[required], select[required], textarea[required]').each(function() {
        if (!$(this).val()) {
            $(this).addClass('is-invalid');
            isValid = false;
        } else {
            $(this).removeClass('is-invalid');
        }
    });
    
    return isValid;
}

// Function to reset form
function resetForm(formId) {
    const form = $(formId);
    form[0].reset();
    form.find('.is-invalid').removeClass('is-invalid');
    form.find('.invalid-feedback').remove();
}

// Export functions for global use
window.BikeStore = {
    formatCurrency: formatCurrency,
    formatNumber: formatNumber,
    showSuccessMessage: showSuccessMessage,
    showErrorMessage: showErrorMessage,
    validateForm: validateForm,
    resetForm: resetForm
};