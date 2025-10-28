-- ============================================================================
-- INTEGRATED SMART FARMING SYSTEM (ISFS)
-- COMPLETE SQL COMMANDS REFERENCE
-- ============================================================================
-- This file contains ALL SQL commands used in the project with comments
-- showing where each command is used in the application
-- ============================================================================

-- ============================================================================
-- SECTION 1: DATABASE SCHEMA SETUP
-- File: ISFS_backend/database/enhanced_schema.sql
-- ============================================================================

-- Drop existing tables (Clean setup)
DROP TABLE SALES CASCADE CONSTRAINTS;
DROP TABLE FERTILIZER CASCADE CONSTRAINTS;
DROP TABLE LABOURWORK CASCADE CONSTRAINTS;
DROP TABLE CROP CASCADE CONSTRAINTS;
DROP TABLE FARM CASCADE CONSTRAINTS;
DROP TABLE FARMER CASCADE CONSTRAINTS;
DROP TABLE LABOUR CASCADE CONSTRAINTS;
DROP TABLE ADMIN CASCADE CONSTRAINTS;
DROP TABLE WEATHER_DATA CASCADE CONSTRAINTS;
DROP TABLE SOIL_ANALYSIS CASCADE CONSTRAINTS;
DROP TABLE EQUIPMENT CASCADE CONSTRAINTS;
DROP TABLE EQUIPMENT_MAINTENANCE CASCADE CONSTRAINTS;
DROP TABLE PESTICIDE CASCADE CONSTRAINTS;
DROP TABLE IRRIGATION CASCADE CONSTRAINTS;
DROP TABLE CROP_DISEASES CASCADE CONSTRAINTS;

-- Drop sequences
DROP SEQUENCE FARMER_SEQ;
DROP SEQUENCE FARM_SEQ;
DROP SEQUENCE CROP_SEQ;
DROP SEQUENCE LABOUR_SEQ;
DROP SEQUENCE SALES_SEQ;
DROP SEQUENCE FERTILIZER_SEQ;
DROP SEQUENCE ADMIN_SEQ;
DROP SEQUENCE WEATHER_SEQ;
DROP SEQUENCE SOIL_SEQ;
DROP SEQUENCE EQUIPMENT_SEQ;
DROP SEQUENCE MAINTENANCE_SEQ;
DROP SEQUENCE PESTICIDE_SEQ;
DROP SEQUENCE IRRIGATION_SEQ;
DROP SEQUENCE DISEASE_SEQ;

-- Create sequences
CREATE SEQUENCE FARMER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE FARM_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE CROP_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE LABOUR_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SALES_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE FERTILIZER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ADMIN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE WEATHER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SOIL_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE EQUIPMENT_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE MAINTENANCE_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE PESTICIDE_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IRRIGATION_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE DISEASE_SEQ START WITH 1 INCREMENT BY 1;

-- ============================================================================
-- FARMER TABLE
-- Used in: authRoutes.js (register, login), farmerController.js
-- Features: Auto-updated total_farms and total_area via triggers
-- ============================================================================
CREATE TABLE FARMER (
    farmer_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(15) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE,
    address VARCHAR2(200),
    password VARCHAR2(255) NOT NULL,
    reg_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    total_farms NUMBER DEFAULT 0,      -- Auto-updated by TRG_FARM_INSERT/UPDATE/DELETE
    total_area NUMBER DEFAULT 0        -- Auto-updated by TRG_FARM_INSERT/UPDATE/DELETE
);

