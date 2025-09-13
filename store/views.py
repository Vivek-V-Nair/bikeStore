from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.db.models import Q, Sum, F, Count
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import Bike, Customer, Sale, Supplier, Inventory
from .forms import BikeForm, CustomerForm, SaleForm, SupplierForm, InventoryForm, BikeSearchForm
from decimal import Decimal
import json


# Dashboard View
def dashboard(request):
    """Main dashboard view with statistics and charts"""
    context = {
        'total_bikes': Bike.objects.count(),
        'total_customers': Customer.objects.count(),
        'total_sales': Sale.objects.count(),
        'total_revenue': Sale.objects.aggregate(
            revenue=Sum(F('quantity') * F('sale_price'))
        )['revenue'] or Decimal('0.00'),
        'low_stock_bikes': Bike.objects.filter(stock_quantity__lt=5),
        'recent_sales': Sale.objects.select_related('customer', 'bike')[:5],
        'sales_by_type': Bike.objects.values('type').annotate(
            total_sales=Count('sales'),
            total_revenue=Sum(F('sales__quantity') * F('sales__sale_price'))
        ).filter(total_sales__gt=0)
    }
    return render(request, 'store/dashboard.html', context)


# Bike Views
class BikeListView(ListView):
    """List all bikes with search and filter functionality"""
    model = Bike
    template_name = 'store/bike_list.html'
    context_object_name = 'bikes'
    paginate_by = 12

    def get_queryset(self):
        queryset = Bike.objects.select_related('supplier').all()
        form = BikeSearchForm(self.request.GET)
        
        if form.is_valid():
            search = form.cleaned_data.get('search')
            bike_type = form.cleaned_data.get('type')
            min_price = form.cleaned_data.get('min_price')
            max_price = form.cleaned_data.get('max_price')
            in_stock_only = form.cleaned_data.get('in_stock_only')

            if search:
                queryset = queryset.filter(
                    Q(brand__icontains=search) |
                    Q(model__icontains=search) |
                    Q(type__icontains=search)
                )
            
            if bike_type:
                queryset = queryset.filter(type=bike_type)
            
            if min_price:
                queryset = queryset.filter(price__gte=min_price)
            
            if max_price:
                queryset = queryset.filter(price__lte=max_price)
            
            if in_stock_only:
                queryset = queryset.filter(stock_quantity__gt=0)

        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_form'] = BikeSearchForm(self.request.GET)
        return context


class BikeDetailView(DetailView):
    """Detailed view of a single bike"""
    model = Bike
    template_name = 'store/bike_detail.html'
    context_object_name = 'bike'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        bike = self.get_object()
        context['recent_sales'] = bike.sales.select_related('customer')[:5]
        context['total_sold'] = bike.sales.aggregate(
            total=Sum('quantity')
        )['total'] or 0
        return context


class BikeCreateView(CreateView):
    """Create a new bike"""
    model = Bike
    form_class = BikeForm
    template_name = 'store/bike_form.html'

    def form_valid(self, form):
        messages.success(self.request, f'Bike "{form.instance}" has been added successfully!')
        return super().form_valid(form)


class BikeUpdateView(UpdateView):
    """Update an existing bike"""
    model = Bike
    form_class = BikeForm
    template_name = 'store/bike_form.html'

    def form_valid(self, form):
        messages.success(self.request, f'Bike "{form.instance}" has been updated successfully!')
        return super().form_valid(form)


class BikeDeleteView(DeleteView):
    """Delete a bike"""
    model = Bike
    template_name = 'store/bike_confirm_delete.html'
    success_url = reverse_lazy('store:bike_list')

    def delete(self, request, *args, **kwargs):
        bike = self.get_object()
        messages.success(request, f'Bike "{bike}" has been deleted successfully!')
        return super().delete(request, *args, **kwargs)


# Customer Views
class CustomerListView(ListView):
    """List all customers"""
    model = Customer
    template_name = 'store/customer_list.html'
    context_object_name = 'customers'
    paginate_by = 20

    def get_queryset(self):
        queryset = Customer.objects.all()
        search = self.request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )
        return queryset


