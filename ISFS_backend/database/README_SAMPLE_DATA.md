# Sample Data Setup Instructions

## Overview
This directory contains sample data for your Integrated Smart Farming System database. The sample data includes realistic agricultural data for testing your application.

## Files
- `enhanced_schema.sql` - Main database schema with tables, views, procedures, and triggers
- `sample_data.sql` - Comprehensive sample data for all tables

## Setup Instructions

### 1. Database Setup
First, make sure you have Oracle Database installed and running. Then run the schema:

```sql
-- Run the main schema first
@enhanced_schema.sql
```

### 2. Sample Data Insertion
After setting up the schema, run the sample data:

```sql
-- Insert sample data
@sample_data.sql
```

### 3. Alternative: Run Both Together
You can also run both files in sequence:

```sql
-- Run schema and sample data together
@enhanced_schema.sql
@sample_data.sql
```

## Sample Data Includes

### Users
- **3 Admin Users**: System administrators and managers
- **6 Farmers**: Various farmers from different villages in Bihar

### Farms
- **9 Farms**: Different types including organic, conventional, and hybrid farms
- Various soil types, irrigation systems, and farm sizes

### Crops
- **14 Crops**: Including wheat, rice, maize, sugarcane, vegetables, and fruits
- Different growth stages from planted to harvested
- Realistic yield data and planting information

### Labor & Equipment
- **8 Labor Workers**: Different skills and specializations
- **7 Equipment Items**: Tractors, harvesters, irrigation systems, etc.
- **7 Maintenance Records**: Equipment maintenance history

### Agricultural Operations
- **8 Labor Work Records**: Various farming activities
- **10 Fertilizer Applications**: Organic and inorganic fertilizers
- **8 Pesticide Applications**: Different types for pest control
- **8 Irrigation Records**: Different irrigation methods and schedules

### Monitoring Data
- **9 Weather Records**: Temperature, humidity, rainfall data
- **9 Soil Analysis Reports**: Nutrient levels and recommendations
- **5 Disease Records**: Crop diseases with treatments

### Sales
- **10 Sales Records**: Various crop sales with different payment methods
- Realistic pricing and buyer information

## Testing Your Application

After inserting the sample data, you can test:

1. **Farmer Login**: Use any farmer's phone number and password `password` (hashed)
2. **Admin Login**: Use username `admin` and password `password`
3. **Dashboard Views**: Check farmer dashboards and analytics
4. **CRUD Operations**: Add, edit, delete records
5. **Reports**: Generate various reports using the views

## Default Credentials

### Admin Users
- Username: `admin`, Password: `password`
- Username: `manager1`, Password: `password`
- Username: `admin2`, Password: `password`

### Farmer Users
- Phone: `9876543210`, Password: `password` (Rajesh Kumar)
- Phone: `8765432109`, Password: `password` (Priya Sharma)
- Phone: `7654321098`, Password: `password` (Amit Singh)
- Phone: `6543210987`, Password: `password` (Sunita Devi)
- Phone: `5432109876`, Password: `password` (Vikram Pandey)
- Phone: `4321098765`, Password: `password` (Meera Kumari)

## Database Views Available

The schema includes several useful views for analytics:
- `FARMER_DASHBOARD` - Farmer statistics and performance
- `FARM_PERFORMANCE` - Farm-level analytics
- `CROP_ANALYTICS` - Crop performance analysis
- `MONTHLY_REVENUE` - Revenue tracking by month
- `COST_ANALYSIS` - Cost and profit analysis

## Troubleshooting

If you encounter any issues:

1. **Check Database Connection**: Ensure Oracle Database is running
2. **Verify Permissions**: Make sure you have CREATE, INSERT, UPDATE, DELETE permissions
3. **Sequence Issues**: If sequences are not working, check sequence creation
4. **Foreign Key Constraints**: Ensure parent records exist before inserting child records

## Notes

- All passwords are hashed using bcrypt with the value `password`
- Dates are set to realistic agricultural timelines
- All monetary values are in INR (Indian Rupees)
- The data represents a typical agricultural scenario in Bihar, India
