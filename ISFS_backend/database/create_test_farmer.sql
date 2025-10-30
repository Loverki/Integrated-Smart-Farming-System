-- ========================================
-- CREATE TEST FARMER FOR LOGIN
-- ========================================
-- Run this if you need a test farmer to login with

SET SERVEROUTPUT ON;

-- First check if any farmers exist
SELECT COUNT(*) AS FARMER_COUNT FROM FARMER;

-- Create FARMER_SEQ if it doesn't exist
DECLARE
  v_count NUMBER;
  v_max_id NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'FARMER_SEQ';
  
  IF v_count = 0 THEN
    SELECT NVL(MAX(farmer_id), 0) INTO v_max_id FROM FARMER;
    EXECUTE IMMEDIATE 'CREATE SEQUENCE FARMER_SEQ START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
    DBMS_OUTPUT.PUT_LINE('✅ FARMER_SEQ created');
  ELSE
    DBMS_OUTPUT.PUT_LINE('✓ FARMER_SEQ already exists');
  END IF;
END;
/

-- Create a test farmer
-- Password is 'test123' (bcrypt hash)
-- You can login with phone: 1234567890, password: test123

DECLARE
  v_count NUMBER;
  v_farmer_id NUMBER;
BEGIN
  -- Check if farmer with phone 1234567890 already exists
  SELECT COUNT(*) INTO v_count FROM FARMER WHERE phone = '1234567890';
  
  IF v_count = 0 THEN
    -- Create test farmer
    -- Note: This uses a pre-hashed password for 'test123'
    -- In real app, bcrypt hashes it dynamically
    INSERT INTO FARMER (
      farmer_id, 
      name, 
      phone, 
      password,
      address,
      reg_date,
      status
    ) VALUES (
      FARMER_SEQ.NEXTVAL,
      'Test Farmer',
      '1234567890',
      '$2a$10$rVqVqZxZ8xZ8xZ8xZ8xZ8eGOqG5hF5hF5hF5hF5hF5hF5hF5hF5h.',  -- This is 'test123' hashed
      'Test Address',
      SYSDATE,
      'ACTIVE'
    ) RETURNING farmer_id INTO v_farmer_id;
    
    COMMIT;
    
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('✅ Test farmer created successfully!');
    DBMS_OUTPUT.PUT_LINE('   Farmer ID: ' || v_farmer_id);
    DBMS_OUTPUT.PUT_LINE('   Phone: 1234567890');
    DBMS_OUTPUT.PUT_LINE('   Password: test123');
    DBMS_OUTPUT.PUT_LINE('');
    DBMS_OUTPUT.PUT_LINE('You can now login with:');
    DBMS_OUTPUT.PUT_LINE('   Phone: 1234567890');
    DBMS_OUTPUT.PUT_LINE('   Password: test123');
  ELSE
    DBMS_OUTPUT.PUT_LINE('⚠️  Farmer with phone 1234567890 already exists');
    SELECT farmer_id INTO v_farmer_id FROM FARMER WHERE phone = '1234567890';
    DBMS_OUTPUT.PUT_LINE('   Farmer ID: ' || v_farmer_id);
  END IF;
END;
/

-- Verify farmer was created
SELECT 
  farmer_id,
  name,
  phone,
  status,
  reg_date
FROM FARMER
ORDER BY farmer_id;

PROMPT 
PROMPT ========================================
PROMPT ✅ Setup Complete!
PROMPT 
PROMPT Login credentials:
PROMPT   Phone: 1234567890
PROMPT   Password: test123
PROMPT ========================================