-- ============================================================================
-- ADMIN TABLE
-- Used in: adminRoutes.js (login, user management)
-- ============================================================================
CREATE TABLE ADMIN (
    admin_id NUMBER PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(255) NOT NULL,
    full_name VARCHAR2(100) NOT NULL,
    role VARCHAR2(30) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER')),
    created_date DATE DEFAULT SYSDATE,
    last_login DATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- ============================================================================
-- FARM TABLE
-- Used in: farmRoutes.js (CRUD operations)
-- Features: Triggers auto-update farmer totals when farms change
-- ============================================================================
CREATE TABLE FARM (
    farm_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    farm_name VARCHAR2(100) NOT NULL,
    location VARCHAR2(100),
    area NUMBER NOT NULL CHECK (area > 0),
    soil_type VARCHAR2(50),
    soil_ph NUMBER(3,1) CHECK (soil_ph BETWEEN 0 AND 14),
    irrigation_type VARCHAR2(50),
    farm_type VARCHAR2(30) CHECK (farm_type IN ('ORGANIC', 'CONVENTIONAL', 'HYBRID')),
    created_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE'))
);

-- ============================================================================
-- CROP TABLE
-- Used in: cropRoutes.js (CRUD operations with date validation)
-- Features: Date validation (harvest dates must be after sowing date)
-- ============================================================================
CREATE TABLE CROP (
    crop_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    crop_name VARCHAR2(100) NOT NULL,
    variety VARCHAR2(50),
    sowing_date DATE NOT NULL,                    -- Required field
    expected_harvest_date DATE,                   -- Must be > sowing_date
    actual_harvest_date DATE,                     -- Must be > sowing_date (updated later)
    expected_yield NUMBER,
    actual_yield NUMBER,                          -- Recorded after harvest
    crop_status VARCHAR2(20) DEFAULT 'PLANTED' CHECK (crop_status IN ('PLANTED', 'GROWING', 'MATURE', 'HARVESTED')),
    seed_quantity NUMBER,                         -- Added for seed tracking
    planting_density NUMBER,
    growth_stage VARCHAR2(30) CHECK (growth_stage IN ('PLANTED', 'GERMINATION', 'VEGETATIVE', 'FLOWERING', 'MATURITY')),
    notes VARCHAR2(500)
);

-- ============================================================================
-- LABOUR TABLE
-- Used in: labourRoutes.js (CRUD operations)
-- ============================================================================
CREATE TABLE LABOUR (
    labour_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    name VARCHAR2(100) NOT NULL,
    phone VARCHAR2(15),
    skill_type VARCHAR2(50),
    daily_wage NUMBER,
    status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    hired_date DATE DEFAULT SYSDATE
);

-- ============================================================================
-- LABOURWORK TABLE
-- Used in: labourWorkRoutes.js (track daily work)
-- ============================================================================
CREATE TABLE LABOURWORK (
    work_id NUMBER PRIMARY KEY,
    labour_id NUMBER REFERENCES LABOUR(labour_id) ON DELETE CASCADE,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    work_date DATE DEFAULT SYSDATE,
    work_type VARCHAR2(100),
    hours_worked NUMBER,
    amount_paid NUMBER,
    notes VARCHAR2(300)
);

-- ============================================================================
-- SALES TABLE
-- Used in: salesRoutes.js (record crop sales)
-- ============================================================================
CREATE TABLE SALES (
    sale_id NUMBER PRIMARY KEY,
    crop_id NUMBER REFERENCES CROP(crop_id) ON DELETE CASCADE,
    sale_date DATE DEFAULT SYSDATE,
    quantity_sold NUMBER NOT NULL CHECK (quantity_sold > 0),
    price_per_unit NUMBER NOT NULL CHECK (price_per_unit > 0),
    buyer_name VARCHAR2(100),
    total_amount NUMBER,
    payment_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'CANCELLED'))
);

-- ============================================================================
-- FERTILIZER TABLE
-- Used in: fertilizerRoutes.js (fertilizer management)
-- ============================================================================
CREATE TABLE FERTILIZER (
    fertilizer_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    fertilizer_name VARCHAR2(100),
    application_date DATE,
    quantity NUMBER,
    cost NUMBER,
    notes VARCHAR2(300)
);

-- ============================================================================
-- EQUIPMENT TABLE
-- Used in: equipmentRoutes.js (equipment inventory)
-- ============================================================================
CREATE TABLE EQUIPMENT (
    equipment_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    equipment_name VARCHAR2(100) NOT NULL,
    equipment_type VARCHAR2(50),
    purchase_date DATE,
    purchase_cost NUMBER,
    status VARCHAR2(20) DEFAULT 'OPERATIONAL' CHECK (status IN ('OPERATIONAL', 'MAINTENANCE', 'RETIRED'))
);

