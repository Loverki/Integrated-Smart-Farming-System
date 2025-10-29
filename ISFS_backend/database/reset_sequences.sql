-- ========================================
-- RESET SEQUENCES BASED ON ACTUAL DATA
-- ========================================
-- This script resets all sequences to match the current data in tables
-- Run this whenever you need to synchronize sequences with actual data

-- 1. RESET FARMER SEQUENCE
DECLARE
  v_max_farmer_id NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  -- Get the maximum farmer ID currently in the table
  SELECT NVL(MAX(farmer_id), 0) INTO v_max_farmer_id FROM FARMER;
  
  -- Drop and recreate the sequence starting from max_id + 1
  EXECUTE IMMEDIATE 'DROP SEQUENCE FARMER_SEQ';
  
  v_sql := 'CREATE SEQUENCE FARMER_SEQ START WITH ' || TO_CHAR(v_max_farmer_id + 1) || ' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ FARMER_SEQ reset to start from ' || TO_CHAR(v_max_farmer_id + 1));
END;
/

-- 2. RESET FARM SEQUENCE
DECLARE
  v_max_farm_id NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  SELECT NVL(MAX(farm_id), 0) INTO v_max_farm_id FROM FARM;
  
  EXECUTE IMMEDIATE 'DROP SEQUENCE FARM_SEQ';
  
  v_sql := 'CREATE SEQUENCE FARM_SEQ START WITH ' || TO_CHAR(v_max_farm_id + 1) || ' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ FARM_SEQ reset to start from ' || TO_CHAR(v_max_farm_id + 1));
END;
/

-- 3. RESET CROP SEQUENCE
DECLARE
  v_max_crop_id NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  SELECT NVL(MAX(crop_id), 0) INTO v_max_crop_id FROM CROP;
  
  EXECUTE IMMEDIATE 'DROP SEQUENCE CROP_SEQ';
  
  v_sql := 'CREATE SEQUENCE CROP_SEQ START WITH ' || TO_CHAR(v_max_crop_id + 1) || ' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ CROP_SEQ reset to start from ' || TO_CHAR(v_max_crop_id + 1));
END;
/

-- 4. RESET LABOUR SEQUENCE
DECLARE
  v_max_labour_id NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  SELECT NVL(MAX(labour_id), 0) INTO v_max_labour_id FROM LABOUR;
  
  EXECUTE IMMEDIATE 'DROP SEQUENCE LABOUR_SEQ';
  
  v_sql := 'CREATE SEQUENCE LABOUR_SEQ START WITH ' || TO_CHAR(v_max_labour_id + 1) || ' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ LABOUR_SEQ reset to start from ' || TO_CHAR(v_max_labour_id + 1));
END;
/

-- 5. RESET SALES SEQUENCE
DECLARE
  v_max_sale_id NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  SELECT NVL(MAX(sale_id), 0) INTO v_max_sale_id FROM SALES;
  
  EXECUTE IMMEDIATE 'DROP SEQUENCE SALES_SEQ';
  
  v_sql := 'CREATE SEQUENCE SALES_SEQ START WITH ' || TO_CHAR(v_max_sale_id + 1) || ' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ SALES_SEQ reset to start from ' || TO_CHAR(v_max_sale_id + 1));
END;
/

-- 6. RESET EQUIPMENT SEQUENCE
DECLARE
  v_max_equipment_id NUMBER;
  v_sql VARCHAR2(200);
BEGIN
  SELECT NVL(MAX(equipment_id), 0) INTO v_max_equipment_id FROM EQUIPMENT;
  
  EXECUTE IMMEDIATE 'DROP SEQUENCE EQUIPMENT_SEQ';
  
  v_sql := 'CREATE SEQUENCE EQUIPMENT_SEQ START WITH ' || TO_CHAR(v_max_equipment_id + 1) || ' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
  
  DBMS_OUTPUT.PUT_LINE('✅ EQUIPMENT_SEQ reset to start from ' || TO_CHAR(v_max_equipment_id + 1));
END;
/

-- Display current sequence status
SELECT 'All sequences have been reset successfully!' AS STATUS FROM DUAL;

-- Show current max IDs and what the next sequence values should be
SELECT 
  'FARMER' AS TABLE_NAME,
  NVL(MAX(farmer_id), 0) AS CURRENT_MAX_ID,
  NVL(MAX(farmer_id), 0) + 1 AS NEXT_SEQUENCE_VALUE
FROM FARMER
UNION ALL
SELECT 
  'FARM' AS TABLE_NAME,
  NVL(MAX(farm_id), 0) AS CURRENT_MAX_ID,
  NVL(MAX(farm_id), 0) + 1 AS NEXT_SEQUENCE_VALUE
FROM FARM
UNION ALL
SELECT 
  'CROP' AS TABLE_NAME,
  NVL(MAX(crop_id), 0) AS CURRENT_MAX_ID,
  NVL(MAX(crop_id), 0) + 1 AS NEXT_SEQUENCE_VALUE
FROM CROP
UNION ALL
SELECT 
  'LABOUR' AS TABLE_NAME,
  NVL(MAX(labour_id), 0) AS CURRENT_MAX_ID,
  NVL(MAX(labour_id), 0) + 1 AS NEXT_SEQUENCE_VALUE
FROM LABOUR
UNION ALL
SELECT 
  'SALES' AS TABLE_NAME,
  NVL(MAX(sale_id), 0) AS CURRENT_MAX_ID,
  NVL(MAX(sale_id), 0) + 1 AS NEXT_SEQUENCE_VALUE
FROM SALES
UNION ALL
SELECT 
  'EQUIPMENT' AS TABLE_NAME,
  NVL(MAX(equipment_id), 0) AS CURRENT_MAX_ID,
  NVL(MAX(equipment_id), 0) + 1 AS NEXT_SEQUENCE_VALUE
FROM EQUIPMENT;