class CustomerDetailView(DetailView):
    """Detailed view of a single customer"""
    model = Customer
    template_name = 'store/customer_detail.html'
    context_object_name = 'customer'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        customer = self.get_object()
        context['sales'] = customer.sales.select_related('bike')[:10]
        context['total_spent'] = customer.total_purchases
        context['total_bikes'] = customer.sales.aggregate(
            total=Sum('quantity')
        )['total'] or 0
        return context


class CustomerCreateView(CreateView):
    """Create a new customer"""
    model = Customer
    form_class = CustomerForm
    template_name = 'store/customer_form.html'

    def form_valid(self, form):
        messages.success(self.request, f'Customer "{form.instance.name}" has been added successfully!')
        return super().form_valid(form)


class CustomerUpdateView(UpdateView):
    """Update an existing customer"""
    model = Customer
    form_class = CustomerForm
    template_name = 'store/customer_form.html'

    def form_valid(self, form):
        messages.success(self.request, f'Customer "{form.instance.name}" has been updated successfully!')
        return super().form_valid(form)


class CustomerDeleteView(DeleteView):
    """Delete a customer"""
    model = Customer
    template_name = 'store/customer_confirm_delete.html'
    success_url = reverse_lazy('store:customer_list')

    def delete(self, request, *args, **kwargs):
        customer = self.get_object()
        messages.success(request, f'Customer "{customer.name}" has been deleted successfully!')
        return super().delete(request, *args, **kwargs)


# Sale Views
class SaleListView(ListView):
    """List all sales"""
    model = Sale
    template_name = 'store/sale_list.html'
    context_object_name = 'sales'
    paginate_by = 20

    def get_queryset(self):
        return Sale.objects.select_related('customer', 'bike').order_by('-sale_date')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_revenue'] = Sale.objects.aggregate(
            revenue=Sum(F('quantity') * F('sale_price'))
        )['revenue'] or Decimal('0.00')
        return context


class SaleDetailView(DetailView):
    """Detailed view of a single sale"""
    model = Sale
    template_name = 'store/sale_detail.html'
    context_object_name = 'sale'


class SaleCreateView(CreateView):
    """Create a new sale"""
    model = Sale
    form_class = SaleForm
    template_name = 'store/sale_form.html'

    def form_valid(self, form):
        try:
            response = super().form_valid(form)
            messages.success(
                self.request, 
                f'Sale recorded successfully! Total: Rs {form.instance.total_amount:,.2f}'
            )
            return response
        except ValueError as e:
            messages.error(self.request, str(e))
            return self.form_invalid(form)

    def get_success_url(self):
        return reverse_lazy('store:sale_detail', kwargs={'pk': self.object.pk})


# Supplier Views
class SupplierListView(ListView):
    """List all suppliers"""
    model = Supplier
    template_name = 'store/supplier_list.html'
    context_object_name = 'suppliers'
    paginate_by = 20


class SupplierDetailView(DetailView):
    """Detailed view of a single supplier"""
    model = Supplier
    template_name = 'store/supplier_detail.html'
    context_object_name = 'supplier'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        supplier = self.get_object()
        context['bikes'] = supplier.bike_set.all()
        return context


class SupplierCreateView(CreateView):
    """Create a new supplier"""
    model = Supplier
    form_class = SupplierForm
    template_name = 'store/supplier_form.html'

    def form_valid(self, form):
        messages.success(self.request, f'Supplier "{form.instance.name}" has been added successfully!')
        return super().form_valid(form)


class SupplierUpdateView(UpdateView):
    """Update an existing supplier"""
    model = Supplier
    form_class = SupplierForm
    template_name = 'store/supplier_form.html'

    def form_valid(self, form):
        messages.success(self.request, f'Supplier "{form.instance.name}" has been updated successfully!')
        return super().form_valid(form)


