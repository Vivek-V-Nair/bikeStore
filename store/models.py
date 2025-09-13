from django.db import models
from django.core.validators import MinValueValidator
from django.urls import reverse
from decimal import Decimal

class Supplier(models.Model):
    """Model for bike suppliers"""
    name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('store:supplier_detail', kwargs={'pk': self.pk})


class Bike(models.Model):
    """Model for bikes in the store"""
    BIKE_TYPES = [
        ('Mountain', 'Mountain Bike'),
        ('Road', 'Road Bike'),
        ('Hybrid', 'Hybrid Bike'),
        ('Electric', 'Electric Bike'),
        ('BMX', 'BMX Bike'),
        ('Cruiser', 'Cruiser Bike'),
    ]

    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=BIKE_TYPES, default='Mountain')
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    stock_quantity = models.PositiveIntegerField(default=0)
    color = models.CharField(max_length=30, default='Black')
    description = models.TextField(blank=True)
    supplier = models.ForeignKey(
        Supplier, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['brand', 'model']
        unique_together = ['brand', 'model', 'color']

    def __str__(self):
        return f"{self.brand} {self.model} ({self.color})"

    def get_absolute_url(self):
        return reverse('store:bike_detail', kwargs={'pk': self.pk})

    @property
    def is_low_stock(self):
        """Check if bike stock is low (less than 5 units)"""
        return self.stock_quantity < 5

    @property
    def is_in_stock(self):
        """Check if bike is in stock"""
        return self.stock_quantity > 0


class Customer(models.Model):
    """Model for customers"""
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse('store:customer_detail', kwargs={'pk': self.pk})

    @property
    def total_purchases(self):
        """Calculate total amount spent by customer"""
        return self.sales.aggregate(
            total=models.Sum(models.F('quantity') * models.F('sale_price'))
        )['total'] or Decimal('0.00')

    @property
    def purchase_count(self):
        """Count total number of purchases"""
        return self.sales.count()


class Sale(models.Model):
    """Model for sales transactions"""
    customer = models.ForeignKey(
        Customer, 
        on_delete=models.CASCADE,
        related_name='sales'
    )
    bike = models.ForeignKey(
        Bike, 
        on_delete=models.CASCADE,
        related_name='sales'
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    sale_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    sale_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-sale_date']

    def __str__(self):
        return f"Sale #{self.pk} - {self.customer.name} - {self.bike}"

    def get_absolute_url(self):
        return reverse('store:sale_detail', kwargs={'pk': self.pk})

    @property
    def total_amount(self):
        """Calculate total sale amount"""
        return self.quantity * self.sale_price

    def save(self, *args, **kwargs):
        """Override save to update bike stock automatically"""
        if not self.pk:  # New sale
            # Set sale price to current bike price if not set
            if not self.sale_price:
                self.sale_price = self.bike.price
            
            # Check if enough stock available
            if self.bike.stock_quantity < self.quantity:
                raise ValueError(f"Insufficient stock. Available: {self.bike.stock_quantity}")
            
            # Save the sale first
            super().save(*args, **kwargs)
            
            # Update bike stock
            self.bike.stock_quantity -= self.quantity
            self.bike.save()
        else:
            super().save(*args, **kwargs)


class Inventory(models.Model):
    """Model for inventory tracking"""
    bike = models.OneToOneField(
        Bike, 
        on_delete=models.CASCADE,
        related_name='inventory'
    )
    minimum_stock = models.PositiveIntegerField(default=5)
    maximum_stock = models.PositiveIntegerField(default=50)
    reorder_point = models.PositiveIntegerField(default=10)
    last_restocked = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Inventories"

    def __str__(self):
        return f"Inventory for {self.bike}"

    @property
    def needs_reorder(self):
        """Check if bike needs to be reordered"""
        return self.bike.stock_quantity <= self.reorder_point

    @property
    def stock_status(self):
        """Get stock status description"""
        current_stock = self.bike.stock_quantity
        if current_stock == 0:
            return "Out of Stock"
        elif current_stock <= self.reorder_point:
            return "Low Stock"
        elif current_stock >= self.maximum_stock:
            return "Overstocked"
        else:
            return "Normal"
