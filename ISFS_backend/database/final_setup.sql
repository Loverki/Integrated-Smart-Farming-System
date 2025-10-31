-- INTEGRATED SMART FARMING SYSTEM (ISFS)
-- FINAL SETUP SQL (Single script to run initially in Oracle)
-- Version: 2.0
-- Date: October 28, 2025

-- ============================================================================
-- SECTION 1: CLEANUP (Drop existing objects safely)
-- ============================================================================
BEGIN EXECUTE IMMEDIATE 'DROP VIEW FARM_PERFORMANCE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW FARMER_DASHBOARD'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW CROP_ANALYTICS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP VIEW MONTHLY_REVENUE'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP TABLE SENSOR_ALERTS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SENSOR_THRESHOLDS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SENSOR_DATA CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE WEATHER_ALERT CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ALERT_PREFERENCES CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SALES CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE FERTILIZER CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE EQUIPMENT_MAINTENANCE CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE EQUIPMENT CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE LABOURWORK CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE LABOUR CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CROP CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE WEATHER_DATA CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE FARM CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ADMIN CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE FARMER CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE FARMER_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE FARM_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE CROP_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE LABOUR_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SALES_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE FERTILIZER_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE ADMIN_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE WEATHER_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE EQUIPMENT_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE MAINTENANCE_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE WEATHER_ALERT_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE ALERT_PREF_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SENSOR_DATA_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SENSOR_THRESHOLD_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SENSOR_ALERT_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- ============================================================================
-- SECTION 2: CREATE SEQUENCES
-- ============================================================================
CREATE SEQUENCE FARMER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE FARM_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE CROP_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE LABOUR_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SALES_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE FERTILIZER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE ADMIN_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE WEATHER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE EQUIPMENT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE MAINTENANCE_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE WEATHER_ALERT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE ALERT_PREF_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SENSOR_DATA_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SENSOR_THRESHOLD_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SENSOR_ALERT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

-- ============================================================================
-- SECTION 3: CREATE TABLES
-- ============================================================================
CREATE TABLE FARMER (
	farmer_id NUMBER PRIMARY KEY,
	name VARCHAR2(100) NOT NULL,
	phone VARCHAR2(15) UNIQUE NOT NULL,
	email VARCHAR2(100) UNIQUE,
	address VARCHAR2(200),
	password VARCHAR2(255) NOT NULL,
	reg_date DATE DEFAULT SYSDATE,
	status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
	total_farms NUMBER DEFAULT 0,
	total_area NUMBER DEFAULT 0
);

