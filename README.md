# Integrated-Smart-Farming-System
This project majorily aims to data base management system
CREATE SEQUENCE SENSOR_DATA_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SENSOR_THRESHOLD_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SENSOR_ALERT_SEQ START WITH 1 INCREMENT BY 1;

-- Create SENSOR_DATA table
CREATE TABLE SENSOR_DATA (
    sensor_id NUMBER PRIMARY KEY,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    sensor_type VARCHAR2(50) NOT NULL,
    sensor_value NUMBER(10,2) NOT NULL,
    unit VARCHAR2(20),
    recorded_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'WARNING', 'CRITICAL')),
    notes VARCHAR2(200)
);

-- Create SENSOR_THRESHOLDS table
CREATE TABLE SENSOR_THRESHOLDS (
    threshold_id NUMBER PRIMARY KEY,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    sensor_type VARCHAR2(50) NOT NULL,
    min_value NUMBER(10,2),
    max_value NUMBER(10,2),
    critical_min NUMBER(10,2),
    critical_max NUMBER(10,2),
    created_date DATE DEFAULT SYSDATE,
    updated_date DATE DEFAULT SYSDATE,
    UNIQUE(farmer_id, sensor_type)
);

-- Create SENSOR_ALERTS table
CREATE TABLE SENSOR_ALERTS (
    alert_id NUMBER PRIMARY KEY,
    sensor_id NUMBER REFERENCES SENSOR_DATA(sensor_id) ON DELETE CASCADE,
    farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
    farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    sensor_type VARCHAR2(50) NOT NULL,
    sensor_value NUMBER(10,2) NOT NULL,
    threshold_value NUMBER(10,2),
    alert_message CLOB,
    sms_sent NUMBER(1) DEFAULT 0,
    email_sent NUMBER(1) DEFAULT 0,
    notification_sent NUMBER(1) DEFAULT 0,
    sms_status VARCHAR2(20),
    email_status VARCHAR2(20),
    created_date DATE DEFAULT SYSDATE
);

-- Create Indexes
CREATE INDEX idx_sensor_farm_date ON SENSOR_DATA(farm_id, recorded_date DESC);
CREATE INDEX idx_sensor_type ON SENSOR_DATA(sensor_type, status);
CREATE INDEX idx_sensor_alert_farm ON SENSOR_ALERTS(farm_id, created_date DESC);
CREATE INDEX idx_sensor_alert_farmer ON SENSOR_ALERTS(farmer_id, created_date DESC);

COMMIT;

-- ============================================================================
-- END OF SCHEMA CREATION
-- ============================================================================
-- To use this schema:
-- 1. Connect to Oracle SQL*Plus or SQL Developer
-- 2. Run this entire script with @complete_schema_production.sql
-- 3. Verify all objects were created
-- 4. Your Integrated Smart Farming System is ready!
-- ============================================================================
