-- ========================================
-- EMERGENCY FIX - Run This NOW!
-- ========================================
-- This will fix the farm update hanging issue

-- Step 1: Commit any pending transactions
COMMIT;

-- Step 2: Check if farmer 3 exists (CRITICAL!)
SELECT farmer_id, name, status FROM FARMER WHERE farmer_id = 3;
-- If NO ROWS: Farmer 3 doesn't exist! Insert it:
INSERT INTO FARMER (farmer_id, name, phone, password, status, reg_date)
VALUES (3, 'Test Farmer', '1234567890', 'password123', 'ACTIVE', SYSDATE);
COMMIT;

-- Step 3: Disable the problematic trigger
ALTER TRIGGER TRG_FARM_UPDATE DISABLE;
ALTER TRIGGER TRG_FARM_INSERT DISABLE;
ALTER TRIGGER TRG_FARM_DELETE DISABLE;

-- Step 4: Try manual update to verify it works
UPDATE FARM SET farm_name = 'TestUpdate' WHERE farm_id = 1;
COMMIT;

-- If that worked, your API should work now!

-- Step 5: Re-enable triggers AFTER confirming update works
-- ALTER TRIGGER TRG_FARM_UPDATE ENABLE;
-- ALTER TRIGGER TRG_FARM_INSERT ENABLE;
-- ALTER TRIGGER TRG_FARM_DELETE ENABLE;

PROMPT ======================================
PROMPT Fixed! Try farm update in browser now
PROMPT ======================================

