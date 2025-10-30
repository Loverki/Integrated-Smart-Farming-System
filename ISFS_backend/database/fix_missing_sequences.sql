-- ========================================
-- FIX MISSING SEQUENCES
-- ========================================
-- Run this script if you get "sequence not found" errors
-- This will create all necessary sequences if they don't exist

SET SERVEROUTPUT ON;

-- Function to check and create sequence
DECLARE
  v_count NUMBER;
  v_max_id NUMBER;
  v_sql VARCHAR2(500);
BEGIN
  -- ===== FARMER_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'FARMER_SEQ';
  IF v_count = 0 THEN
    SELECT NVL(MAX(farmer_id), 0) INTO v_max_id FROM FARMER;
    v_sql := 'CREATE SEQUENCE FARMER_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('✅ FARMER_SEQ created starting from ' || (v_max_id + 1));
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ FARMER_SEQ already exists');
  END IF;

  -- ===== FARM_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'FARM_SEQ';
  IF v_count = 0 THEN
    SELECT NVL(MAX(farm_id), 0) INTO v_max_id FROM FARM;
    v_sql := 'CREATE SEQUENCE FARM_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('✅ FARM_SEQ created starting from ' || (v_max_id + 1));
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ FARM_SEQ already exists');
  END IF;

  -- ===== CROP_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'CROP_SEQ';
  IF v_count = 0 THEN
    SELECT NVL(MAX(crop_id), 0) INTO v_max_id FROM CROP;
    v_sql := 'CREATE SEQUENCE CROP_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('✅ CROP_SEQ created starting from ' || (v_max_id + 1));
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ CROP_SEQ already exists');
  END IF;

  -- ===== LABOUR_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'LABOUR_SEQ';
  IF v_count = 0 THEN
    SELECT NVL(MAX(labour_id), 0) INTO v_max_id FROM LABOUR;
    v_sql := 'CREATE SEQUENCE LABOUR_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('✅ LABOUR_SEQ created starting from ' || (v_max_id + 1));
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ LABOUR_SEQ already exists');
  END IF;

  -- ===== SALES_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'SALES_SEQ';
  IF v_count = 0 THEN
    SELECT NVL(MAX(sale_id), 0) INTO v_max_id FROM SALES;
    v_sql := 'CREATE SEQUENCE SALES_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('✅ SALES_SEQ created starting from ' || (v_max_id + 1));
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ SALES_SEQ already exists');
  END IF;

  -- ===== EQUIPMENT_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'EQUIPMENT_SEQ';
  IF v_count = 0 THEN
    SELECT NVL(MAX(equipment_id), 0) INTO v_max_id FROM EQUIPMENT;
    v_sql := 'CREATE SEQUENCE EQUIPMENT_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    EXECUTE IMMEDIATE v_sql;
    DBMS_OUTPUT.PUT_LINE('✅ EQUIPMENT_SEQ created starting from ' || (v_max_id + 1));
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ EQUIPMENT_SEQ already exists');
  END IF;

  -- ===== FERTILIZER_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'FERTILIZER_SEQ';
  IF v_count = 0 THEN
    BEGIN
      SELECT NVL(MAX(fertilizer_id), 0) INTO v_max_id FROM FERTILIZER;
      v_sql := 'CREATE SEQUENCE FERTILIZER_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
      EXECUTE IMMEDIATE v_sql;
      DBMS_OUTPUT.PUT_LINE('✅ FERTILIZER_SEQ created starting from ' || (v_max_id + 1));
    EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('⚠️  FERTILIZER table not found, skipping sequence');
    END;
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ FERTILIZER_SEQ already exists');
  END IF;

  -- ===== ADMIN_SEQ =====
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'ADMIN_SEQ';
  IF v_count = 0 THEN
    BEGIN
      SELECT NVL(MAX(admin_id), 0) INTO v_max_id FROM ADMIN;
      v_sql := 'CREATE SEQUENCE ADMIN_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
      EXECUTE IMMEDIATE v_sql;
      DBMS_OUTPUT.PUT_LINE('✅ ADMIN_SEQ created starting from ' || (v_max_id + 1));
    EXCEPTION
      WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('⚠️  ADMIN table not found, skipping sequence');
    END;
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ ADMIN_SEQ already exists');
  END IF;

  DBMS_OUTPUT.PUT_LINE('');
  DBMS_OUTPUT.PUT_LINE('========================================');
  DBMS_OUTPUT.PUT_LINE('All sequences are ready! ✅');
  DBMS_OUTPUT.PUT_LINE('========================================');
END;
/

-- Display all sequences status
SELECT 
  sequence_name,
  last_number AS next_value,
  increment_by,
  cache_size
FROM user_sequences
WHERE sequence_name IN (
  'FARMER_SEQ', 'FARM_SEQ', 'CROP_SEQ', 'LABOUR_SEQ', 
  'SALES_SEQ', 'EQUIPMENT_SEQ', 'FERTILIZER_SEQ', 'ADMIN_SEQ'
)
ORDER BY sequence_name;

