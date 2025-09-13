from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import Bike, Customer, Sale, Supplier, Inventory


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'phone', 'bike_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'contact_person', 'email']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at']

    def bike_count(self, obj):
        count = obj.bike_set.count()
        if count > 0:
            url = reverse('admin:store_bike_changelist') + f'?supplier__id__exact={obj.id}'
            return format_html('<a href="{}">{} bikes</a>', url, count)
        return '0 bikes'
    bike_count.short_description = 'Bikes Supplied'


@admin.register(Bike)
class BikeAdmin(admin.ModelAdmin):
    list_display = ['brand', 'model', 'type', 'color', 'price', 'stock_quantity', 'stock_status', 'supplier', 'created_at']
    list_filter = ['type', 'supplier', 'created_at']
    search_fields = ['brand', 'model', 'color']
    ordering = ['brand', 'model']
    readonly_fields = ['created_at', 'updated_at']
    list_editable = ['price', 'stock_quantity']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('brand', 'model', 'type', 'color')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock_quantity', 'supplier')
        }),
        ('Description', {
            'fields': ('description',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def stock_status(self, obj):
        if obj.stock_quantity == 0:
            return format_html('<span style="color: red;">Out of Stock</span>')
        elif obj.stock_quantity < 5:
            return format_html('<span style="color: orange;">Low Stock ({})</span>', obj.stock_quantity)
        else:
            return format_html('<span style="color: green;">In Stock ({})</span>', obj.stock_quantity)
    stock_status.short_description = 'Stock Status'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('supplier')


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'total_purchases_display', 'purchase_count_display', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'phone']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at', 'total_purchases_display', 'purchase_count_display']

    fieldsets = (
        ('Personal Information', {
            'fields': ('name', 'email', 'phone', 'address')
        }),
        ('Purchase Statistics', {
            'fields': ('total_purchases_display', 'purchase_count_display'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def total_purchases_display(self, obj):
        total = obj.total_purchases
        return f'₹{total:,.2f}'
    total_purchases_display.short_description = 'Total Spent'

    def purchase_count_display(self, obj):
        count = obj.purchase_count
        if count > 0:
            url = reverse('admin:store_sale_changelist') + f'?customer__id__exact={obj.id}'
            return format_html('<a href="{}">{} purchases</a>', url, count)
        return '0 purchases'
    purchase_count_display.short_description = 'Number of Purchases'


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer', 'bike', 'quantity', 'sale_price', 'total_amount_display', 'sale_date']
    list_filter = ['sale_date', 'bike__type']
    search_fields = ['customer__name', 'bike__brand', 'bike__model']
    ordering = ['-sale_date']
    readonly_fields = ['sale_date', 'total_amount_display']
    
    fieldsets = (
        ('Sale Information', {
            'fields': ('customer', 'bike', 'quantity', 'sale_price')
        }),
        ('Additional Details', {
            'fields': ('notes',)
        }),
        ('Sale Summary', {
            'fields': ('total_amount_display', 'sale_date'),
            'classes': ('collapse',)
        }),
    )

    def total_amount_display(self, obj):
        return f'₹{obj.total_amount:,.2f}'
    total_amount_display.short_description = 'Total Amount'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('customer', 'bike')

    def save_model(self, request, obj, form, change):
        # Custom save logic if needed
        super().save_model(request, obj, form, change)


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['bike', 'current_stock', 'minimum_stock', 'reorder_point', 'stock_status_display', 'last_restocked']
    list_filter = ['last_restocked']
    search_fields = ['bike__brand', 'bike__model']
    ordering = ['bike__brand', 'bike__model']
    readonly_fields = ['stock_status_display']

    def current_stock(self, obj):
        return obj.bike.stock_quantity
    current_stock.short_description = 'Current Stock'

    def stock_status_display(self, obj):
        status = obj.stock_status
        if status == "Out of Stock":
            return format_html('<span style="color: red; font-weight: bold;">{}</span>', status)
        elif status == "Low Stock":
            return format_html('<span style="color: orange; font-weight: bold;">{}</span>', status)
        elif status == "Overstocked":
            return format_html('<span style="color: blue; font-weight: bold;">{}</span>', status)
        else:
            return format_html('<span style="color: green; font-weight: bold;">{}</span>', status)
    stock_status_display.short_description = 'Status'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('bike')


# Admin site customization
admin.site.site_header = "Bike Store Management System"
admin.site.site_title = "Bike Store Admin"
admin.site.index_title = "CBSE Class 12 Computer Science Project"
