-- ========================================
-- CREATE STORED PROCEDURE TO RESET SEQUENCES
-- ========================================
-- This procedure can be called anytime to reset a specific sequence
-- or all sequences at once

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

-- ========================================
-- CREATE PROCEDURE TO RESET ALL SEQUENCES
-- ========================================
CREATE OR REPLACE PROCEDURE RESET_ALL_SEQUENCES AS
BEGIN
  DBMS_OUTPUT.PUT_LINE('🔄 Resetting all sequences...');
  
  RESET_SEQUENCE('FARMER_SEQ');
  RESET_SEQUENCE('FARM_SEQ');
  RESET_SEQUENCE('CROP_SEQ');
  RESET_SEQUENCE('LABOUR_SEQ');
  RESET_SEQUENCE('SALES_SEQ');
  RESET_SEQUENCE('EQUIPMENT_SEQ');
  
  -- Reset additional sequences if they exist
  BEGIN
    RESET_SEQUENCE('FERTILIZER_SEQ');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
  BEGIN
    RESET_SEQUENCE('LABOUR_WORK_SEQ');
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
  
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

-- Test the procedures
BEGIN
  DBMS_OUTPUT.PUT_LINE('Testing sequence reset procedures...');
  RESET_ALL_SEQUENCES;
END;
/

SELECT 'Sequence reset procedures created successfully!' AS STATUS FROM DUAL;

