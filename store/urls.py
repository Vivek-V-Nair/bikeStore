from django.urls import path
from . import views

app_name = 'store'

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    
    # Bike URLs
    path('bikes/', views.BikeListView.as_view(), name='bike_list'),
    path('bikes/<int:pk>/', views.BikeDetailView.as_view(), name='bike_detail'),
    path('bikes/add/', views.BikeCreateView.as_view(), name='bike_create'),
    path('bikes/<int:pk>/edit/', views.BikeUpdateView.as_view(), name='bike_update'),
    path('bikes/<int:pk>/delete/', views.BikeDeleteView.as_view(), name='bike_delete'),
    
    # Customer URLs
    path('customers/', views.CustomerListView.as_view(), name='customer_list'),
    path('customers/<int:pk>/', views.CustomerDetailView.as_view(), name='customer_detail'),
    path('customers/add/', views.CustomerCreateView.as_view(), name='customer_create'),
    path('customers/<int:pk>/edit/', views.CustomerUpdateView.as_view(), name='customer_update'),
    path('customers/<int:pk>/delete/', views.CustomerDeleteView.as_view(), name='customer_delete'),
    
    # Sale URLs
    path('sales/', views.SaleListView.as_view(), name='sale_list'),
    path('sales/<int:pk>/', views.SaleDetailView.as_view(), name='sale_detail'),
    path('sales/add/', views.SaleCreateView.as_view(), name='sale_create'),
    
    # Supplier URLs
    path('suppliers/', views.SupplierListView.as_view(), name='supplier_list'),
    path('suppliers/<int:pk>/', views.SupplierDetailView.as_view(), name='supplier_detail'),
    path('suppliers/add/', views.SupplierCreateView.as_view(), name='supplier_create'),
    path('suppliers/<int:pk>/edit/', views.SupplierUpdateView.as_view(), name='supplier_update'),
    path('suppliers/<int:pk>/delete/', views.SupplierDeleteView.as_view(), name='supplier_delete'),
    
    # Reports
    path('reports/', views.reports, name='reports'),
    
    # API URLs
    path('api/bike/<int:bike_id>/price/', views.api_bike_price, name='api_bike_price'),
    path('api/dashboard/', views.api_dashboard_data, name='api_dashboard'),
    path('api/sales-by-bike-type/', views.api_sales_by_bike_type, name='api_sales_by_bike_type'),
    path('api/bike-inventory/', views.api_bike_inventory, name='api_bike_inventory'),
]