-- ============================================================================
-- EQUIPMENT_MAINTENANCE TABLE
-- Used in: equipmentRoutes.js (maintenance tracking)
-- ============================================================================
CREATE TABLE EQUIPMENT_MAINTENANCE (
    maintenance_id NUMBER PRIMARY KEY,
    equipment_id NUMBER REFERENCES EQUIPMENT(equipment_id) ON DELETE CASCADE,
    maintenance_date DATE DEFAULT SYSDATE,
    maintenance_type VARCHAR2(50),
    cost NUMBER,
    notes VARCHAR2(300)
);

-- ============================================================================
-- WEATHER_DATA TABLE
-- Used in: For weather tracking (future feature)
-- ============================================================================
CREATE TABLE WEATHER_DATA (
    weather_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    temperature NUMBER(5,2),
    rainfall NUMBER(5,2),
    humidity NUMBER(5,2),
    wind_speed NUMBER(5,2)
);

-- ============================================================================
-- SOIL_ANALYSIS TABLE
-- Used in: For soil testing records
-- ============================================================================
CREATE TABLE SOIL_ANALYSIS (
    analysis_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    analysis_date DATE DEFAULT SYSDATE,
    nitrogen_level NUMBER(5,2),
    phosphorus_level NUMBER(5,2),
    potassium_level NUMBER(5,2),
    ph_level NUMBER(3,1),
    recommendations VARCHAR2(500)
);

-- ============================================================================
-- PESTICIDE TABLE
-- Used in: For pesticide application tracking
-- ============================================================================
CREATE TABLE PESTICIDE (
    pesticide_id NUMBER PRIMARY KEY,
    crop_id NUMBER REFERENCES CROP(crop_id) ON DELETE CASCADE,
    pesticide_name VARCHAR2(100),
    application_date DATE,
    quantity NUMBER,
    cost NUMBER,
    target_pest VARCHAR2(100)
);

-- ============================================================================
-- IRRIGATION TABLE
-- Used in: For irrigation management
-- ============================================================================
CREATE TABLE IRRIGATION (
    irrigation_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    irrigation_date DATE DEFAULT SYSDATE,
    water_used NUMBER,
    duration_minutes NUMBER,
    irrigation_method VARCHAR2(50)
);

