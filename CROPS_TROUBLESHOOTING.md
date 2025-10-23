# 🌾 Crops Page 500 Error - Troubleshooting Guide

## Problem
When clicking "View Crops" from the dashboard, you get a **500 Internal Server Error** from `GET http://localhost:5000/api/crops`.

## Quick Fix Steps

### Step 1: Test Database Connection
First, let's verify your database is set up correctly:

```bash
cd Integrated-Smart-Farming-System\ISFS_backend
node test-crops-query.js
```

This will test:
- ✅ Database connection
- ✅ CROP table exists
- ✅ FARM table exists
- ✅ The crops JOIN query works
- ✅ Display any errors found

### Step 2: Check .env File
Make sure you have a `.env` file in `ISFS_backend/` directory with:

```env
# Database Configuration
DB_USER=your_oracle_username
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XEPDB1

# JWT Secret
JWT_SECRET=your_secret_key_here

# Port
PORT=5000
```

**Replace the placeholder values with your actual Oracle database credentials!**

### Step 3: Verify Database Schema
If the test shows tables don't exist, run the schema script:

1. Open Oracle SQL*Plus or SQL Developer
2. Run the file: `ISFS_backend/database/enhanced_schema.sql`
3. This creates all necessary tables, sequences, and sample data

### Step 4: Restart Backend Server
After fixing any issues, restart the backend:

```bash
# Stop the current server (Ctrl+C in the backend terminal)

# Start it again
cd Integrated-Smart-Farming-System\ISFS_backend
npm start
```

### Step 5: Check Backend Logs
When you refresh the crops page, look at the backend terminal output. You should see:

```
📊 Fetching crops for farmer 1
✅ Retrieved 0 crops for farmer 1
```

Or if there's an error, you'll see:
```
❌ Get crops error: [specific error message]
```

## Common Issues & Solutions

### Issue 1: "Table or view does not exist"
**Solution:** Run the `enhanced_schema.sql` script in your Oracle database.

```sql
-- In SQL*Plus or SQL Developer:
@C:\Coding\project\Integrated-Smart-Farming-System\ISFS_backend\database\enhanced_schema.sql
```

### Issue 2: "ORA-01017: invalid username/password"
**Solution:** Update your `.env` file with correct Oracle credentials.

To find your Oracle credentials:
```bash
# Try connecting with SQL*Plus
sqlplus system/yourpassword@localhost:1521/XE
```

### Issue 3: "Unauthorized - farmer not found"
**Solution:** Your JWT token is invalid or expired.
1. Log out from the application
2. Log in again with your farmer credentials
3. Try accessing crops page again

### Issue 4: Backend shows "Cannot find module"
**Solution:** Reinstall dependencies
```bash
cd Integrated-Smart-Farming-System\ISFS_backend
npm install
```

### Issue 5: Port 5000 already in use
**Solution:** 
1. Find and kill the process using port 5000:
   ```powershell
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```
2. Or change the PORT in `.env` file to a different number (e.g., 5001)

## Verify Everything Works

After fixing, you should see:

### ✅ Backend Terminal:
```
✅ Connected to Oracle Database
🚀 Server running on port 5000
```

### ✅ Frontend Crops Page:
- Either shows a list of crops in a table
- Or shows "No crops planted yet" message

### ✅ NO Errors:
- No 500 errors in browser console
- No red error messages on the page

## Still Having Issues?

Run the diagnostic test and share the output:

```bash
cd Integrated-Smart-Farming-System\ISFS_backend
node test-crops-query.js > crops-test-output.txt 2>&1
```

Then check the `crops-test-output.txt` file for detailed error information.

## What Was Fixed

1. **Added detailed error logging** to the crops route
2. **Created diagnostic test script** (`test-crops-query.js`)
3. **Improved error handling** in the backend
4. **Better error messages** for debugging

The crops page UI was already implemented correctly - the issue was purely the backend API endpoint failing.

