# 🚀 Setup Instructions - Fix Registration Error

## Problem

You're getting this error when registering a farmer:
```
500 Internal Server Error
Failed to load resource: the server responded with a status of 500
```

## Quick Fix ✅

**The registration will now work WITHOUT any additional setup!**

I've updated the code to make the sequence reset **optional**. Registration will work fine even without the stored procedures.

## To Enable Auto-Reset Feature (Optional)

If you want the **automatic sequence reset** feature (recommended), follow these steps:

### Option 1: Using SQL*Plus or Oracle SQL Developer

1. **Open your Oracle SQL client** (SQL*Plus, SQL Developer, etc.)

2. **Connect to your database:**
   ```sql
   sqlplus your_username/your_password@your_database
   ```

3. **Run the procedure creation script:**
   ```sql
   @C:\Coding\db_pr\Integrated-Smart-Farming-System\ISFS_backend\database\create_reset_sequence_procedure.sql
   ```
   
   Or if you're already in the project directory:
   ```sql
   @ISFS_backend/database/create_reset_sequence_procedure.sql
   ```

4. **Done!** Auto-reset will now work.

### Option 2: Copy and Paste SQL

If you can't run the SQL file directly, copy and paste this SQL into your Oracle client:

```sql
-- Create RESET_SEQUENCE procedure
CREATE OR REPLACE PROCEDURE RESET_SEQUENCE(
  p_sequence_name IN VARCHAR2
) AS
  v_table_name VARCHAR2(50);
  v_max_id NUMBER;
  v_sql VARCHAR2(500);
BEGIN
  -- Determine table name from sequence name
  v_table_name := REPLACE(p_sequence_name, '_SEQ', '');
  
  -- Get max ID from the table
  EXECUTE IMMEDIATE 'SELECT NVL(MAX(' || v_table_name || '_ID), 0) FROM ' || v_table_name
    INTO v_max_id;
  
  -- Drop and recreate sequence
  BEGIN
    EXECUTE IMMEDIATE 'DROP SEQUENCE ' || p_sequence_name;
  EXCEPTION
    WHEN OTHERS THEN
      NULL; -- Ignore if sequence doesn't exist
  END;
  
  v_sql := 'CREATE SEQUENCE ' || p_sequence_name || 
           ' START WITH ' || TO_CHAR(v_max_id + 1) || 
           ' INCREMENT BY 1 NOCACHE NOCYCLE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ ' || p_sequence_name || ' reset to start from ' || TO_CHAR(v_max_id + 1));
  
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('❌ Error resetting ' || p_sequence_name || ': ' || SQLERRM);
    RAISE;
END RESET_SEQUENCE;
/

-- Create RESET_ALL_SEQUENCES procedure
CREATE OR REPLACE PROCEDURE RESET_ALL_SEQUENCES AS
BEGIN
  DBMS_OUTPUT.PUT_LINE('🔄 Resetting all sequences...');
  
  RESET_SEQUENCE('FARMER_SEQ');
  RESET_SEQUENCE('FARM_SEQ');
  RESET_SEQUENCE('CROP_SEQ');
  RESET_SEQUENCE('LABOUR_SEQ');
  RESET_SEQUENCE('SALES_SEQ');
  RESET_SEQUENCE('EQUIPMENT_SEQ');
  
  DBMS_OUTPUT.PUT_LINE('✅ All sequences reset successfully!');
  
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('❌ Error in RESET_ALL_SEQUENCES: ' || SQLERRM);
    RAISE;
END RESET_ALL_SEQUENCES;
/

-- Grant execute permissions
GRANT EXECUTE ON RESET_SEQUENCE TO PUBLIC;
GRANT EXECUTE ON RESET_ALL_SEQUENCES TO PUBLIC;

-- Verify creation
SELECT object_name, object_type, status 
FROM user_objects 
WHERE object_name IN ('RESET_SEQUENCE', 'RESET_ALL_SEQUENCES');
```

5. **Verify it worked:**
   ```sql
   SELECT object_name, object_type, status 
   FROM user_objects 
   WHERE object_name IN ('RESET_SEQUENCE', 'RESET_ALL_SEQUENCES');
   ```
   
   Expected output:
   ```
   OBJECT_NAME            OBJECT_TYPE    STATUS
   RESET_SEQUENCE         PROCEDURE      VALID
   RESET_ALL_SEQUENCES    PROCEDURE      VALID
   ```

## What Changed

### Before (Caused Error):
```javascript
// Always tried to reset sequence
await connection.execute(`BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;`);
// ❌ If procedure doesn't exist → 500 Error
```

### After (Works Always):
```javascript
// Check if procedure exists first
const procCheck = await connection.execute(
  `SELECT COUNT(*) FROM user_objects 
   WHERE object_type = 'PROCEDURE' AND object_name = 'RESET_SEQUENCE'`
);

if (procCheck.rows[0][0] > 0) {
  // Procedure exists, use it ✅
  await connection.execute(`BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;`);
} else {
  // Procedure doesn't exist, skip it (registration still works) ✅
  console.log("Skipping sequence reset - procedure not found");
}
```

## Testing

### Test Registration Now:

1. **Restart your backend server** (if running)
   ```bash
   cd ISFS_backend
   npm start
   ```

2. **Try registering a farmer**
   - Go to: http://localhost:5173/register
   - Fill in the form
   - Click Register
   - ✅ Should work now!

### What You'll See in Console:

**Without Procedure:**
```
ℹ️  RESET_SEQUENCE procedure not found - skipping auto-reset (this is optional)
💡 To enable auto-reset, run: @ISFS_backend/database/create_reset_sequence_procedure.sql
✅ New farmer registered with ID: 1
```

**With Procedure:**
```
✅ Farmer sequence auto-reset before registration
✅ New farmer registered with ID: 1
```

## Benefits of Having the Procedure

### Without Procedure:
- ✅ Registration works
- ⚠️ Sequence doesn't auto-reset
- ⚠️ May get ID 21, 22, 23... if farmers were deleted

### With Procedure:
- ✅ Registration works
- ✅ Sequence auto-resets
- ✅ Always get correct sequential IDs (1, 2, 3...)

## Recommendation

**For Production:**
- ✅ Install the procedures (one-time setup)
- ✅ Ensures clean sequential IDs
- ✅ Better database management

**For Testing/Development:**
- ✅ Can skip the procedure installation
- ✅ Registration still works fine
- ⚠️ Just won't have auto-reset

## Current Status

✅ **Registration Error:** FIXED  
✅ **Registration:** Works WITHOUT procedures  
🔄 **Auto-Reset:** Optional (requires procedure installation)

## Quick Command Reference

```bash
# Start backend
cd ISFS_backend
npm start

# Start frontend
cd ISFS_frontend
npm run dev

# Test registration
# Navigate to: http://localhost:5173/register
```

## If You Still Get Errors

1. **Check server logs** (terminal where backend is running)
2. **Check browser console** (F12 → Console tab)
3. **Verify database connection** works
4. **Check FARMER_SEQ exists** in database:
   ```sql
   SELECT sequence_name FROM user_sequences WHERE sequence_name = 'FARMER_SEQ';
   ```

---

**Status:** ✅ Registration Fixed  
**Action Required:** None (optional: install procedures)  
**Ready to Use:** Yes

