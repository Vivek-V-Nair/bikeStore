from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from store.models import Bike, Customer, Sale, Supplier
from decimal import Decimal
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Populate the database with comprehensive sample data for bike store'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before adding sample data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            Sale.objects.all().delete()
            Bike.objects.all().delete()
            Customer.objects.all().delete()
            Supplier.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Existing data cleared.'))

        # Create suppliers
        suppliers_data = [
            {'name': 'Trek Bicycle Corporation', 'contact_person': 'John Smith', 'phone': '+1-555-0101', 'email': 'john@trek.com', 'address': '801 W Madison St, Waterloo, WI 53594'},
            {'name': 'Giant Manufacturing Co.', 'contact_person': 'Lisa Chen', 'phone': '+1-555-0102', 'email': 'lisa@giant-bicycles.com', 'address': 'No. 12-8, Zhongshan Rd., Dajia Dist., Taichung City 437'},
            {'name': 'Specialized Bicycle Components', 'contact_person': 'Mike Johnson', 'phone': '+1-555-0103', 'email': 'mike@specialized.com', 'address': '15130 Concord Circle, Morgan Hill, CA 95037'},
            {'name': 'Cannondale Bicycle Corporation', 'contact_person': 'Sarah Wilson', 'phone': '+1-555-0104', 'email': 'sarah@cannondale.com', 'address': '1 Cannondale Way, Wilton, CT 06897'},
            {'name': 'Scott Sports SA', 'contact_person': 'David Kumar', 'phone': '+1-555-0105', 'email': 'david@scott-sports.com', 'address': 'Route du Crochet 17, 1762 Givisiez, Switzerland'},
        ]

        suppliers = []
        for supplier_data in suppliers_data:
            supplier, created = Supplier.objects.get_or_create(
                name=supplier_data['name'],
                defaults=supplier_data
            )
            suppliers.append(supplier)
            if created:
                self.stdout.write(f'Created supplier: {supplier.name}')

        # Create comprehensive bike data
        bikes_data = [
            # Road Bikes
            {'brand': 'Trek', 'model': 'Domane SL 7', 'type': 'Road', 'price': Decimal('185000'), 'stock_quantity': 8, 'color': 'Carbon Black'},
            {'brand': 'Trek', 'model': 'Émonda ALR 5', 'type': 'Road', 'price': Decimal('95000'), 'stock_quantity': 12, 'color': 'Matte Red'},
            {'brand': 'Giant', 'model': 'TCR Advanced Pro 1', 'type': 'Road', 'price': Decimal('165000'), 'stock_quantity': 6, 'color': 'Team Blue'},
            {'brand': 'Giant', 'model': 'Contend 3', 'type': 'Road', 'price': Decimal('48000'), 'stock_quantity': 15, 'color': 'Metallic Black'},
            {'brand': 'Specialized', 'model': 'Tarmac SL7 Expert', 'type': 'Road', 'price': Decimal('295000'), 'stock_quantity': 4, 'color': 'Gloss White'},
            {'brand': 'Specialized', 'model': 'Allez Elite', 'type': 'Road', 'price': Decimal('68000'), 'stock_quantity': 18, 'color': 'Satin Blue'},
            
            # Mountain Bikes
            {'brand': 'Trek', 'model': 'Fuel EX 9.7', 'type': 'Mountain', 'price': Decimal('235000'), 'stock_quantity': 7, 'color': 'Matte Green'},
            {'brand': 'Trek', 'model': 'Marlin 7', 'type': 'Mountain', 'price': Decimal('58000'), 'stock_quantity': 20, 'color': 'Orange'},
            {'brand': 'Giant', 'model': 'Trance X Advanced Pro 1', 'type': 'Mountain', 'price': Decimal('285000'), 'stock_quantity': 5, 'color': 'Carbon'},
            {'brand': 'Giant', 'model': 'Talon 3', 'type': 'Mountain', 'price': Decimal('42000'), 'stock_quantity': 22, 'color': 'Yellow'},
            {'brand': 'Specialized', 'model': 'Stumpjumper EVO Expert', 'type': 'Mountain', 'price': Decimal('325000'), 'stock_quantity': 3, 'color': 'Sage Green'},
            {'brand': 'Specialized', 'model': 'Rockhopper Elite', 'type': 'Mountain', 'price': Decimal('52000'), 'stock_quantity': 16, 'color': 'Red'},
            
            # Hybrid Bikes
            {'brand': 'Trek', 'model': 'FX 3 Disc', 'type': 'Hybrid', 'price': Decimal('72000'), 'stock_quantity': 14, 'color': 'Grey'},
            {'brand': 'Giant', 'model': 'Escape 3', 'type': 'Hybrid', 'price': Decimal('38000'), 'stock_quantity': 25, 'color': 'Silver'},
            {'brand': 'Cannondale', 'model': 'Quick CX 3', 'type': 'Hybrid', 'price': Decimal('65000'), 'stock_quantity': 11, 'color': 'Purple'},
            
            # Electric Bikes
            {'brand': 'Trek', 'model': 'Verve+ 2', 'type': 'Electric', 'price': Decimal('145000'), 'stock_quantity': 6, 'color': 'Teal'},
            {'brand': 'Giant', 'model': 'Explore E+ 1 GTS', 'type': 'Electric', 'price': Decimal('195000'), 'stock_quantity': 4, 'color': 'Matte Black'},
            {'brand': 'Specialized', 'model': 'Turbo Vado 4.0', 'type': 'Electric', 'price': Decimal('225000'), 'stock_quantity': 5, 'color': 'White'},
            
            # Kids Bikes
            {'brand': 'Trek', 'model': 'Precaliber 24', 'type': 'Cruiser', 'price': Decimal('28000'), 'stock_quantity': 12, 'color': 'Pink'},
            {'brand': 'Giant', 'model': 'ARX 20', 'type': 'Cruiser', 'price': Decimal('22000'), 'stock_quantity': 15, 'color': 'Blue'},
            {'brand': 'Specialized', 'model': 'Riprock 20', 'type': 'Cruiser', 'price': Decimal('32000'), 'stock_quantity': 10, 'color': 'Green'},
            
            # BMX Bikes
            {'brand': 'GT', 'model': 'Performer 21', 'type': 'BMX', 'price': Decimal('35000'), 'stock_quantity': 8, 'color': 'Black'},
            {'brand': 'Haro', 'model': 'Downtown 20.5', 'type': 'BMX', 'price': Decimal('42000'), 'stock_quantity': 6, 'color': 'Chrome'},
        ]

        bikes = []
        for bike_data in bikes_data:
            # Assign random supplier
            bike_data['supplier'] = random.choice(suppliers)
            
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
            {'name': 'Rajesh Kumar', 'phone': '+91-9876543210', 'email': 'rajesh.kumar@email.com', 'address': '123 MG Road, Bangalore, Karnataka 560001'},
            {'name': 'Priya Sharma', 'phone': '+91-9876543211', 'email': 'priya.sharma@email.com', 'address': '456 Park Street, Kolkata, West Bengal 700016'},
            {'name': 'Amit Patel', 'phone': '+91-9876543212', 'email': 'amit.patel@email.com', 'address': '789 FC Road, Pune, Maharashtra 411005'},
            {'name': 'Sneha Reddy', 'phone': '+91-9876543213', 'email': 'sneha.reddy@email.com', 'address': '321 Jubilee Hills, Hyderabad, Telangana 500033'},
            {'name': 'Vikram Singh', 'phone': '+91-9876543214', 'email': 'vikram.singh@email.com', 'address': '654 Connaught Place, New Delhi 110001'},
            {'name': 'Anita Joshi', 'phone': '+91-9876543215', 'email': 'anita.joshi@email.com', 'address': '987 Linking Road, Mumbai, Maharashtra 400050'},
            {'name': 'Rahul Gupta', 'phone': '+91-9876543216', 'email': 'rahul.gupta@email.com', 'address': '147 Anna Salai, Chennai, Tamil Nadu 600002'},
            {'name': 'Meera Nair', 'phone': '+91-9876543217', 'email': 'meera.nair@email.com', 'address': '258 MG Road, Kochi, Kerala 682016'},
            {'name': 'Arjun Kapoor', 'phone': '+91-9876543218', 'email': 'arjun.kapoor@email.com', 'address': '369 Residency Road, Mysore, Karnataka 570001'},
            {'name': 'Kavya Iyer', 'phone': '+91-9876543219', 'email': 'kavya.iyer@email.com', 'address': '741 Brigade Road, Bangalore, Karnataka 560025'},
            {'name': 'Suresh Yadav', 'phone': '+91-9876543220', 'email': 'suresh.yadav@email.com', 'address': '852 Civil Lines, Jaipur, Rajasthan 302006'},
            {'name': 'Deepika Rao', 'phone': '+91-9876543221', 'email': 'deepika.rao@email.com', 'address': '963 Koramangala, Bangalore, Karnataka 560034'},
            {'name': 'Karthik Menon', 'phone': '+91-9876543222', 'email': 'karthik.menon@email.com', 'address': '159 Marine Drive, Kochi, Kerala 682031'},
            {'name': 'Pooja Agarwal', 'phone': '+91-9876543223', 'email': 'pooja.agarwal@email.com', 'address': '357 Hazratganj, Lucknow, Uttar Pradesh 226001'},
            {'name': 'Rohan Desai', 'phone': '+91-9876543224', 'email': 'rohan.desai@email.com', 'address': '468 Law Garden, Ahmedabad, Gujarat 380006'},
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

        # Create sales
        self.stdout.write('Creating sales transactions...')
        for _ in range(20):  # Reduce to 20 sales to avoid stock issues
            customer = random.choice(customers)
            # Get fresh bike data from database to ensure we have current stock levels
            bike = Bike.objects.filter(stock_quantity__gte=2).order_by('?').first()  # At least 2 in stock
            
            # Only create sale if bike is in stock
            if bike and bike.stock_quantity >= 2:
                quantity = 1  # Always sell just 1 bike to avoid stock issues
                sale_price = bike.price * Decimal(random.uniform(0.85, 1.0))  # Some discount possible
                
                with transaction.atomic():
                    # Refresh the bike instance to get the latest stock quantity
                    bike.refresh_from_db()
                    
                    # Double-check stock after refresh
                    if bike.stock_quantity >= quantity:
                        sale = Sale.objects.create(
                            customer=customer,
                            bike=bike,
                            quantity=quantity,
                            sale_price=sale_price
                        )
                        
                        # Update bike stock
                        bike.stock_quantity -= quantity
                        bike.save()
                        
                        self.stdout.write(f'Created sale: {customer.name} bought {quantity} x {bike.brand} {bike.model}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated database with:\n'
                f'- {Supplier.objects.count()} suppliers\n'
                f'- {Bike.objects.count()} bikes\n'
                f'- {Customer.objects.count()} customers\n'
                f'- {Sale.objects.count()} sales'
            )
        )