class SupplierDeleteView(DeleteView):
    """Delete a supplier"""
    model = Supplier
    template_name = 'store/supplier_confirm_delete.html'
    success_url = reverse_lazy('store:supplier_list')

    def delete(self, request, *args, **kwargs):
        supplier = self.get_object()
        messages.success(request, f'Supplier "{supplier.name}" has been deleted successfully!')
        return super().delete(request, *args, **kwargs)


# Reports and Analytics
def reports(request):
    """Generate various reports and analytics"""
    # Sales by month
    from django.db.models import DateTrunc
    monthly_sales = Sale.objects.annotate(
        month=DateTrunc('month', 'sale_date')
    ).values('month').annotate(
        total_sales=Count('id'),
        total_revenue=Sum(F('quantity') * F('sale_price'))
    ).order_by('month')

    # Top selling bikes
    top_bikes = Bike.objects.annotate(
        total_sold=Sum('sales__quantity'),
        total_revenue=Sum(F('sales__quantity') * F('sales__sale_price'))
    ).filter(total_sold__gt=0).order_by('-total_sold')[:10]

    # Top customers
    top_customers = Customer.objects.annotate(
        total_spent=Sum(F('sales__quantity') * F('sales__sale_price')),
        total_bikes=Sum('sales__quantity')
    ).filter(total_spent__gt=0).order_by('-total_spent')[:10]

    # Low stock alerts
    low_stock = Bike.objects.filter(stock_quantity__lt=5)

    context = {
        'monthly_sales': monthly_sales,
        'top_bikes': top_bikes,
        'top_customers': top_customers,
        'low_stock': low_stock,
        'total_revenue': Sale.objects.aggregate(
            revenue=Sum(F('quantity') * F('sale_price'))
        )['revenue'] or Decimal('0.00'),
        'total_bikes_sold': Sale.objects.aggregate(
            total=Sum('quantity')
        )['total'] or 0,
    }
    return render(request, 'store/reports.html', context)


# API Views for AJAX requests
def api_bike_price(request, bike_id):
    """Get bike price for sale form"""
    try:
        bike = Bike.objects.get(id=bike_id)
        return JsonResponse({
            'success': True,
            'price': float(bike.price),
            'stock': bike.stock_quantity
        })
    except Bike.DoesNotExist:
        return JsonResponse({'success': False})


def api_dashboard_data(request):
    """API endpoint for dashboard statistics"""
    data = {
        'total_bikes': Bike.objects.count(),
        'total_customers': Customer.objects.count(),
        'total_sales': Sale.objects.count(),
        'total_revenue': float(Sale.objects.aggregate(
            revenue=Sum(F('quantity') * F('sale_price'))
        )['revenue'] or Decimal('0.00')),
        'low_stock_count': Bike.objects.filter(stock_quantity__lt=5).count(),
        'sales_by_type': list(Bike.objects.values('type').annotate(
            count=Count('sales'),
            revenue=Sum(F('sales__quantity') * F('sales__sale_price'))
        ).filter(count__gt=0))
    }
    return JsonResponse(data)


def api_sales_by_bike_type(request):
    """API endpoint for sales by bike type chart"""
    sales_data = Sale.objects.select_related('bike').values('bike__type').annotate(
        total_sales=Count('id')
    ).order_by('-total_sales')
    
    # Convert to dictionary format expected by Chart.js
    chart_data = {}
    for item in sales_data:
        bike_type = item['bike__type']
        chart_data[bike_type] = item['total_sales']
    
    return JsonResponse(chart_data)


def api_bike_inventory(request):
    """API endpoint for bike inventory by type chart"""
    inventory_data = Bike.objects.values('type').annotate(
        total_stock=Sum('stock_quantity')
    ).order_by('-total_stock')
    
    # Convert to dictionary format expected by Chart.js
    chart_data = {}
    for item in inventory_data:
        bike_type = item['type']
        chart_data[bike_type] = item['total_stock'] or 0
    
    return JsonResponse(chart_data)
