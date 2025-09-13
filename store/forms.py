from django import forms
from django.core.exceptions import ValidationError
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Field
from crispy_forms.bootstrap import FormActions
from .models import Bike, Customer, Sale, Supplier, Inventory


class BikeForm(forms.ModelForm):
    """Form for adding/editing bikes"""
    
    class Meta:
        model = Bike
        fields = ['brand', 'model', 'type', 'price', 'stock_quantity', 'color', 'description', 'supplier']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 3}),
            'price': forms.NumberInput(attrs={'step': '0.01', 'min': '0.01'}),
            'stock_quantity': forms.NumberInput(attrs={'min': '0'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('brand', css_class='form-group col-md-6 mb-3'),
                Column('model', css_class='form-group col-md-6 mb-3'),
            ),
            Row(
                Column('type', css_class='form-group col-md-4 mb-3'),
                Column('color', css_class='form-group col-md-4 mb-3'),
                Column('supplier', css_class='form-group col-md-4 mb-3'),
            ),
            Row(
                Column('price', css_class='form-group col-md-6 mb-3'),
                Column('stock_quantity', css_class='form-group col-md-6 mb-3'),
            ),
            Field('description', css_class='form-group mb-3'),
            FormActions(
                Submit('submit', 'Save Bike', css_class='btn btn-primary'),
            )
        )

    def clean_price(self):
        price = self.cleaned_data.get('price')
        if price and price <= 0:
            raise ValidationError("Price must be greater than 0")
        return price


class CustomerForm(forms.ModelForm):
    """Form for adding/editing customers"""
    
    class Meta:
        model = Customer
        fields = ['name', 'email', 'phone', 'address']
        widgets = {
            'address': forms.Textarea(attrs={'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('name', css_class='form-group col-md-6 mb-3'),
                Column('email', css_class='form-group col-md-6 mb-3'),
            ),
            Field('phone', css_class='form-group mb-3'),
            Field('address', css_class='form-group mb-3'),
            FormActions(
                Submit('submit', 'Save Customer', css_class='btn btn-success'),
            )
        )

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if email:
            # Check if email exists for other customers (excluding current instance)
            existing = Customer.objects.filter(email=email)
            if self.instance.pk:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise ValidationError("A customer with this email already exists.")
        return email


class SaleForm(forms.ModelForm):
    """Form for recording sales"""
    
    class Meta:
        model = Sale
        fields = ['customer', 'bike', 'quantity', 'sale_price', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 3}),
            'sale_price': forms.NumberInput(attrs={'step': '0.01', 'min': '0.01'}),
            'quantity': forms.NumberInput(attrs={'min': '1'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Filter bikes to show only those in stock
        self.fields['bike'].queryset = Bike.objects.filter(stock_quantity__gt=0)
        
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('customer', css_class='form-group col-md-6 mb-3'),
                Column('bike', css_class='form-group col-md-6 mb-3'),
            ),
            Row(
                Column('quantity', css_class='form-group col-md-6 mb-3'),
                Column('sale_price', css_class='form-group col-md-6 mb-3'),
            ),
            Field('notes', css_class='form-group mb-3'),
            FormActions(
                Submit('submit', 'Record Sale', css_class='btn btn-info'),
            )
        )

    def clean(self):
        cleaned_data = super().clean()
        bike = cleaned_data.get('bike')
        quantity = cleaned_data.get('quantity')
        
        if bike and quantity:
            if quantity > bike.stock_quantity:
                raise ValidationError(
                    f"Insufficient stock for {bike}. Available: {bike.stock_quantity}"
                )
        
        return cleaned_data

    def clean_quantity(self):
        quantity = self.cleaned_data.get('quantity')
        if quantity and quantity <= 0:
            raise ValidationError("Quantity must be greater than 0")
        return quantity


class SupplierForm(forms.ModelForm):
    """Form for adding/editing suppliers"""
    
    class Meta:
        model = Supplier
        fields = ['name', 'contact_person', 'email', 'phone', 'address']
        widgets = {
            'address': forms.Textarea(attrs={'rows': 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('name', css_class='form-group col-md-6 mb-3'),
                Column('contact_person', css_class='form-group col-md-6 mb-3'),
            ),
            Row(
                Column('email', css_class='form-group col-md-6 mb-3'),
                Column('phone', css_class='form-group col-md-6 mb-3'),
            ),
            Field('address', css_class='form-group mb-3'),
            FormActions(
                Submit('submit', 'Save Supplier', css_class='btn btn-warning'),
            )
        )


class InventoryForm(forms.ModelForm):
    """Form for managing inventory settings"""
    
    class Meta:
        model = Inventory
        fields = ['minimum_stock', 'maximum_stock', 'reorder_point', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 3}),
            'minimum_stock': forms.NumberInput(attrs={'min': '0'}),
            'maximum_stock': forms.NumberInput(attrs={'min': '1'}),
            'reorder_point': forms.NumberInput(attrs={'min': '0'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Row(
                Column('minimum_stock', css_class='form-group col-md-4 mb-3'),
                Column('reorder_point', css_class='form-group col-md-4 mb-3'),
                Column('maximum_stock', css_class='form-group col-md-4 mb-3'),
            ),
            Field('notes', css_class='form-group mb-3'),
            FormActions(
                Submit('submit', 'Update Inventory', css_class='btn btn-primary'),
            )
        )

    def clean(self):
        cleaned_data = super().clean()
        minimum = cleaned_data.get('minimum_stock')
        maximum = cleaned_data.get('maximum_stock')
        reorder = cleaned_data.get('reorder_point')
        
        if minimum and maximum and minimum >= maximum:
            raise ValidationError("Maximum stock must be greater than minimum stock")
        
        if reorder and minimum and reorder < minimum:
            raise ValidationError("Reorder point should not be less than minimum stock")
            
        if reorder and maximum and reorder >= maximum:
            raise ValidationError("Reorder point should be less than maximum stock")
        
        return cleaned_data


class BikeSearchForm(forms.Form):
    """Form for searching bikes"""
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={'placeholder': 'Search by brand, model, or type...'})
    )
    type = forms.ChoiceField(
        required=False,
        choices=[('', 'All Types')] + Bike.BIKE_TYPES
    )
    min_price = forms.DecimalField(
        required=False,
        widget=forms.NumberInput(attrs={'step': '0.01', 'min': '0', 'placeholder': 'Min Price'})
    )
    max_price = forms.DecimalField(
        required=False,
        widget=forms.NumberInput(attrs={'step': '0.01', 'min': '0', 'placeholder': 'Max Price'})
    )
    in_stock_only = forms.BooleanField(required=False, label='In Stock Only')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_method = 'GET'
        self.helper.layout = Layout(
            Row(
                Column('search', css_class='form-group col-md-4 mb-3'),
                Column('type', css_class='form-group col-md-2 mb-3'),
                Column('min_price', css_class='form-group col-md-2 mb-3'),
                Column('max_price', css_class='form-group col-md-2 mb-3'),
                Column('in_stock_only', css_class='form-group col-md-2 mb-3'),
            ),
            FormActions(
                Submit('submit', 'Search', css_class='btn btn-outline-primary'),
            )
        )