CREATE TABLE ADMIN (
	admin_id NUMBER PRIMARY KEY,
	username VARCHAR2(50) UNIQUE NOT NULL,
	email VARCHAR2(100) UNIQUE NOT NULL,
	password VARCHAR2(255) NOT NULL,
	full_name VARCHAR2(100) NOT NULL,
	role VARCHAR2(30) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN','ADMIN','MANAGER')),
	created_date DATE DEFAULT SYSDATE,
	last_login DATE,
	status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

CREATE TABLE FARM (
	farm_id NUMBER PRIMARY KEY,
	farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
	farm_name VARCHAR2(100) NOT NULL,
	location VARCHAR2(100),
	area NUMBER NOT NULL CHECK (area > 0),
	soil_type VARCHAR2(50),
	soil_ph NUMBER(3,1) CHECK (soil_ph BETWEEN 0 AND 14),
	irrigation_type VARCHAR2(50),
	farm_type VARCHAR2(30) CHECK (farm_type IN ('ORGANIC','CONVENTIONAL','HYBRID')),
	created_date DATE DEFAULT SYSDATE,
	status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','MAINTENANCE'))
);

CREATE TABLE WEATHER_DATA (
	weather_id NUMBER PRIMARY KEY,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	recorded_date DATE NOT NULL,
	temperature NUMBER(5,2),
	humidity NUMBER(5,2),
	rainfall NUMBER(8,2),
	wind_speed NUMBER(5,2),
	pressure NUMBER(8,2),
	weather_condition VARCHAR2(50),
	recorded_by VARCHAR2(50)
);

CREATE TABLE CROP (
	crop_id NUMBER PRIMARY KEY,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	crop_name VARCHAR2(50) NOT NULL,
	variety VARCHAR2(50),
	sowing_date DATE,
	expected_harvest_date DATE,
	actual_harvest_date DATE,
	expected_yield NUMBER,
	actual_yield NUMBER,
	crop_status VARCHAR2(20) DEFAULT 'PLANTED' CHECK (crop_status IN ('PLANTED','GROWING','MATURE','HARVESTED','DAMAGED')),
	seed_quantity NUMBER,
	planting_density NUMBER,
	growth_stage VARCHAR2(30),
	notes CLOB
);

CREATE TABLE LABOUR (
	labour_id NUMBER PRIMARY KEY,
	name VARCHAR2(100) NOT NULL,
	phone VARCHAR2(15),
	email VARCHAR2(100),
	skill VARCHAR2(50),
	hourly_rate NUMBER(8,2),
	address VARCHAR2(200),
	hire_date DATE DEFAULT SYSDATE,
	status VARCHAR2(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','BUSY','UNAVAILABLE'))
);

CREATE TABLE LABOURWORK (
	work_id NUMBER PRIMARY KEY,
	labour_id NUMBER REFERENCES LABOUR(labour_id),
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	work_type VARCHAR2(50),
	work_date DATE NOT NULL,
	start_time TIMESTAMP,
	end_time TIMESTAMP,
	hours_worked NUMBER(5,2),
	hourly_rate NUMBER(8,2),
	total_cost NUMBER(10,2),
	work_description CLOB,
	status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','COMPLETED','CANCELLED')),
	created_date DATE DEFAULT SYSDATE
);

CREATE TABLE EQUIPMENT (
	equipment_id NUMBER PRIMARY KEY,
	farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
	equipment_name VARCHAR2(100) NOT NULL,
	equipment_type VARCHAR2(50),
	brand VARCHAR2(50),
	model VARCHAR2(50),
	purchase_date DATE,
	purchase_cost NUMBER(10,2),
	current_value NUMBER(10,2),
	status VARCHAR2(20) DEFAULT 'OPERATIONAL' CHECK (status IN ('OPERATIONAL','MAINTENANCE','REPAIR','RETIRED')),
	last_maintenance_date DATE,
	next_maintenance_date DATE
);

CREATE TABLE EQUIPMENT_MAINTENANCE (
	maintenance_id NUMBER PRIMARY KEY,
	equipment_id NUMBER REFERENCES EQUIPMENT(equipment_id) ON DELETE CASCADE,
	maintenance_date DATE NOT NULL,
	maintenance_type VARCHAR2(50),
	cost NUMBER(10,2),
	performed_by VARCHAR2(100),
	next_maintenance_date DATE,
	notes CLOB
);

CREATE TABLE FERTILIZER (
	fertilizer_id NUMBER PRIMARY KEY,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	fertilizer_name VARCHAR2(50) NOT NULL,
	fertilizer_type VARCHAR2(30) CHECK (fertilizer_type IN ('ORGANIC','INORGANIC','BIO_FERTILIZER')),
	quantity_used NUMBER(8,2),
	unit VARCHAR2(20) DEFAULT 'KG',
	application_date DATE NOT NULL,
	cost_per_unit NUMBER(8,2),
	total_cost NUMBER(10,2),
	applied_by VARCHAR2(100),
	crop_id NUMBER REFERENCES CROP(crop_id),
	application_method VARCHAR2(50),
	effectiveness_rating NUMBER(1) CHECK (effectiveness_rating BETWEEN 1 AND 5)
);

CREATE TABLE SALES (
	sale_id NUMBER PRIMARY KEY,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	crop_id NUMBER REFERENCES CROP(crop_id),
	buyer_name VARCHAR2(100),
	buyer_contact VARCHAR2(50),
	quantity_sold NUMBER(8,2),
	unit VARCHAR2(20) DEFAULT 'KG',
	price_per_unit NUMBER(10,2),
	total_amount NUMBER(12,2),
	sale_date DATE NOT NULL,
	payment_method VARCHAR2(30) CHECK (payment_method IN ('CASH','CHEQUE','BANK_TRANSFER','CREDIT')),
	payment_status VARCHAR2(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','PAID','PARTIAL','OVERDUE')),
	invoice_number VARCHAR2(50),
	notes CLOB
);

CREATE TABLE WEATHER_ALERT (
	alert_id NUMBER PRIMARY KEY,
	farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	alert_type VARCHAR2(50) NOT NULL,
	weather_condition VARCHAR2(100),
	message CLOB NOT NULL,
	sent_via VARCHAR2(20) DEFAULT 'IN_APP' CHECK (sent_via IN ('SMS','IN_APP','BOTH')),
	status VARCHAR2(20) DEFAULT 'PENDING' CHECK (status IN ('SENT','FAILED','PENDING')),
	severity VARCHAR2(20) DEFAULT 'INFO' CHECK (severity IN ('INFO','WARNING','CRITICAL')),
	created_date DATE DEFAULT SYSDATE,
	sent_date DATE,
	is_read NUMBER(1) DEFAULT 0
);

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

-- Sensor subsystem tables
CREATE TABLE SENSOR_DATA (
	sensor_id NUMBER PRIMARY KEY,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	sensor_type VARCHAR2(50) NOT NULL,
	sensor_value NUMBER(12,4) NOT NULL,
	unit VARCHAR2(20),
	recorded_date DATE DEFAULT SYSDATE,
	status VARCHAR2(20) DEFAULT 'NORMAL' CHECK (status IN ('NORMAL','WARNING','CRITICAL')),
	notes VARCHAR2(200)
);

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

CREATE TABLE SENSOR_ALERTS (
	alert_id NUMBER PRIMARY KEY,
	sensor_id NUMBER REFERENCES SENSOR_DATA(sensor_id) ON DELETE CASCADE,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
	sensor_type VARCHAR2(50) NOT NULL,
	sensor_value NUMBER(12,4) NOT NULL,
	threshold_value NUMBER(12,4),
	alert_message CLOB,
	sms_sent NUMBER(1) DEFAULT 0,
	email_sent NUMBER(1) DEFAULT 0,
	notification_sent NUMBER(1) DEFAULT 0,
	sms_status VARCHAR2(20),
	email_status VARCHAR2(20),
	created_date DATE DEFAULT SYSDATE
);

-- ============================================================================
-- SECTION 4: INDEXES
-- ============================================================================
CREATE INDEX idx_farmer_phone ON FARMER(phone);
CREATE INDEX idx_farm_farmer_id ON FARM(farmer_id);
CREATE INDEX idx_crop_farm_id ON CROP(farm_id);
CREATE INDEX idx_sales_farm_id ON SALES(farm_id);
CREATE INDEX idx_weather_farm_date ON WEATHER_DATA(farm_id, recorded_date);
CREATE INDEX idx_weather_alert_farmer ON WEATHER_ALERT(farmer_id, created_date DESC);
CREATE INDEX idx_weather_alert_status ON WEATHER_ALERT(status, is_read);
CREATE INDEX idx_alert_pref_farmer ON ALERT_PREFERENCES(farmer_id);
CREATE INDEX idx_sensor_farm_date ON SENSOR_DATA(farm_id, recorded_date DESC);
CREATE INDEX idx_sensor_type ON SENSOR_DATA(sensor_type, status);
CREATE INDEX idx_sensor_alert_farm ON SENSOR_ALERTS(farm_id, created_date DESC);
CREATE INDEX idx_sensor_alert_farmer ON SENSOR_ALERTS(farmer_id, created_date DESC);

-- ============================================================================
-- SECTION 5: TRIGGERS (Farmer totals)
-- ============================================================================
CREATE OR REPLACE TRIGGER TRG_FARM_INSERT
AFTER INSERT ON FARM
FOR EACH ROW
BEGIN
	UPDATE FARMER
	SET TOTAL_FARMS = TOTAL_FARMS + 1,
		TOTAL_AREA = TOTAL_AREA + :NEW.AREA
	WHERE FARMER_ID = :NEW.FARMER_ID;
END;
/

CREATE OR REPLACE TRIGGER TRG_FARM_UPDATE
AFTER UPDATE ON FARM
FOR EACH ROW
BEGIN
	UPDATE FARMER
	SET TOTAL_AREA = TOTAL_AREA - :OLD.AREA + :NEW.AREA
	WHERE FARMER_ID = :NEW.FARMER_ID;
END;
/

CREATE OR REPLACE TRIGGER TRG_FARM_DELETE
AFTER DELETE ON FARM
FOR EACH ROW
BEGIN
	UPDATE FARMER
	SET TOTAL_FARMS = TOTAL_FARMS - 1,
		TOTAL_AREA = TOTAL_AREA - :OLD.AREA
	WHERE FARMER_ID = :OLD.FARMER_ID;
END;
/

-- ============================================================================
-- SECTION 6: STORED PROCEDURES
-- ============================================================================
CREATE OR REPLACE PROCEDURE CALCULATE_FARM_PROFITABILITY(
	p_farm_id IN NUMBER,
	p_profit OUT NUMBER,
	p_revenue OUT NUMBER,
	p_cost OUT NUMBER
) AS
BEGIN
	SELECT NVL(SUM(total_amount), 0) INTO p_revenue FROM SALES WHERE farm_id = p_farm_id;
	SELECT NVL(SUM(total_cost), 0) INTO p_cost FROM (
		SELECT total_cost FROM FERTILIZER WHERE farm_id = p_farm_id
		UNION ALL
		SELECT total_cost FROM LABOURWORK WHERE farm_id = p_farm_id
	);
	p_profit := p_revenue - p_cost;
END;
/

CREATE OR REPLACE PROCEDURE UPDATE_CROP_STATUS(
	p_crop_id IN NUMBER,
	p_new_status IN VARCHAR2,
	p_actual_yield IN NUMBER DEFAULT NULL,
	p_actual_harvest_date IN DATE DEFAULT NULL
) AS
BEGIN
	UPDATE CROP
	SET crop_status = p_new_status,
		actual_yield = NVL(p_actual_yield, actual_yield),
		actual_harvest_date = NVL(p_actual_harvest_date, actual_harvest_date)
	WHERE crop_id = p_crop_id;
	COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE RECALC_FARMER_TOTALS AS
BEGIN
	UPDATE FARMER f
	SET (TOTAL_FARMS, TOTAL_AREA) = (
		SELECT COUNT(*), NVL(SUM(AREA), 0)
		FROM FARM
		WHERE FARMER_ID = f.FARMER_ID AND STATUS = 'ACTIVE'
	);
	COMMIT;
END;
/

-- Optional helper used by backend sometimes
CREATE OR REPLACE PROCEDURE RESET_SEQUENCE(p_sequence_name IN VARCHAR2) AS
	v_max NUMBER := 0;
	v_sql VARCHAR2(4000);
BEGIN
	IF UPPER(p_sequence_name) = 'FARMER_SEQ' THEN SELECT NVL(MAX(farmer_id),0) INTO v_max FROM FARMER; END IF;
	IF UPPER(p_sequence_name) = 'FARM_SEQ' THEN SELECT NVL(MAX(farm_id),0) INTO v_max FROM FARM; END IF;
	IF UPPER(p_sequence_name) = 'SENSOR_DATA_SEQ' THEN SELECT NVL(MAX(sensor_id),0) INTO v_max FROM SENSOR_DATA; END IF;
	IF UPPER(p_sequence_name) = 'SENSOR_ALERT_SEQ' THEN SELECT NVL(MAX(alert_id),0) INTO v_max FROM SENSOR_ALERTS; END IF;
	IF UPPER(p_sequence_name) = 'SENSOR_THRESHOLD_SEQ' THEN SELECT NVL(MAX(threshold_id),0) INTO v_max FROM SENSOR_THRESHOLDS; END IF;
	BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE ' || p_sequence_name; EXCEPTION WHEN OTHERS THEN NULL; END;
	v_sql := 'CREATE SEQUENCE ' || p_sequence_name || ' START WITH ' || (v_max + 1) || ' INCREMENT BY 1 NOCACHE';
	EXECUTE IMMEDIATE v_sql;
END;
/

-- ============================================================================
-- SECTION 7: FUNCTIONS
-- ============================================================================
CREATE OR REPLACE FUNCTION GET_FARMER_STATS(p_farmer_id IN NUMBER) RETURN VARCHAR2 AS
	v_stats VARCHAR2(1000);
	v_farms NUMBER; v_crops NUMBER; v_revenue NUMBER;
BEGIN
	SELECT COUNT(*) INTO v_farms FROM FARM WHERE farmer_id = p_farmer_id;
	SELECT COUNT(*) INTO v_crops FROM CROP c JOIN FARM f ON c.farm_id = f.farm_id WHERE f.farmer_id = p_farmer_id;
	SELECT NVL(SUM(s.total_amount), 0) INTO v_revenue FROM SALES s JOIN FARM f ON s.farm_id = f.farm_id WHERE f.farmer_id = p_farmer_id;
	v_stats := 'Farms: ' || v_farms || ', Crops: ' || v_crops || ', Revenue: $' || v_revenue;
	RETURN v_stats;
END;
/

-- ============================================================================
-- SECTION 8: VIEWS
-- ============================================================================
CREATE OR REPLACE VIEW FARMER_DASHBOARD AS
SELECT f.farmer_id, f.name AS farmer_name, f.phone,
	COUNT(DISTINCT fm.farm_id) AS total_farms,
	NVL(SUM(fm.area), 0) AS total_area,
	COUNT(DISTINCT c.crop_id) AS total_crops,
	NVL(SUM(CASE WHEN c.crop_status = 'HARVESTED' THEN c.actual_yield ELSE 0 END), 0) AS total_yield,
	NVL(SUM(s.total_amount), 0) AS total_revenue,
	NVL(AVG(s.price_per_unit), 0) AS avg_selling_price
FROM FARMER f
LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON fm.farm_id = s.farm_id
GROUP BY f.farmer_id, f.name, f.phone;

CREATE OR REPLACE VIEW FARM_PERFORMANCE AS
SELECT fm.farm_id, fm.farm_name, f.name AS farmer_name, fm.area, fm.soil_type,
	COUNT(DISTINCT c.crop_id) AS crops_count,
	NVL(SUM(c.expected_yield), 0) AS expected_total_yield,
	NVL(SUM(c.actual_yield), 0) AS actual_total_yield,
	CASE WHEN SUM(c.expected_yield) > 0 THEN ROUND((SUM(c.actual_yield)/SUM(c.expected_yield))*100, 2) ELSE 0 END AS yield_efficiency,
	NVL(SUM(s.total_amount), 0) AS total_revenue,
	NVL(SUM(fer.total_cost), 0) AS fertilizer_cost,
	NVL(SUM(lw.total_cost), 0) AS labour_cost
FROM FARM fm
JOIN FARMER f ON fm.farmer_id = f.farmer_id
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON fm.farm_id = s.farm_id
LEFT JOIN FERTILIZER fer ON fm.farm_id = fer.farm_id
LEFT JOIN LABOURWORK lw ON fm.farm_id = lw.farm_id
GROUP BY fm.farm_id, fm.farm_name, f.name, fm.area, fm.soil_type;

CREATE OR REPLACE VIEW CROP_ANALYTICS AS
SELECT c.crop_name,
	COUNT(*) AS total_crops,
	NVL(AVG(c.actual_yield), 0) AS avg_yield,
	NVL(MIN(c.actual_yield), 0) AS min_yield,
	NVL(MAX(c.actual_yield), 0) AS max_yield,
	NVL(AVG(s.price_per_unit), 0) AS avg_price,
	NVL(SUM(s.total_amount), 0) AS total_revenue,
	NVL(AVG(c.actual_harvest_date - c.sowing_date), 0) AS avg_growth_days
FROM CROP c
LEFT JOIN SALES s ON c.crop_id = s.crop_id
WHERE c.crop_status = 'HARVESTED'
GROUP BY c.crop_name;

CREATE OR REPLACE VIEW MONTHLY_REVENUE AS
SELECT TO_CHAR(s.sale_date, 'YYYY-MM') AS month, f.name AS farmer_name,
	NVL(SUM(s.total_amount), 0) AS monthly_revenue,
	COUNT(s.sale_id) AS sales_count,
	NVL(AVG(s.price_per_unit), 0) AS avg_price
FROM SALES s
JOIN FARM fm ON s.farm_id = fm.farm_id
JOIN FARMER f ON fm.farmer_id = f.farmer_id
GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM'), f.name
ORDER BY month DESC;

-- ============================================================================
-- SECTION 9: DEFAULT SENSOR THRESHOLDS (safe upsert for all farmers)
-- ============================================================================
MERGE INTO SENSOR_THRESHOLDS t
USING (
	SELECT f.farmer_id, s.sensor_type, s.min_value, s.max_value, s.critical_min, s.critical_max
	FROM FARMER f
	CROSS JOIN (
		SELECT 'SOIL_MOISTURE' sensor_type, NULL min_value, NULL max_value, 20 critical_min, 80 critical_max FROM dual
		UNION ALL SELECT 'SOIL_PH', NULL, NULL, 5.0, 8.5 FROM dual
		UNION ALL SELECT 'TEMPERATURE', NULL, NULL, 5, 40 FROM dual
		UNION ALL SELECT 'HUMIDITY', NULL, NULL, 30, 95 FROM dual
		UNION ALL SELECT 'LIGHT', NULL, NULL, 1000, 100000 FROM dual
	) s
) src
ON (t.farmer_id = src.farmer_id AND t.sensor_type = src.sensor_type)
WHEN MATCHED THEN UPDATE SET
	t.min_value = src.min_value,
	t.max_value = src.max_value,
	t.critical_min = src.critical_min,
	t.critical_max = src.critical_max,
	t.updated_date = SYSDATE
WHEN NOT MATCHED THEN INSERT (
	threshold_id, farmer_id, sensor_type, min_value, max_value, critical_min, critical_max, created_date, updated_date
) VALUES (
	SENSOR_THRESHOLD_SEQ.NEXTVAL, src.farmer_id, src.sensor_type, src.min_value, src.max_value, src.critical_min, src.critical_max, SYSDATE, SYSDATE
);

-- ============================================================================
-- SECTION 10: VERIFICATION (optional)
-- ============================================================================
SELECT 'Table: ' || table_name AS STATUS FROM user_tables
WHERE table_name IN ('FARMER','ADMIN','FARM','WEATHER_DATA','CROP','LABOUR','LABOURWORK','EQUIPMENT','EQUIPMENT_MAINTENANCE','FERTILIZER','SALES','WEATHER_ALERT','ALERT_PREFERENCES','SENSOR_DATA','SENSOR_ALERTS','SENSOR_THRESHOLDS')
ORDER BY table_name;

SELECT 'Sequence: ' || sequence_name AS STATUS FROM user_sequences WHERE sequence_name LIKE '%_SEQ' ORDER BY sequence_name;

SELECT 'Trigger: ' || trigger_name AS STATUS FROM user_triggers WHERE trigger_name LIKE 'TRG_%' ORDER BY trigger_name;

COMMIT;

-- End of FINAL SETUP
-- Integrated Smart Farming System - Final Setup (Run First)
-- Purpose: Create core tables, sequences, minimal indexes, and helper proc used by backend.

-- =========================
-- SAFETY: Drop objects if exist
-- =========================
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SENSOR_ALERTS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SENSOR_THRESHOLDS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE SENSOR_DATA CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE FARM CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE FARMER CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE FARMER_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE FARM_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SENSOR_DATA_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SENSOR_ALERT_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE SENSOR_THRESHOLD_SEQ'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- =========================
-- TABLES
-- =========================
CREATE TABLE FARMER (
	farmer_id NUMBER PRIMARY KEY,
	name VARCHAR2(100) NOT NULL,
	phone VARCHAR2(15) UNIQUE NOT NULL,
	email VARCHAR2(100),
	address VARCHAR2(200),
	password VARCHAR2(255) NOT NULL,
	status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
	reg_date DATE DEFAULT SYSDATE,
	total_farms NUMBER DEFAULT 0,
	total_area NUMBER DEFAULT 0
);

CREATE TABLE FARM (
	farm_id NUMBER PRIMARY KEY,
	farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
	farm_name VARCHAR2(100) NOT NULL,
	location VARCHAR2(100),
	area NUMBER,
	soil_type VARCHAR2(50),
	soil_ph NUMBER(3,1),
	irrigation_type VARCHAR2(50),
	status VARCHAR2(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','MAINTENANCE')),
	created_date DATE DEFAULT SYSDATE
);

CREATE TABLE SENSOR_DATA (
	sensor_id NUMBER PRIMARY KEY,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	sensor_type VARCHAR2(50) NOT NULL,
	sensor_value NUMBER(12,4) NOT NULL,
	unit VARCHAR2(20),
	recorded_date DATE DEFAULT SYSDATE,
	status VARCHAR2(20) DEFAULT 'NORMAL' CHECK (status IN ('NORMAL','WARNING','CRITICAL')),
	notes CLOB
);

CREATE TABLE SENSOR_ALERTS (
	alert_id NUMBER PRIMARY KEY,
	sensor_id NUMBER REFERENCES SENSOR_DATA(sensor_id) ON DELETE CASCADE,
	farm_id NUMBER REFERENCES FARM(farm_id) ON DELETE CASCADE,
	farmer_id NUMBER REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
	sensor_type VARCHAR2(50) NOT NULL,
	sensor_value NUMBER(12,4) NOT NULL,
	threshold_value NUMBER(12,4),
	alert_message VARCHAR2(4000),
	sms_sent NUMBER(1) DEFAULT 0,
	email_sent NUMBER(1) DEFAULT 0,
	notification_sent NUMBER(1) DEFAULT 0,
	sms_status VARCHAR2(30),
	email_status VARCHAR2(30),
	created_date DATE DEFAULT SYSDATE
);

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
	UNIQUE (farmer_id, sensor_type)
);

-- =========================
-- SEQUENCES
-- =========================
CREATE SEQUENCE FARMER_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE FARM_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SENSOR_DATA_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SENSOR_ALERT_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;
CREATE SEQUENCE SENSOR_THRESHOLD_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

-- =========================
-- INDEXES (minimal)
-- =========================
CREATE INDEX IDX_FARM_FARMER ON FARM(farmer_id);
CREATE INDEX IDX_SENSORDATA_FARM ON SENSOR_DATA(farm_id);
CREATE INDEX IDX_SENSORALERTS_FARM ON SENSOR_ALERTS(farm_id);

-- =========================
-- OPTIONAL PROCEDURE: RESET_SEQUENCE(seq_name)
-- Used by backend to realign sequences when data was cleared.
-- Backend will fallback to manual drop/create if absent.
-- =========================
CREATE OR REPLACE PROCEDURE RESET_SEQUENCE(
	p_sequence_name IN VARCHAR2
) AS
	v_max_id NUMBER := 0;
	v_sql    VARCHAR2(4000);
BEGIN
	IF UPPER(p_sequence_name) = 'FARMER_SEQ' THEN
		SELECT NVL(MAX(farmer_id),0) INTO v_max_id FROM FARMER;
	ELSIF UPPER(p_sequence_name) = 'FARM_SEQ' THEN
		SELECT NVL(MAX(farm_id),0) INTO v_max_id FROM FARM;
	ELSIF UPPER(p_sequence_name) = 'SENSOR_DATA_SEQ' THEN
		SELECT NVL(MAX(sensor_id),0) INTO v_max_id FROM SENSOR_DATA;
	ELSIF UPPER(p_sequence_name) = 'SENSOR_ALERT_SEQ' THEN
		SELECT NVL(MAX(alert_id),0) INTO v_max_id FROM SENSOR_ALERTS;
	ELSIF UPPER(p_sequence_name) = 'SENSOR_THRESHOLD_SEQ' THEN
		SELECT NVL(MAX(threshold_id),0) INTO v_max_id FROM SENSOR_THRESHOLDS;
	END IF;

	BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE ' || p_sequence_name; EXCEPTION WHEN OTHERS THEN NULL; END;
	v_sql := 'CREATE SEQUENCE ' || p_sequence_name || ' START WITH ' || (v_max_id + 1) || ' INCREMENT BY 1 NOCACHE';
	EXECUTE IMMEDIATE v_sql;
END;
/

-- =========================
-- DEFAULT THRESHOLDS FOR ALL EXISTING FARMERS (safe upsert)
-- =========================
MERGE INTO SENSOR_THRESHOLDS t
USING (
	SELECT f.farmer_id, s.sensor_type, s.min_value, s.max_value, s.critical_min, s.critical_max
	FROM FARMER f
	CROSS JOIN (
		SELECT 'SOIL_MOISTURE' sensor_type, NULL min_value, NULL max_value, 20 critical_min, 80 critical_max FROM dual
		UNION ALL SELECT 'SOIL_PH', NULL, NULL, 5.0, 8.5 FROM dual
		UNION ALL SELECT 'TEMPERATURE', NULL, NULL, 5, 40 FROM dual
		UNION ALL SELECT 'HUMIDITY', NULL, NULL, 30, 95 FROM dual
		UNION ALL SELECT 'LIGHT', NULL, NULL, 1000, 100000 FROM dual
	) s
) src
ON (t.farmer_id = src.farmer_id AND t.sensor_type = src.sensor_type)
WHEN MATCHED THEN UPDATE SET
	t.min_value = src.min_value,
	t.max_value = src.max_value,
	t.critical_min = src.critical_min,
	t.critical_max = src.critical_max,
	t.updated_date = SYSDATE
WHEN NOT MATCHED THEN INSERT (
	threshold_id, farmer_id, sensor_type, min_value, max_value, critical_min, critical_max, created_date, updated_date
) VALUES (
	SENSOR_THRESHOLD_SEQ.NEXTVAL, src.farmer_id, src.sensor_type, src.min_value, src.max_value, src.critical_min, src.critical_max, SYSDATE, SYSDATE
);

-- End of final setup