-- ============================================================================
-- CROP_DISEASES TABLE
-- Used in: For disease tracking
-- ============================================================================
CREATE TABLE CROP_DISEASES (
    disease_id NUMBER PRIMARY KEY,
    crop_id NUMBER REFERENCES CROP(crop_id) ON DELETE CASCADE,
    disease_name VARCHAR2(100),
    identified_date DATE DEFAULT SYSDATE,
    severity VARCHAR2(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    treatment VARCHAR2(300)
);

-- ============================================================================
-- SECTION 2: TRIGGERS - AUTO-UPDATE FARMER TOTALS
-- File: ISFS_backend/database/farmer_farm_triggers.sql
-- ============================================================================

-- ============================================================================
-- TRG_FARM_INSERT
-- Fires: After INSERT on FARM
-- Action: Increments total_farms by 1 and adds farm area to total_area
-- Used by: farmRoutes.js POST /farms
-- ============================================================================
CREATE OR REPLACE TRIGGER TRG_FARM_INSERT
AFTER INSERT ON FARM
FOR EACH ROW
BEGIN
    UPDATE FARMER
    SET total_farms = total_farms + 1,
        total_area = total_area + :NEW.area
    WHERE farmer_id = :NEW.farmer_id;
END;
/

-- ============================================================================
-- TRG_FARM_UPDATE
-- Fires: After UPDATE on FARM
-- Action: Updates total_area when farm area changes or ownership transfers
-- Used by: farmRoutes.js PUT /farms/:id
-- ============================================================================
CREATE OR REPLACE TRIGGER TRG_FARM_UPDATE
AFTER UPDATE ON FARM
FOR EACH ROW
BEGIN
    -- Case 1: Farm area changed (same owner)
    IF :OLD.farmer_id = :NEW.farmer_id AND :OLD.area != :NEW.area THEN
        UPDATE FARMER
        SET total_area = total_area - :OLD.area + :NEW.area
        WHERE farmer_id = :NEW.farmer_id;
    END IF;
    
    -- Case 2: Farm transferred to different farmer
    IF :OLD.farmer_id != :NEW.farmer_id THEN
        -- Decrease old farmer's counts
        UPDATE FARMER
        SET total_farms = total_farms - 1,
            total_area = total_area - :OLD.area
        WHERE farmer_id = :OLD.farmer_id;
        
        -- Increase new farmer's counts
        UPDATE FARMER
        SET total_farms = total_farms + 1,
            total_area = total_area + :NEW.area
        WHERE farmer_id = :NEW.farmer_id;
    END IF;
END;
/

-- ============================================================================
-- TRG_FARM_DELETE
-- Fires: After DELETE on FARM
-- Action: Decrements total_farms by 1 and subtracts farm area from total_area
-- Used by: farmRoutes.js DELETE /farms/:id
-- ============================================================================
CREATE OR REPLACE TRIGGER TRG_FARM_DELETE
AFTER DELETE ON FARM
FOR EACH ROW
BEGIN
    UPDATE FARMER
    SET total_farms = total_farms - 1,
        total_area = total_area - :OLD.area
    WHERE farmer_id = :OLD.farmer_id;
END;
/

-- ============================================================================
-- SECTION 3: STORED PROCEDURES
-- ============================================================================

-- ============================================================================
-- RECALC_FARMER_TOTALS
-- Purpose: Recalculates total_farms and total_area for all farmers
-- Used by: adminRoutes.js POST /admin/recalculate-farmer-totals
--          setup-triggers-simple.js (setup script)
-- ============================================================================
CREATE OR REPLACE PROCEDURE RECALC_FARMER_TOTALS IS
    CURSOR farmer_cursor IS
        SELECT farmer_id FROM FARMER;
    
    v_total_farms NUMBER;
    v_total_area NUMBER;
BEGIN
    FOR farmer_rec IN farmer_cursor LOOP
        -- Calculate actual totals from FARM table
        SELECT COUNT(*), NVL(SUM(area), 0)
        INTO v_total_farms, v_total_area
        FROM FARM
        WHERE farmer_id = farmer_rec.farmer_id
          AND status = 'ACTIVE';
        
        -- Update FARMER table
        UPDATE FARMER
        SET total_farms = v_total_farms,
            total_area = v_total_area
        WHERE farmer_id = farmer_rec.farmer_id;
    END LOOP;
    
    COMMIT;
END RECALC_FARMER_TOTALS;
/

-- ============================================================================
-- SECTION 4: API QUERIES
-- These queries are used in the backend routes
-- ============================================================================

-- ============================================================================
-- AUTH ROUTES (authRoutes.js)
-- ============================================================================

-- Register new farmer
-- File: authRoutes.js POST /register
INSERT INTO FARMER (farmer_id, name, phone, email, password, address)
VALUES (FARMER_SEQ.NEXTVAL, :name, :phone, :email, :password, :address);

-- Login farmer
-- File: authRoutes.js POST /login
SELECT FARMER_ID, NAME, PHONE, EMAIL, PASSWORD, STATUS 
FROM FARMER 
WHERE PHONE = :phone;

-- ============================================================================
-- FARM ROUTES (farmRoutes.js)
-- ============================================================================

-- Get all farms for a farmer
-- File: farmRoutes.js GET /farms
SELECT 
    farm_id, farmer_id, farm_name, location, area, 
    soil_type, soil_ph, irrigation_type, farm_type, 
    created_date, status
FROM FARM
WHERE farmer_id = :farmer_id
ORDER BY created_date DESC;

-- Create new farm (triggers TRG_FARM_INSERT)
-- File: farmRoutes.js POST /farms
INSERT INTO FARM (
    farm_id, farmer_id, farm_name, location, area,
    soil_type, soil_ph, irrigation_type, farm_type
) VALUES (
    FARM_SEQ.NEXTVAL, :farmer_id, :farm_name, :location, :area,
    :soil_type, :soil_ph, :irrigation_type, :farm_type
);

-- Update farm (triggers TRG_FARM_UPDATE)
-- File: farmRoutes.js PUT /farms/:id
UPDATE FARM SET
    farm_name = :farm_name,
    location = :location,
    area = :area,
    soil_type = :soil_type,
    soil_ph = :soil_ph,
    irrigation_type = :irrigation_type,
    farm_type = :farm_type
WHERE farm_id = :farm_id AND farmer_id = :farmer_id;

-- Delete farm (triggers TRG_FARM_DELETE)
-- File: farmRoutes.js DELETE /farms/:id
DELETE FROM FARM 
WHERE farm_id = :farm_id AND farmer_id = :farmer_id;

-- ============================================================================
-- CROP ROUTES (cropRoutes.js)
-- ============================================================================

-- Get all crops for a farmer
-- File: cropRoutes.js GET /crops
SELECT 
    c.crop_id, c.farm_id, c.crop_name, c.variety,
    c.sowing_date, c.expected_harvest_date, c.actual_harvest_date,
    c.expected_yield, c.actual_yield, c.crop_status,
    c.seed_quantity, c.planting_density, c.growth_stage,
    f.farm_name, f.location AS farm_location
FROM CROP c
JOIN FARM f ON c.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id
ORDER BY c.sowing_date DESC;

-- Get single crop by ID
-- File: cropRoutes.js GET /crops/:crop_id
SELECT 
    c.crop_id, c.farm_id, c.crop_name, c.variety,
    c.sowing_date, c.expected_harvest_date, c.actual_harvest_date,
    c.expected_yield, c.actual_yield, c.crop_status,
    c.seed_quantity, c.planting_density, c.growth_stage, c.notes,
    f.farm_name, f.location AS farm_location
FROM CROP c
JOIN FARM f ON c.farm_id = f.farm_id
WHERE c.crop_id = :crop_id AND f.farmer_id = :farmer_id;

-- Create new crop (with date validation)
-- File: cropRoutes.js POST /crops
-- Note: Backend validates expected_harvest_date > sowing_date
INSERT INTO CROP(
    crop_id, farm_id, crop_name, variety, sowing_date,
    expected_harvest_date, expected_yield, seed_quantity,
    planting_density, growth_stage, notes, crop_status
) VALUES(
    CROP_SEQ.NEXTVAL, :farm_id, :crop_name, :variety, 
    TO_DATE(:sowing_date, 'YYYY-MM-DD'),
    CASE WHEN :expected_harvest_date IS NOT NULL 
        THEN TO_DATE(:expected_harvest_date, 'YYYY-MM-DD') ELSE NULL END,
    :expected_yield, :seed_quantity, :planting_density,
    :growth_stage, :notes, 'PLANTED'
);

-- Update crop (with date validation)
-- File: cropRoutes.js PUT /crops/:crop_id
-- Note: Backend validates actual_harvest_date > sowing_date
UPDATE CROP SET
    crop_name = :crop_name,
    variety = :variety,
    sowing_date = TO_DATE(:sowing_date, 'YYYY-MM-DD'),
    expected_harvest_date = CASE WHEN :expected_harvest_date IS NOT NULL 
        THEN TO_DATE(:expected_harvest_date, 'YYYY-MM-DD') ELSE NULL END,
    actual_harvest_date = CASE WHEN :actual_harvest_date IS NOT NULL 
        THEN TO_DATE(:actual_harvest_date, 'YYYY-MM-DD') ELSE NULL END,
    expected_yield = :expected_yield,
    actual_yield = :actual_yield,
    crop_status = :crop_status,
    seed_quantity = :seed_quantity,
    planting_density = :planting_density,
    growth_stage = :growth_stage,
    notes = :notes
WHERE crop_id = :crop_id;

-- ============================================================================
-- LABOUR ROUTES (labourRoutes.js)
-- ============================================================================

-- Get all labours for a farmer
-- File: labourRoutes.js GET /labours
SELECT 
    labour_id, farmer_id, name, phone, skill_type,
    daily_wage, status, hired_date
FROM LABOUR
WHERE farmer_id = :farmer_id
ORDER BY hired_date DESC;

-- Create new labour
-- File: labourRoutes.js POST /labours
INSERT INTO LABOUR (
    labour_id, farmer_id, name, phone, skill_type, daily_wage
) VALUES (
    LABOUR_SEQ.NEXTVAL, :farmer_id, :name, :phone, :skill_type, :daily_wage
);

-- ============================================================================
-- SALES ROUTES (salesRoutes.js)
-- ============================================================================

-- Get all sales for a farmer
-- File: salesRoutes.js GET /sales
SELECT 
    s.sale_id, s.sale_date, s.quantity_sold, s.price_per_unit,
    s.buyer_name, s.total_amount, s.payment_status,
    c.crop_name, c.variety, f.farm_name
FROM SALES s
JOIN CROP c ON s.crop_id = c.crop_id
JOIN FARM f ON c.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id
ORDER BY s.sale_date DESC;

-- Create new sale
-- File: salesRoutes.js POST /sales
INSERT INTO SALES (
    sale_id, crop_id, sale_date, quantity_sold, price_per_unit,
    buyer_name, total_amount, payment_status
) VALUES (
    SALES_SEQ.NEXTVAL, :crop_id, TO_DATE(:sale_date, 'YYYY-MM-DD'),
    :quantity_sold, :price_per_unit, :buyer_name,
    :quantity_sold * :price_per_unit, :payment_status
);

-- ============================================================================
-- ADMIN ROUTES (adminRoutes.js)
-- ============================================================================

-- Admin login
-- File: adminRoutes.js POST /admin/login
SELECT ADMIN_ID, USERNAME, EMAIL, PASSWORD, FULL_NAME, ROLE, STATUS 
FROM ADMIN 
WHERE USERNAME = :username;

-- Update last login
-- File: adminRoutes.js POST /admin/login
UPDATE ADMIN 
SET LAST_LOGIN = SYSDATE 
WHERE ADMIN_ID = :admin_id;

-- Get all farmers (admin)
-- File: adminRoutes.js GET /admin/farmers
SELECT 
    farmer_id, name, phone, email, address,
    reg_date, status, total_farms, total_area
FROM FARMER
ORDER BY reg_date DESC;

-- Recalculate farmer totals (admin)
-- File: adminRoutes.js POST /admin/recalculate-farmer-totals
BEGIN 
    RECALC_FARMER_TOTALS; 
END;

-- Verify farmer totals (admin)
-- File: adminRoutes.js POST /admin/recalculate-farmer-totals
SELECT 
    f.farmer_id, f.name, f.total_farms, f.total_area,
    COUNT(fm.farm_id) AS actual_farms,
    NVL(SUM(fm.area), 0) AS actual_area
FROM FARMER f
LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id AND fm.status = 'ACTIVE'
GROUP BY f.farmer_id, f.name, f.total_farms, f.total_area
ORDER BY f.farmer_id;

-- ============================================================================
-- SECTION 5: VALIDATION QUERIES
-- ============================================================================

-- Verify farm belongs to farmer (used in multiple routes)
SELECT farm_id 
FROM FARM 
WHERE farm_id = :farm_id AND farmer_id = :farmer_id;

-- Verify crop belongs to farmer (used in crop routes)
SELECT c.crop_id, f.farmer_id
FROM CROP c
JOIN FARM f ON c.farm_id = f.farm_id
WHERE c.crop_id = :crop_id AND f.farmer_id = :farmer_id;

-- ============================================================================
-- SECTION 6: ANALYTICS QUERIES
-- ============================================================================

-- Total revenue by farmer
SELECT 
    f.farmer_id, f.name,
    SUM(s.total_amount) AS total_revenue,
    COUNT(s.sale_id) AS total_sales
FROM FARMER f
LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON c.crop_id = s.crop_id
GROUP BY f.farmer_id, f.name;

-- Crop yield analysis
SELECT 
    crop_name,
    AVG(actual_yield) AS avg_yield,
    MAX(actual_yield) AS max_yield,
    MIN(actual_yield) AS min_yield,
    COUNT(*) AS total_crops
FROM CROP
WHERE actual_yield IS NOT NULL
GROUP BY crop_name;

-- Farm profitability
SELECT 
    fm.farm_name,
    SUM(s.total_amount) AS revenue,
    COUNT(c.crop_id) AS crops_grown
FROM FARM fm
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON c.crop_id = s.crop_id
GROUP BY fm.farm_id, fm.farm_name;

-- ============================================================================
-- SECTION 7: SAMPLE DATA QUERIES
-- File: ISFS_backend/database/sample_data.sql
-- ============================================================================

-- Insert sample admin
INSERT INTO ADMIN (admin_id, username, email, password, full_name, role)
VALUES (
    ADMIN_SEQ.NEXTVAL, 
    'admin', 
    'admin@isfs.com',
    '$2a$10$hashedpassword',  -- bcrypt hash of 'admin123'
    'System Administrator',
    'SUPER_ADMIN'
);

-- ============================================================================
-- SECTION 8: UTILITY QUERIES
-- ============================================================================

-- Check trigger status
SELECT trigger_name, status, trigger_type
FROM user_triggers 
WHERE trigger_name LIKE 'TRG_FARM%';

-- Get sequence current value
SELECT CROP_SEQ.CURRVAL AS current_value FROM DUAL;

-- Reset sequence
ALTER SEQUENCE CROP_SEQ RESTART START WITH 1;

-- Check table constraints
SELECT constraint_name, constraint_type, table_name
FROM user_constraints
WHERE table_name = 'CROP';

-- ============================================================================
-- SECTION 9: WEATHER ALERT SYSTEM
-- File: ISFS_backend/database/enhanced_schema.sql (Weather Alert Tables)
-- Routes: ISFS_backend/routes/weatherRoutes.js, adminRoutes.js
-- ============================================================================

-- Weather Alert Tables

-- WEATHER_ALERT: Store all weather alerts sent to farmers
CREATE TABLE WEATHER_ALERT (
    alert_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    alert_type VARCHAR2(50) NOT NULL, -- HEAVY_RAIN, EXTREME_HEAT, etc.
    weather_condition VARCHAR2(100),
    message CLOB NOT NULL,
    sent_via VARCHAR2(20) DEFAULT 'IN_APP' CHECK (sent_via IN ('SMS', 'IN_APP', 'BOTH')),
    status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('SENT', 'FAILED', 'PENDING')),
    severity VARCHAR2(20) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    created_date DATE DEFAULT SYSDATE,
    sent_date DATE,
    is_read NUMBER(1) DEFAULT 0
);

