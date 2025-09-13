from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from store.models import Supplier, Bike, Customer, Sale
from decimal import Decimal
from datetime import datetime

class Command(BaseCommand):
    help = 'Load sample data into the bike store database'

    def handle(self, *args, **options):
        self.stdout.write('Loading sample data...')

        # Create superuser if it doesn't exist
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@bikestore.com', 'admin123')
            self.stdout.write(self.style.SUCCESS('Created admin user (username: admin, password: admin123)'))

        # Create suppliers
        suppliers_data = [
            {'name': 'Hero Cycles', 'contact_person': 'Rajesh Kumar', 'email': 'contact@herocycles.com', 'phone': '011-12345678', 'address': 'Ludhiana, Punjab'},
            {'name': 'Trek India', 'contact_person': 'Mike Johnson', 'email': 'india@trek.com', 'phone': '011-87654321', 'address': 'Delhi, India'},
            {'name': 'Giant Bicycles', 'contact_person': 'Sarah Chen', 'email': 'info@giant.in', 'phone': '022-11223344', 'address': 'Mumbai, Maharashtra'},
        ]

        suppliers = []
        for supplier_data in suppliers_data:
            supplier, created = Supplier.objects.get_or_create(**supplier_data)
            suppliers.append(supplier)
            if created:
                self.stdout.write(f'Created supplier: {supplier.name}')

        # Create bikes
        bikes_data = [
            {'brand': 'Hero', 'model': 'Sprint Pro 27.5T', 'type': 'Mountain', 'price': Decimal('25000.00'), 'stock_quantity': 15, 'color': 'Red', 'description': 'High-performance mountain bike with 21-speed gear system', 'supplier': suppliers[0]},
            {'brand': 'Trek', 'model': 'Domane AL 2', 'type': 'Road', 'price': Decimal('45000.00'), 'stock_quantity': 10, 'color': 'Blue', 'description': 'Lightweight road bike perfect for long distance cycling', 'supplier': suppliers[1]},
            {'brand': 'Giant', 'model': 'Talon 1 29er', 'type': 'Mountain', 'price': Decimal('35000.00'), 'stock_quantity': 8, 'color': 'Green', 'description': 'Versatile mountain bike with excellent suspension', 'supplier': suppliers[2]},
            {'brand': 'Firefox', 'model': 'Cyclone 21', 'type': 'Mountain', 'price': Decimal('28000.00'), 'stock_quantity': 12, 'color': 'Black', 'description': 'Durable mountain bike for rugged terrains', 'supplier': suppliers[0]},
            {'brand': 'Hercules', 'model': 'Roadeo A100', 'type': 'Hybrid', 'price': Decimal('22000.00'), 'stock_quantity': 20, 'color': 'White', 'description': 'Comfortable hybrid bike for city commuting', 'supplier': suppliers[0]},
            {'brand': 'Btwin', 'model': 'My Bike', 'type': 'Road', 'price': Decimal('8000.00'), 'stock_quantity': 25, 'color': 'Yellow', 'description': 'Entry-level road bike for beginners', 'supplier': suppliers[1]},
            {'brand': 'Trek', 'model': 'Marlin 5', 'type': 'Mountain', 'price': Decimal('38000.00'), 'stock_quantity': 6, 'color': 'Orange', 'description': 'Trail-ready mountain bike with modern features', 'supplier': suppliers[1]},
            {'brand': 'Giant', 'model': 'Escape 3', 'type': 'Hybrid', 'price': Decimal('32000.00'), 'stock_quantity': 14, 'color': 'Silver', 'description': 'Versatile hybrid bike for fitness and commuting', 'supplier': suppliers[2]},
        ]

        bikes = []
        for bike_data in bikes_data:
            bike, created = Bike.objects.get_or_create(
                brand=bike_data['brand'],
                model=bike_data['model'],
                color=bike_data['color'],
                defaults=bike_data
            )
            bikes.append(bike)
            if created:
                self.stdout.write(f'Created bike: {bike.brand} {bike.model}')

        # Create customers
        customers_data = [
            {'name': 'Rajesh Kumar', 'email': 'rajesh.kumar@email.com', 'phone': '9876543210', 'address': 'A-123, Sector 15, Noida, UP'},
            {'name': 'Priya Sharma', 'email': 'priya.sharma@email.com', 'phone': '9876543211', 'address': 'B-456, Defence Colony, Delhi'},
            {'name': 'Amit Singh', 'email': 'amit.singh@email.com', 'phone': '9876543212', 'address': 'C-789, Banjara Hills, Hyderabad'},
            {'name': 'Sneha Patel', 'email': 'sneha.patel@email.com', 'phone': '9876543213', 'address': 'D-101, Satellite, Ahmedabad'},
            {'name': 'Ravi Krishnan', 'email': 'ravi.krishnan@email.com', 'phone': '9876543214', 'address': 'E-202, Koramangala, Bangalore'},
        ]

        customers = []
        for customer_data in customers_data:
            customer, created = Customer.objects.get_or_create(
                email=customer_data['email'],
                defaults=customer_data
            )
            customers.append(customer)
            if created:
                self.stdout.write(f'Created customer: {customer.name}')

        # Create sample sales
        sales_data = [
            {'customer': customers[0], 'bike': bikes[0], 'quantity': 1, 'sale_price': bikes[0].price},
            {'customer': customers[1], 'bike': bikes[2], 'quantity': 1, 'sale_price': bikes[2].price},
            {'customer': customers[2], 'bike': bikes[1], 'quantity': 1, 'sale_price': bikes[1].price},
            {'customer': customers[3], 'bike': bikes[4], 'quantity': 2, 'sale_price': bikes[4].price},
            {'customer': customers[0], 'bike': bikes[5], 'quantity': 1, 'sale_price': bikes[5].price},
        ]

        for sale_data in sales_data:
            # Check if sale already exists
            if not Sale.objects.filter(customer=sale_data['customer'], bike=sale_data['bike']).exists():
                try:
                    sale = Sale.objects.create(**sale_data)
                    self.stdout.write(f'Created sale: {sale.customer.name} bought {sale.bike.brand} {sale.bike.model}')
                except ValueError as e:
                    self.stdout.write(self.style.WARNING(f'Skipped sale due to insufficient stock: {e}'))

        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))
        self.stdout.write(self.style.WARNING('Admin credentials: username=admin, password=admin123'))