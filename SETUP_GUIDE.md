# 🚀 Setup Guide - Integrated Smart Farming System

## 📋 Current Issues Fixed

✅ **Registration Error Fixed**: Updated frontend to send `address` instead of `location`  
✅ **Enhanced Error Handling**: Better validation and error messages  
✅ **Database Connection**: Added comprehensive connection testing  
✅ **UI Improvements**: Modern, responsive registration form  

## 🔧 Setup Instructions

### 1. **Database Setup (CRITICAL)**

The main issue is database connection. You need to:

#### **Step 1: Update Database Credentials**
Edit the file: `ISFS_backend/.env`

```env
# Database Configuration
DB_USER=your_actual_oracle_username
DB_PASSWORD=your_actual_oracle_password
DB_CONNECT_STRING=localhost:1521/XE

# JWT Secret Key (change this to a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Configuration
PORT=5000
```

#### **Step 2: Create Database Schema**
Run the enhanced schema script in your Oracle database:

```sql
-- Run this file in your Oracle database:
ISFS_backend/database/enhanced_schema.sql
```

This will create:
- ✅ All required tables (FARMER, ADMIN, FARM, CROP, etc.)
- ✅ Sequences for auto-increment IDs
- ✅ Views for analytics
- ✅ Stored procedures
- ✅ Triggers
- ✅ Sample data

#### **Step 3: Test Database Connection**
```bash
cd ISFS_backend
node test-db-connection.js
```

### 2. **Install Dependencies**

```bash
# Backend
cd ISFS_backend
npm install

# Frontend  
cd ISFS_frontend
npm install
```

### 3. **Start the Application**

```bash
# Terminal 1 - Backend Server
cd ISFS_backend
npm start

# Terminal 2 - Frontend Development Server
cd ISFS_frontend
npm run dev
```

### 4. **Access the Application**

- **Home Page**: http://localhost:5173
- **Farmer Login**: http://localhost:5173/login
- **Admin Login**: http://localhost:5173/admin-login
- **Registration**: http://localhost:5173/register

## 🔍 Troubleshooting

### **Database Connection Issues**

If you get `ORA-01017: invalid username/password`:

1. **Check Oracle Database is Running**
   ```bash
   # Check if Oracle service is running
   services.msc
   # Look for "OracleServiceXE" or similar
   ```

2. **Verify Credentials**
   - Username: Usually `system`, `sys`, or your custom user
   - Password: Your Oracle database password
   - Connection String: Usually `localhost:1521/XE` or `localhost:1521/ORCL`

3. **Test Connection with SQL*Plus**
   ```bash
   sqlplus username/password@localhost:1521/XE
   ```

### **Common Oracle Connection Strings**
- `localhost:1521/XE` (Oracle Express Edition)
- `localhost:1521/ORCL` (Oracle Standard)
- `localhost:1521/PDB1` (Pluggable Database)

### **If Database is Not Available**

You can temporarily use a mock database for testing:

1. **Install SQLite** (simpler alternative):
   ```bash
   cd ISFS_backend
   npm install sqlite3
   ```

2. **Or use a cloud database** like:
   - Oracle Cloud (free tier)
   - MySQL (easier setup)
   - PostgreSQL

## 🎯 Default Login Credentials

### **Admin Login** (after running schema)
- **Username**: `admin`
- **Password**: `password`

### **Farmer Login** (after registration)
- Register a new farmer account
- Use the phone number and password you set

## 📱 Features Available

### **Farmer Features**
- ✅ Farm Management
- ✅ Crop Tracking  
- ✅ Labour Management
- ✅ Equipment Tracking
- ✅ Sales & Revenue
- ✅ Analytics Dashboard

### **Admin Features**
- ✅ System Overview
- ✅ User Management
- ✅ Database Administration
- ✅ System Monitoring
- ✅ Advanced Analytics

## 🚨 Important Notes

1. **Database First**: You MUST set up the database before the application will work
2. **Environment Variables**: Update `.env` file with your actual database credentials
3. **Schema Script**: Run the `enhanced_schema.sql` to create all tables and data
4. **Port Conflicts**: Make sure ports 5000 (backend) and 5173 (frontend) are available

## 🆘 Need Help?

If you're still having issues:

1. **Check the console logs** in both backend and frontend terminals
2. **Verify database connection** using the test script
3. **Ensure Oracle client libraries** are installed on your system
4. **Check firewall settings** if using remote database

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Backend server starts without errors
- ✅ Frontend loads the home page
- ✅ Registration form works without 500 errors
- ✅ Login redirects to dashboard
- ✅ Dashboard shows statistics (even if zeros)

---

**The main issue was the database connection. Once you fix the `.env` file with correct Oracle credentials and run the schema script, everything should work perfectly!**