-- ALERT_PREFERENCES: Store farmer notification preferences
CREATE TABLE ALERT_PREFERENCES (
    preference_id NUMBER PRIMARY KEY,
    farmer_id NUMBER UNIQUE REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    sms_enabled NUMBER(1) DEFAULT 1,
    in_app_enabled NUMBER(1) DEFAULT 1,
    temperature_threshold_high NUMBER DEFAULT 35,
    temperature_threshold_low NUMBER DEFAULT 5,
    rainfall_threshold NUMBER DEFAULT 50,
    wind_threshold NUMBER DEFAULT 40,
    humidity_threshold_high NUMBER DEFAULT 90,
    humidity_threshold_low NUMBER DEFAULT 30,
    created_date DATE DEFAULT SYSDATE,
    updated_date DATE DEFAULT SYSDATE
);

-- Create sequences for weather alert tables
CREATE SEQUENCE WEATHER_ALERT_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE ALERT_PREF_SEQ START WITH 1 INCREMENT BY 1;

-- Indexes for performance
CREATE INDEX idx_weather_alert_farmer ON WEATHER_ALERT(farmer_id, created_date DESC);
CREATE INDEX idx_weather_alert_status ON WEATHER_ALERT(status, is_read);
CREATE INDEX idx_alert_pref_farmer ON ALERT_PREFERENCES(farmer_id);

