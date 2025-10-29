-- ========================================
-- ENSURE ALL REQUIRED SEQUENCES EXIST
-- ========================================
-- Run this script to create sequences if they don't exist
-- Safe to run multiple times

-- Check and create FARMER_SEQ
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'FARMER_SEQ';
  
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE FARMER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('✅ FARMER_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️  FARMER_SEQ already exists');
  END IF;
END;
/

-- Check and create FARM_SEQ
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'FARM_SEQ';
  
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE FARM_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('✅ FARM_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️  FARM_SEQ already exists');
  END IF;
END;
/

-- Check and create CROP_SEQ
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'CROP_SEQ';
  
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE CROP_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('✅ CROP_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️  CROP_SEQ already exists');
  END IF;
END;
/

-- Check and create LABOUR_SEQ
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'LABOUR_SEQ';
  
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE LABOUR_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('✅ LABOUR_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️  LABOUR_SEQ already exists');
  END IF;
END;
/

-- Check and create SALES_SEQ
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'SALES_SEQ';
  
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE SALES_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('✅ SALES_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️  SALES_SEQ already exists');
  END IF;
END;
/

-- Check and create EQUIPMENT_SEQ
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'EQUIPMENT_SEQ';
  
  IF v_count = 0 THEN
    EXECUTE IMMEDIATE 'CREATE SEQUENCE EQUIPMENT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
    DBMS_OUTPUT.PUT_LINE('✅ EQUIPMENT_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('ℹ️  EQUIPMENT_SEQ already exists');
  END IF;
END;
/

-- Verify all sequences
SELECT sequence_name, last_number 
FROM user_sequences 
WHERE sequence_name IN ('FARMER_SEQ', 'FARM_SEQ', 'CROP_SEQ', 'LABOUR_SEQ', 'SALES_SEQ', 'EQUIPMENT_SEQ')
ORDER BY sequence_name;

DBMS_OUTPUT.PUT_LINE('✅ All required sequences verified!');

