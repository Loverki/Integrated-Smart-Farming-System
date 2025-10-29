-- ========================================
-- FIX FARMERS WITH NO PASSWORD
-- ========================================
-- This script finds and fixes farmers that have NULL passwords

-- 1. Check which farmers have no password
SELECT 
    FARMER_ID, 
    NAME, 
    PHONE,
    CASE WHEN PASSWORD IS NULL THEN 'NO PASSWORD' ELSE 'HAS PASSWORD' END AS PASSWORD_STATUS
FROM FARMER
ORDER BY FARMER_ID;

-- 2. Delete farmers with no password (recommended - they can register again)
-- UNCOMMENT TO RUN:
-- DELETE FROM FARMER WHERE PASSWORD IS NULL;
-- COMMIT;

-- 3. Alternative: Delete ALL farmers and start fresh (if you're in testing)
-- UNCOMMENT TO RUN:
-- DELETE FROM FARMER;
-- COMMIT;

-- 4. Verify all farmers have passwords
SELECT COUNT(*) AS farmers_with_no_password 
FROM FARMER 
WHERE PASSWORD IS NULL;

-- Should return 0 if all farmers have passwords