-- ============================================================================
-- WEATHER ALERT API QUERIES
-- ============================================================================

-- 1. Create weather alert (Used in: alertService.js)
INSERT INTO WEATHER_ALERT (
    alert_id, farmer_id, farm_id, alert_type, weather_condition,
    message, sent_via, status, severity, sent_date
) VALUES (
    WEATHER_ALERT_SEQ.NEXTVAL, :farmer_id, :farm_id, :alert_type, 
    :weather_condition, :message, :sent_via, 'PENDING', :severity, SYSDATE
) RETURNING alert_id INTO :alert_id;

-- 2. Get unread alerts for farmer (Used in: weatherRoutes.js)
SELECT alert_id, alert_type, weather_condition, message, severity, created_date
FROM WEATHER_ALERT
WHERE farmer_id = :farmer_id AND is_read = 0 AND status = 'SENT'
ORDER BY created_date DESC;

-- 3. Get alert history with filters (Used in: adminRoutes.js)
SELECT 
    wa.alert_id, wa.farmer_id, wa.farm_id, wa.alert_type,
    wa.weather_condition, DBMS_LOB.SUBSTR(wa.message, 4000, 1) as message,
    wa.sent_via, wa.status, wa.severity, wa.created_date,
    wa.sent_date, wa.is_read,
    f.name as farmer_name, fm.farm_name
