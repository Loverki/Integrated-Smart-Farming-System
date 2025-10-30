-- ========================================
-- QUICK FIX: Farm Update Hanging Issue
-- ========================================

-- Step 1: COMMIT any pending transactions
COMMIT;

-- Step 2: Check if farmer 3 exists (required for trigger)
SELECT farmer_id, name, status FROM FARMER WHERE farmer_id = 3;
-- If no rows, the trigger will fail!

-- Step 3: Check if farm 1 exists
SELECT farm_id, farmer_id, farm_name FROM FARM WHERE farm_id = 1;

-- Step 4: Check for locks
SELECT 
  s.sid,
  s.serial#,
  s.username,
  o.object_name,
  s.blocking_session
FROM v$session s
JOIN v$locked_object l ON s.sid = l.session_id
JOIN dba_objects o ON l.object_id = o.object_id
WHERE o.object_name IN ('FARM', 'FARMER');

-- Step 5: Try manual update to test
UPDATE FARM 
SET farm_name = 'TEST', location = 'TEST_LOCATION'
WHERE farm_id = 1 AND farmer_id = 3;

-- Did it work? If yes, commit:
COMMIT;

-- If it hangs here too, you have a lock. Kill the session:
-- Find the SID from step 4, then:
-- ALTER SYSTEM KILL SESSION 'sid,serial#';

-- Step 6: Temporarily disable trigger if it's causing issues
ALTER TRIGGER TRG_FARM_UPDATE DISABLE;

-- Try update again through your app

-- Re-enable after testing:
-- ALTER TRIGGER TRG_FARM_UPDATE ENABLE;

