# 🔍 Debug Login Issue - Farmer Not Found

## 🐛 Problem

You're getting **"Farmer not found"** error when logging in, but you believe the farmer exists in the database.

From your screenshot:
- Query returned: `rowCount: 0`
- First row: `undefined`
- This means: **No farmer found with that phone number**

## 🎯 Possible Causes

### 1. **Phone Number Mismatch** (Most Common)
- Database has: `1234567890`
- You're entering: `123-456-7890` or `+1234567890`
- **Solution:** Use exact same format

### 2. **Extra Whitespace**
- Database has: `1234567890 ` (trailing space)
- You're entering: `1234567890` (no space)
- **Solution:** Check for hidden spaces

### 3. **Farmer Was Actually Deleted**
- You deleted farmer ID 2
- But database had that phone number
- **Solution:** Register again

### 4. **Wrong Database/Schema**
- Connected to different database
- Or different user schema
- **Solution:** Verify connection

## ✅ I've Added Debug Logging

I updated the login endpoint to show detailed debug information. 

### What You'll See Now:

When you try to login, the **backend console** will show:

```
🔐 Login attempt: {
  phone: '1234567890',
  phone_length: 10,
  phone_type: 'string',
  password_provided: true
}

📊 All farmers in database: [
  {
    id: 1,
    name: 'John Doe',
    phone: '9876543210',    ← All phone numbers in DB
    phone_trimmed: '9876543210',
    status: 'ACTIVE'
  },
  {
    id: 3,
    name: 'Jane Smith',
    phone: '1234567890',
    phone_trimmed: '1234567890',
    status: 'ACTIVE'
  }
]

🔍 Query result (exact match): {
  phone_searched: '1234567890',
  rowCount: 1,                  ← Found or not found
  firstRow: [3, 'Jane Smith', 'hash...', 'ACTIVE']
}
```

## 🚀 Steps to Fix

### Step 1: Restart Backend with Debug Logging

```bash
cd ISFS_backend
npm run dev
```

### Step 2: Check What's Actually in Database

**Option A: Run SQL Query**
```sql
-- Connect to your Oracle database
sqlplus your_username/your_password

-- See all farmers
SELECT farmer_id, name, phone, '|' || phone || '|' AS phone_marked, status
FROM FARMER
ORDER BY farmer_id;
```

**Option B: Run Debug Script**
```sql
@ISFS_backend/database/debug_farmer_login.sql
```

This will show:
- All farmers in database
- Their exact phone numbers
- Any whitespace issues
- Phone column data type

### Step 3: Try Login Again

1. Look at the backend console
2. You'll see **ALL farmers** printed out
3. Compare the phone number you're entering with what's in the database
4. Look for differences!

### Step 4: Match the Exact Format

If database shows:
```
phone: '9876543210'
```

Then login with exactly: `9876543210` (no spaces, no dashes, no +)

## 🔧 Quick Fixes

### Fix 1: Register a New Farmer

If the farmer really doesn't exist:

```bash
# Use the registration endpoint
POST /api/auth/register
{
  "name": "Test Farmer",
  "phone": "1234567890",  ← Use this exact number for login
  "password": "test123",
  "address": "Test Address"
}
```

### Fix 2: Check Database Directly

```sql
-- See if ANY farmers exist
SELECT COUNT(*) FROM FARMER;

-- If 0, you need to register
-- If > 0, check their phone numbers:
SELECT farmer_id, name, phone FROM FARMER;
```

### Fix 3: Use the Phone Number That Exists

From the debug output, you'll see all phone numbers. Use one of those to login!

## 📊 Check Your Database Now

Run this query:

```sql
SELECT 
    farmer_id,
    name,
    phone,
    status,
    reg_date
FROM FARMER
ORDER BY farmer_id;
```

**Expected output:**
```
FARMER_ID  NAME          PHONE        STATUS    REG_DATE
---------  -----------   ----------   -------   ----------
1          John Doe      9876543210   ACTIVE    28-OCT-24
3          Jane Smith    1234567890   ACTIVE    28-OCT-24
```

**If you see 0 rows:** No farmers exist! Register first.

**If you see farmers:** Use the EXACT phone number shown!

## 🧪 Test Cases

### Test 1: No Farmers Exist
```
Backend console: "📊 All farmers in database: []"
Action: Register a new farmer first
```

### Test 2: Farmer Exists, Wrong Phone
```
Backend console: 
  All farmers: [{ phone: '9876543210' }]
  Login attempt: { phone: '1234567890' }
Action: Use '9876543210' instead
```

### Test 3: Whitespace Issue
```
Backend console:
  All farmers: [{ phone: '1234567890 ', phone_trimmed: '1234567890' }]
  Login attempt: { phone: '1234567890' }
Action: The code now tries TRIM automatically!
```

## 🎉 What I Changed

The login endpoint now:
1. ✅ Logs the phone number you're trying to login with
2. ✅ Shows ALL farmers in the database
3. ✅ Tries exact match first
4. ✅ If that fails, tries with TRIM (removes spaces)
5. ✅ Shows detailed debug info in console

## 📝 Next Steps

1. **Restart backend** if not already running
2. **Try to login** 
3. **Look at backend console** - you'll see all farmers
4. **Compare** your phone input with database phone numbers
5. **Use the exact phone number** from the database

The backend logs will tell you EXACTLY what's wrong! 🔍

