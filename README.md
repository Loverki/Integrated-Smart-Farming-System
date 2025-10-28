# 🌾 Integrated Smart Farming System (ISFS)

A comprehensive farm management system built with **React**, **Node.js/Express**, and **Oracle Database** featuring advanced DBMS concepts.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Features](#database-features)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Key Implementations](#key-implementations)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)

---

## 🎯 Overview

The Integrated Smart Farming System is a full-stack web application designed to help farmers manage their farms efficiently. It provides tools for crop management, labor tracking, equipment maintenance, sales recording, and data analytics.

**Built By:** Database Management Systems Project  
**Date:** October 2025  
**Version:** 2.0

---

## ✨ Features

### 🌱 Crop Management
- ✅ Add, edit, view, and delete crops
- ✅ Track sowing and harvest dates
- ✅ Record expected vs actual yields
- ✅ Monitor crop growth stages
- ✅ Date validation (harvest must be after sowing)
- ✅ Seed quantity tracking

### 🏡 Farm Management
- ✅ Multiple farm support per farmer
- ✅ Track farm area, soil type, irrigation
- ✅ Auto-calculate total farms and area (triggers)
- ✅ Farm comparison and analytics

### 👷 Labor Management
- ✅ Register and manage farm laborers
- ✅ Track daily work and wages
- ✅ Calculate total labor costs
- ✅ Work history tracking

### 🚜 Equipment Management
- ✅ Equipment inventory
- ✅ Maintenance scheduling
- ✅ Usage tracking

### 💰 Sales & Finance
- ✅ Record crop sales
- ✅ Track revenue and profit
- ✅ Financial analytics
- ✅ Month-wise revenue reports

### 📊 Advanced Analytics
- ✅ Farm performance metrics
- ✅ Crop yield analysis
- ✅ Financial reports
- ✅ Custom database queries (Admin)

### 🔐 Admin System
- ✅ User management
- ✅ System analytics
- ✅ Database query tool
- ✅ Role-based access control

### 🌤️ Weather Alert System
- ✅ Real-time weather data integration (OpenWeatherMap API)
- ✅ Automatic weather alerts based on thresholds
- ✅ SMS notifications (via Twilio)
- ✅ In-app notification dashboard
- ✅ Customizable alert preferences
- ✅ Manual admin alerts and broadcasts
- ✅ 5-day weather forecast
- ✅ Hourly automatic weather checks

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** JWT + bcrypt
- **Database Driver:** node-oracledb
- **Weather API:** OpenWeatherMap
- **SMS Service:** Twilio
- **Scheduling:** node-cron

### Database
- **DBMS:** Oracle Database 21c
- **Advanced Features:**
  - Stored Procedures
  - Triggers
  - Views
  - Functions
  - Sequences
  - Constraints

---

## 🗄️ Database Features

### Tables (16)
1. **FARMER** - Farmer profiles with auto-calculated totals
2. **ADMIN** - Admin user management
3. **FARM** - Farm details and properties
4. **CROP** - Crop lifecycle tracking
5. **LABOUR** - Labor registry
6. **LABOURWORK** - Daily work records
7. **SALES** - Sales transactions
8. **FERTILIZER** - Fertilizer usage
9. **EQUIPMENT** - Equipment inventory
10. **EQUIPMENT_MAINTENANCE** - Maintenance logs
11. **WEATHER_DATA** - Weather records
12. **SOIL_ANALYSIS** - Soil test results
13. **PESTICIDE** - Pesticide applications
14. **IRRIGATION** - Irrigation tracking
15. **WEATHER_ALERT** - Weather alert history
16. **ALERT_PREFERENCES** - Farmer notification settings

### Triggers (3)
- **TRG_FARM_INSERT** - Auto-update farmer totals on farm insert
- **TRG_FARM_UPDATE** - Auto-update farmer totals on farm update
- **TRG_FARM_DELETE** - Auto-update farmer totals on farm delete

### Stored Procedures (1)
- **RECALC_FARMER_TOTALS** - Recalculate all farmer statistics

### Views (5+)
- Crop performance views
- Financial summary views
- Farm analytics views
- Labor cost views

### Functions
- Custom calculation functions
- Data aggregation functions

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 16
Oracle Database 21c
npm or yarn
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd Integrated-Smart-Farming-System
```

### 2. Database Setup
```bash
# Connect to Oracle SQL*Plus or SQL Developer
sqlplus username/password@database

# Run schema
@ISFS_backend/database/enhanced_schema.sql

# Run triggers
@ISFS_backend/database/farmer_farm_triggers.sql

# (Optional) Load sample data
@ISFS_backend/database/sample_data.sql
```

### 3. Backend Setup
```bash
cd ISFS_backend
npm install

# Create .env file
cat > .env << EOL
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_CONNECT_STRING=localhost:1521/XEPDB1

# Weather Alert System
OPENWEATHER_API_KEY=your_openweathermap_api_key

# Twilio SMS (Optional - system will simulate SMS if not configured)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
JWT_SECRET=your_secret_key_here
PORT=5000
EOL

# Start server
npm start
```

### 4. Frontend Setup
```bash
cd ISFS_frontend
npm install
npm run dev
```

### 5. Access Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

### Default Credentials
**Admin:**
- Username: `admin`
- Password: `admin123`

**Farmer:**
- Register new account or use existing farmer credentials

---

## 📁 Project Structure

```
Integrated-Smart-Farming-System/
├── ISFS_backend/
│   ├── controllers/          # Request handlers
│   ├── database/            
│   │   ├── connection.js           # Oracle DB connection
│   │   ├── enhanced_schema.sql     # Database schema
│   │   ├── farmer_farm_triggers.sql # Triggers
│   │   ├── sample_data.sql         # Sample data
│   │   └── setup-triggers-simple.js # Trigger setup script
│   ├── middleware/          # Auth middleware
│   ├── routes/              # API routes
│   │   ├── authRoutes.js          # Authentication
│   │   ├── cropRoutes.js          # Crop CRUD
│   │   ├── farmRoutes.js          # Farm CRUD
│   │   ├── labourRoutes.js        # Labor management
│   │   ├── salesRoutes.js         # Sales tracking
│   │   ├── adminRoutes.js         # Admin operations
│   │   ├── viewsRoutes.js         # Database views
│   │   ├── proceduresRoutes.js    # Stored procedures
│   │   └── functionsRoutes.js     # Database functions
│   ├── server.js            # Entry point
│   └── package.json
│
├── ISFS_frontend/
│   ├── src/
│   │   ├── api/             # Axios configuration
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminProtectedRoute.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Farms.jsx
│   │   │   ├── AddFarm.jsx
│   │   │   ├── EditFarm.jsx
│   │   │   ├── Crops.jsx
│   │   │   ├── AddCrop.jsx
│   │   │   ├── EditCrop.jsx  (✨ NEW)
│   │   │   ├── Labours.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminUserManagement.jsx
│   │   │   │   ├── FarmerManagement.jsx
│   │   │   │   ├── SystemAnalytics.jsx
│   │   │   │   └── DatabaseQueryTool.jsx
│   │   │   └── ...
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── README.md                # This file
├── QUICK_START.md          # Quick reference
└── ALL_SQL_COMMANDS.sql    # All SQL commands reference
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register new farmer account
```json
{
  "name": "John Doe",
  "phone": "1234567890",
  "email": "john@example.com",
  "password": "password123",
  "address": "123 Farm Street"
}
```

#### POST `/api/auth/login`
Login farmer
```json
{
  "phone": "1234567890",
  "password": "password123"
}
```

### Farm Endpoints (Protected)

#### GET `/api/farms`
Get all farms for logged-in farmer

#### POST `/api/farms`
Create new farm
```json
{
  "farm_name": "Green Valley Farm",
  "location": "California",
  "area": 50,
  "soil_type": "Loamy",
  "irrigation_type": "Drip",
  "farm_type": "ORGANIC"
}
```

#### PUT `/api/farms/:id`
Update farm details

#### DELETE `/api/farms/:id`
Delete farm (triggers auto-update farmer totals)

### Crop Endpoints (Protected)

#### GET `/api/crops`
Get all crops for logged-in farmer

#### GET `/api/crops/:id`
Get single crop details (✨ NEW)

#### POST `/api/crops`
Create new crop with date validation
```json
{
  "farm_id": 1,
  "crop_name": "Wheat",
  "variety": "Winter Wheat",
  "sowing_date": "2025-01-15",
  "expected_harvest_date": "2025-04-15",
  "expected_yield": 1000,
  "seed_quantity": 50,
  "growth_stage": "PLANTED"
}
```

#### PUT `/api/crops/:id`
Update crop (✨ NEW) - with date validation
```json
{
  "actual_harvest_date": "2025-04-20",
  "actual_yield": 1050,
  "crop_status": "HARVESTED"
}
```

### Admin Endpoints (Admin Only)

#### POST `/api/admin/login`
Admin login

#### GET `/api/admin/farmers`
Get all farmers

#### POST `/api/admin/recalculate-farmer-totals`
Manually recalculate farmer totals (✨ NEW)

---

## 🎯 Key Implementations

### 1. Crop Editing Feature ✨

**Files:**
- `EditCrop.jsx` - Complete edit form
- `cropRoutes.js` - GET and PUT endpoints

**Features:**
- Edit all crop details
- Update harvest information
- Record actual yield
- Change crop status

### 2. Farmer Totals Auto-Update ✨

**Database Triggers:**
```sql
-- Auto-updates when farm is added
TRG_FARM_INSERT

-- Auto-updates when farm area changes
TRG_FARM_UPDATE  

-- Auto-updates when farm is deleted
TRG_FARM_DELETE
```

**How It Works:**
- Add a farm → `total_farms` and `total_area` increase automatically
- Update farm area → `total_area` recalculates automatically
- Delete a farm → totals decrease automatically

**No manual maintenance required!**

### 3. Date Validation System ✨

**3-Layer Validation:**

1. **HTML5 Browser Validation**
   ```jsx
   <input type="date" min={sowingDate} />
   ```

2. **Frontend JavaScript**
   ```javascript
   if (harvestDate <= sowingDate) {
     setError("Harvest must be after sowing");
   }
   ```

3. **Backend API**
   ```javascript
   if (new Date(actual_harvest_date) <= new Date(sowing_date)) {
     return res.status(400).json({ 
       message: "Harvest date must be after sowing date" 
     });
   }
   ```

**Rules:**
- ✅ Sowing date is required
- ✅ Expected harvest > sowing date
- ✅ Actual harvest > sowing date

### 4. Advanced Analytics

**Features:**
- Farm performance comparison
- Crop yield analysis
- Financial reports
- Custom SQL queries (Admin)
- Real-time data visualization

---

## 👥 User Roles

### Farmer
- Manage own farms and crops
- Track labor and expenses
- Record sales
- View analytics
- Update harvest information

### Admin
- View all farmers and data
- System analytics
- User management
- Database query tool
- Recalculate system totals

---

## 📸 Screenshots

### Dashboard
Main dashboard with farm overview and quick statistics

### Crops Management
- View all crops with actual harvest dates
- Add new crops with validation
- Edit crops to update harvest information
- Filter by farm

### Farm Management
- Create and edit farms
- View crops per farm
- Farm comparison analytics

### Analytics
- Revenue charts
- Yield analysis
- Labor cost tracking
- Financial summaries

---

## 🔧 Development

### Running in Development Mode

**Backend:**
```bash
cd ISFS_backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd ISFS_frontend
npm run dev  # Hot module replacement
```

### Environment Variables

**Backend (.env):**
```env
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XEPDB1
JWT_SECRET=your_secret_key_minimum_32_characters
PORT=5000
```

---

## 🧪 Testing

### Manual Testing Checklist

**Crop Management:**
- [ ] Add crop with valid dates
- [ ] Try to add crop with invalid dates (should show error)
- [ ] Edit crop to add harvest information
- [ ] Verify date validation works

**Farm Management:**
- [ ] Add new farm
- [ ] Verify farmer totals update automatically
- [ ] Edit farm area
- [ ] Verify total_area updates automatically
- [ ] Delete farm
- [ ] Verify totals decrease

**Authentication:**
- [ ] Register new farmer
- [ ] Login
- [ ] Access protected routes
- [ ] Logout

---

## 📊 Database Schema Highlights

### Farmer Table (with Triggers)
```sql
CREATE TABLE FARMER (
    farmer_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(15) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE,
    password VARCHAR2(255) NOT NULL,
    total_farms NUMBER DEFAULT 0,    -- Auto-updated by triggers
    total_area NUMBER DEFAULT 0      -- Auto-updated by triggers
);
```

### Crop Table (with Date Validation)
```sql
CREATE TABLE CROP (
    crop_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id),
    crop_name VARCHAR2(100) NOT NULL,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,        -- Can be updated later
    expected_yield NUMBER,
    actual_yield NUMBER,             -- Recorded after harvest
    seed_quantity NUMBER,
    growth_stage VARCHAR2(30),
    crop_status VARCHAR2(20)
);
```

---

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Full-stack web development
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Oracle Database integration
- ✅ Database triggers and procedures
- ✅ React state management
- ✅ Form validation (multi-layer)
- ✅ Role-based access control
- ✅ Data visualization
- ✅ Professional UI/UX design

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check Oracle database is running
lsnrctl status

# Verify credentials in .env file
cat .env
```

### Frontend API calls fail
```bash
# Ensure backend is running on port 5000
curl http://localhost:5000/

# Check CORS configuration in server.js
```

### Triggers not working
```bash
# Reinstall triggers
cd ISFS_backend
node database/setup-triggers-simple.js
```

### Date validation not working
```bash
# Restart backend server to load updated routes
cd ISFS_backend
npm start
```

---

## 🌤️ Weather Alert System Setup

### OpenWeatherMap API Setup

1. **Get API Key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key
   - Add to `.env` file: `OPENWEATHER_API_KEY=your_key_here`

2. **Features**
   - Current weather for farm locations
   - 5-day weather forecast
   - Automatic weather data storage
   - Hourly weather checks (via cron job)

### Twilio SMS Setup (Optional)

1. **Get Twilio Credentials**
   - Visit [Twilio](https://www.twilio.com/)
   - Sign up for a free trial account
   - Get your Account SID, Auth Token, and Phone Number
   - Add to `.env` file:
     ```
     TWILIO_ACCOUNT_SID=your_sid
     TWILIO_AUTH_TOKEN=your_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```

2. **Without Twilio**
   - System automatically simulates SMS
   - Alerts still saved to database
   - In-app notifications work normally

### Alert Configuration

**Automatic Alerts Trigger When:**
- Temperature > 35°C (Extreme Heat)
- Temperature < 5°C (Extreme Cold)
- Rainfall > 50mm (Heavy Rain)
- Wind Speed > 40 km/h (High Wind)
- Humidity > 90% (High Humidity)
- Humidity < 30% (Low Humidity)

**Farmers Can:**
- Customize alert thresholds
- Toggle SMS/In-app notifications
- View alert history
- See 5-day weather forecast

**Admins Can:**
- Send manual alerts to specific farmers
- Broadcast alerts to all farmers
- View alert statistics
- Monitor system performance

---

## 📝 Notes

### Recent Updates (Oct 2025)
1. ✅ Added crop editing functionality
2. ✅ Implemented farmer totals auto-update using triggers
3. ✅ Added comprehensive date validation
4. ✅ Added seed quantity field
5. ✅ Created admin recalculation endpoint
6. ✅ Integrated Weather Alert System with OpenWeatherMap API
7. ✅ Added SMS notifications via Twilio
8. ✅ Implemented automatic hourly weather checks

### Known Limitations
- Single database connection (no connection pooling)
- Basic error handling (can be enhanced)
- No file upload for images
- SMS requires Twilio account (falls back to simulation)

### Future Enhancements
- Mobile app (React Native)
- Real-time chat support
- IoT sensor integration
- Machine learning yield predictions
- Push notifications for mobile

---

## 👨‍💻 Developer

**Database Management Systems Project**  
Built with ❤️ using React, Node.js, and Oracle Database

---

## 📄 License

Educational Project - 2025

---

## 🔗 Quick Links

- [Quick Start Guide](./QUICK_START.md)
- [SQL Commands Reference](./ALL_SQL_COMMANDS.sql)
- [Backend README](./ISFS_backend/database/README_SAMPLE_DATA.md)

---

**Last Updated:** October 28, 2025  
**Version:** 2.0 (Latest)  
**Status:** ✅ Production Ready