FROM WEATHER_ALERT wa
LEFT JOIN FARMER f ON wa.farmer_id = f.farmer_id
LEFT JOIN FARM fm ON wa.farm_id = fm.farm_id
WHERE wa.status = :status
ORDER BY wa.created_date DESC
FETCH FIRST :limit ROWS ONLY;

-- 4. Get alert preferences for farmer (Used in: weatherRoutes.js)
SELECT * FROM ALERT_PREFERENCES WHERE farmer_id = :farmer_id;

-- 5. Update alert preferences (Used in: weatherRoutes.js)
UPDATE ALERT_PREFERENCES SET
    sms_enabled = :sms_enabled,
    in_app_enabled = :in_app_enabled,
    temperature_threshold_high = :temp_high,
    temperature_threshold_low = :temp_low,
    rainfall_threshold = :rainfall,
    wind_threshold = :wind,
    humidity_threshold_high = :humidity_high,
    humidity_threshold_low = :humidity_low,
    updated_date = SYSDATE
WHERE farmer_id = :farmer_id;

-- 6. Get farms with alert preferences for automated checks (Used in: alertService.js)
SELECT 
    f.farm_id, f.farm_name, f.location, f.farmer_id,
    fa.phone, fa.name as farmer_name,
    COALESCE(ap.sms_enabled, 1) as sms_enabled,
    COALESCE(ap.in_app_enabled, 1) as in_app_enabled,
    COALESCE(ap.temperature_threshold_high, 35) as temp_high,
    COALESCE(ap.temperature_threshold_low, 5) as temp_low,
    COALESCE(ap.rainfall_threshold, 50) as rainfall_threshold,
    COALESCE(ap.wind_threshold, 40) as wind_threshold,
    COALESCE(ap.humidity_threshold_high, 90) as humidity_high,
    COALESCE(ap.humidity_threshold_low, 30) as humidity_low
