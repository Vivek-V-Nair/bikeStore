# 🚴‍♂️ Professional Bike Store Management System

A comprehensive, professional-grade bike store management system built with Django, featuring real-time inventory tracking, sales analytics, and modern data visualizations.

![Django](https://img.shields.io/badge/Django-5.2.6-092E20?style=for-the-badge&logo=django&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

## 🌟 Features

### 📊 **Professional Dashboard**
- **Real-time Analytics** with Chart.js visualizations
- **Sales by Bike Type** interactive doughnut charts
- **Inventory Overview** with bar charts by category
- **Key Performance Indicators** (Total Bikes, Customers, Sales, Revenue)
- **Low Stock Alerts** for inventory management

### 🚲 **Bike Management**
- **Complete Bike Catalog** with brands, models, types, and specifications
- **Real-time Stock Tracking** with automatic updates
- **Advanced Search & Filtering** by type, brand, price range
- **Professional UI** with bike store themed design
- **Responsive Design** for desktop and mobile

### 👥 **Customer Management**
- **Customer Database** with contact information
- **Purchase History** tracking per customer
- **Professional Customer Portal** with detailed views
- **Customer Analytics** and insights

### 💰 **Sales System**
- **Transaction Recording** with automatic stock updates
- **Sales History** with detailed reporting
- **Revenue Tracking** and analytics
- **Professional Invoice Generation**
- **Sales Performance Metrics**

### 🏢 **Supplier Management**
- **Supplier Database** with contact details
- **Supplier-Bike Relationships** tracking
- **Professional Supplier Portal**

### 🎨 **Professional Design**
- **Racing Red Theme** with professional color scheme
- **FontAwesome Icons** throughout the interface
- **Smooth Animations** and transitions
- **Professional Typography** and layout
- **Mobile-Responsive** Bootstrap design

## 🛠️ Technology Stack

- **Backend**: Django 5.2.6 (Python)
- **Database**: SQLite (Development) / PostgreSQL (Production Ready)
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Charts**: Chart.js for data visualization
- **UI Framework**: Bootstrap 5.3
- **Icons**: FontAwesome 6.0
- **Animations**: CSS3 transitions and keyframes

## 🚀 Quick Start

### Prerequisites
- Python 3.11 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vivek-V-Nair/bike-store-management.git
   cd bike-store-management
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install django pillow
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Load sample data** (Optional)
   ```bash
   python manage.py populate_sample_data --clear
   ```

6. **Create superuser** (Optional)
   ```bash
   python manage.py createsuperuser
   ```

7. **Start development server**
   ```bash
   python manage.py runserver
   ```

8. **Access the application**
   - Open your browser and go to `http://127.0.0.1:8000`
   - Admin panel: `http://127.0.0.1:8000/admin`

## 📁 Project Structure

```
bikestore_django/
├── bikestore_django/          # Main project configuration
│   ├── settings.py           # Django settings
│   ├── urls.py              # Main URL configuration
│   └── wsgi.py              # WSGI configuration
├── store/                    # Main application
│   ├── models.py            # Database models
│   ├── views.py             # Business logic
│   ├── urls.py              # App URL patterns
│   ├── forms.py             # Django forms
│   ├── admin.py             # Admin configuration
│   └── management/          # Custom management commands
│       └── commands/
│           └── populate_sample_data.py
├── templates/               # HTML templates
│   ├── base.html           # Base template
│   └── store/              # Store-specific templates
│       ├── dashboard.html   # Main dashboard
│       ├── bike_list.html   # Bike catalog
│       └── ...
├── static/                  # Static files
│   ├── css/
│   │   ├── bike-store-theme.css  # Professional theme
│   │   └── ...
│   └── js/
│       ├── sales-charts.js      # Chart.js implementation
│       └── ...
└── db.sqlite3              # SQLite database
```

## 📊 Sample Data

The system includes a comprehensive sample data generator:

- **23 Bike Models** (Trek, Giant, Specialized, Cannondale, Scott)
- **5 Suppliers** with complete contact information
- **15 Customers** with realistic Indian names and data
- **20 Sales Transactions** with varied bike types and prices

### Load Sample Data
```bash
python manage.py populate_sample_data --clear
```

## 🎯 Key Features in Detail

### Dashboard Analytics
- **Interactive Charts**: Sales distribution by bike type
- **Real-time Metrics**: Live inventory and sales data
- **Professional KPIs**: Revenue, stock levels, customer count
- **Visual Indicators**: Low stock alerts and trend analysis

### Inventory Management
- **Stock Tracking**: Automatic updates on sales
- **Category Management**: Mountain, Road, Hybrid, Electric, BMX
- **Price Management**: Flexible pricing with discount tracking
- **Supplier Integration**: Full supplier relationship management

### Professional UI/UX
- **Consistent Theme**: Racing red with professional gradients
- **Responsive Design**: Works on all devices
- **Smooth Animations**: Professional transitions and effects
- **Accessibility**: WCAG 2.1 compliant design

## 🔧 Customization

### Adding New Bike Types
Edit `store/models.py`:
```python
BIKE_TYPES = [
    ('Mountain', 'Mountain Bike'),
    ('Road', 'Road Bike'),
    ('Hybrid', 'Hybrid Bike'),
    ('Electric', 'Electric Bike'),
    ('BMX', 'BMX Bike'),
    ('Cruiser', 'Cruiser Bike'),
    ('YourType', 'Your New Type'),  # Add here
]
```

### Modifying Theme Colors
Edit `static/css/bike-store-theme.css`:
```css
:root {
    --bike-red: #dc2626;      /* Change primary color */
    --bike-orange: #ea580c;   /* Change accent color */
    /* ... */
}
```

## 🚀 Production Deployment

### Environment Setup
1. Set `DEBUG = False` in settings.py
2. Configure allowed hosts
3. Set up PostgreSQL database
4. Configure static files serving
5. Set up environment variables

### Recommended Stack
- **Server**: Ubuntu 20.04+
- **Web Server**: Nginx
- **WSGI**: Gunicorn
- **Database**: PostgreSQL 12+
- **Process Manager**: Supervisor

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vivek V Nair**
- GitHub: [@Vivek-V-Nair](https://github.com/Vivek-V-Nair)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- Django community for the excellent framework
- Chart.js for beautiful data visualizations
- Bootstrap team for responsive design components
- FontAwesome for professional icons

---

⭐ **Star this repository if you found it helpful!**