-- ========================================
-- DEBUG FARMER LOGIN ISSUE
-- ========================================
-- Run these queries to find out why login is failing

SET SERVEROUTPUT ON;

-- 1. Check if FARMER table exists and has data
SELECT 'Checking FARMER table...' AS STATUS FROM DUAL;

SELECT COUNT(*) AS TOTAL_FARMERS FROM FARMER;

-- 2. Show all farmers with their phone numbers
SELECT 
    farmer_id,
    name,
    phone,
    status,
    LENGTHB(phone) AS phone_length,
    DUMP(phone) AS phone_dump
FROM FARMER
ORDER BY farmer_id;

-- 3. Check for whitespace or special characters in phone numbers
SELECT 
    farmer_id,
    name,
    phone,
    '|' || phone || '|' AS phone_with_markers,
    CASE 
        WHEN phone LIKE ' %' THEN 'Leading space'
        WHEN phone LIKE '% ' THEN 'Trailing space'
        ELSE 'No extra spaces'
    END AS whitespace_check
FROM FARMER;

-- 4. Check data type of phone column
SELECT 
    column_name,
    data_type,
    data_length,
    nullable
FROM user_tab_columns
WHERE table_name = 'FARMER'
AND column_name = 'PHONE';

-- 5. Try different phone number formats
-- Replace 'YOUR_PHONE_HERE' with the phone number you're trying to login with
DEFINE test_phone = '1234567890'

SELECT 
    farmer_id,
    name,
    phone,
    status
FROM FARMER
WHERE phone = '&test_phone';

-- Also try with TRIM
SELECT 
    farmer_id,
    name,
    phone,
    status
FROM FARMER
WHERE TRIM(phone) = TRIM('&test_phone');

-- 6. Show the exact SQL query that the app is running
SELECT 
    'The app runs this query:' AS info,
    'SELECT FARMER_ID, NAME, PASSWORD, STATUS FROM FARMER WHERE PHONE = :phone' AS query
FROM DUAL;

-- 7. Check if there are any triggers or issues with the FARMER table
SELECT 
    trigger_name,
    status,
    trigger_type
FROM user_triggers
WHERE table_name = 'FARMER';

PROMPT 
PROMPT ========================================
PROMPT INSTRUCTIONS:
PROMPT 1. Look at the phone numbers in the output above
PROMPT 2. Compare with the phone number you're using to login
PROMPT 3. Check for extra spaces or different format
PROMPT 4. Make sure the farmer STATUS is 'ACTIVE'
PROMPT ========================================