FROM FARM f
JOIN FARMER fa ON f.farmer_id = fa.farmer_id
LEFT JOIN ALERT_PREFERENCES ap ON fa.farmer_id = ap.farmer_id
WHERE f.status = 'ACTIVE' AND fa.status = 'ACTIVE';

-- 7. Mark alert as read (Used in: weatherRoutes.js, alertService.js)
UPDATE WEATHER_ALERT SET is_read = 1 WHERE alert_id = :alert_id;

-- 8. Alert statistics (Used in: adminRoutes.js)
SELECT 
    alert_type,
    severity,
    COUNT(*) as count,
    SUM(CASE WHEN status = 'SENT' THEN 1 ELSE 0 END) as sent,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
    SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count
FROM WEATHER_ALERT
GROUP BY alert_type, severity
ORDER BY count DESC;

-- ============================================================================
-- SECTION 10: MAINTENANCE QUERIES
-- ============================================================================

-- Backup farmer data
CREATE TABLE FARMER_BACKUP AS SELECT * FROM FARMER;

-- Restore farmer data
INSERT INTO FARMER SELECT * FROM FARMER_BACKUP;

-- Clear all data (use with caution!)
DELETE FROM SALES;
DELETE FROM FERTILIZER;
DELETE FROM LABOURWORK;
DELETE FROM CROP;
DELETE FROM FARM;
DELETE FROM LABOUR;

-- Reset sequences after clearing data
ALTER SEQUENCE FARMER_SEQ RESTART START WITH 1;
ALTER SEQUENCE FARM_SEQ RESTART START WITH 1;
ALTER SEQUENCE CROP_SEQ RESTART START WITH 1;

-- ============================================================================
-- END OF SQL COMMANDS REFERENCE
-- ============================================================================
-- For more information, see:
-- - README.md (Main documentation)
-- - QUICK_START.md (Quick setup guide)
-- - Database files in ISFS_backend/database/
-- ============================================================================

