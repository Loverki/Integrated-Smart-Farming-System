-- INTEGRATED SMART FARMING SYSTEM (ISFS)
-- all.sql — Catalog of SQL used across the project with inline comments
-- This file is primarily documentation; it groups the statements by feature.
-- For a runnable, consolidated setup, use: final_setup.sql

/* =============================================================
   AUTH & REGISTRATION (backend/routes/authRoutes.js)
   ============================================================= */

-- Check duplicate phone at register/login
SELECT FARMER_ID FROM FARMER WHERE PHONE = :phone;

-- Insert farmer using sequence (ID auto-increment)
INSERT INTO FARMER (FARMER_ID, NAME, PHONE, ADDRESS, PASSWORD)
VALUES (FARMER_SEQ.NEXTVAL, :name, :phone, :address, :password);

-- Farmer login (fetch hashed password and status)
SELECT FARMER_ID, NAME, PASSWORD, STATUS FROM FARMER WHERE PHONE = :phone;

-- Verify user exists by ID (JWT validation)
SELECT FARMER_ID, NAME, PHONE, STATUS FROM FARMER WHERE FARMER_ID = :farmer_id;

-- Sequence alignment on registration (prevent gaps after deletes)
SELECT COUNT(*) AS farmer_count, NVL(MAX(farmer_id), 0) AS max_id FROM FARMER;
SELECT COUNT(*) FROM user_sequences WHERE sequence_name = 'FARMER_SEQ';
-- Fallback if stored proc not present
DROP SEQUENCE FARMER_SEQ;
CREATE SEQUENCE FARMER_SEQ START WITH :max_id_plus_one INCREMENT BY 1 NOCACHE;
-- Optional proc
BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;

/* =============================================================
   FARM, CROPS, LABOUR, EQUIPMENT, SALES (representative CRUD)
   ============================================================= */

-- Farms by farmer (dashboard, lists)
SELECT FARM_ID, FARM_NAME, LOCATION, AREA, SOIL_TYPE, STATUS
FROM FARM WHERE FARMER_ID = :farmerId;

-- Create farm
INSERT INTO FARM (FARM_ID, FARMER_ID, FARM_NAME, LOCATION, AREA, SOIL_TYPE, STATUS, CREATED_DATE)
VALUES (FARM_SEQ.NEXTVAL, :farmerId, :name, :location, :area, :soilType, 'ACTIVE', SYSDATE);

-- Update farm
UPDATE FARM SET FARM_NAME=:name, LOCATION=:location, AREA=:area, SOIL_TYPE=:soilType, STATUS=:status
WHERE FARM_ID=:farmId AND FARMER_ID=:farmerId;

-- Delete farm
DELETE FROM FARM WHERE FARM_ID=:farmId AND FARMER_ID=:farmerId;

-- Crops by farm
SELECT CROP_ID, CROP_NAME, VARIETY, SOWING_DATE, EXPECTED_HARVEST_DATE, CROP_STATUS
FROM CROP WHERE FARM_ID = :farmId;

-- Sales by farm
SELECT SALE_ID, TOTAL_AMOUNT, SALE_DATE FROM SALES WHERE FARM_ID=:farmId;

/* =============================================================
   SENSOR SUBSYSTEM (backend/routes/sensorRoutes.js & services)
   ============================================================= */

-- Validate farm ownership
SELECT FARMER_ID FROM FARM WHERE FARM_ID = :farmId;

-- Insert sensor reading
INSERT INTO SENSOR_DATA (
  SENSOR_ID, FARM_ID, SENSOR_TYPE, SENSOR_VALUE, UNIT, RECORDED_DATE, STATUS, NOTES
) VALUES (
  SENSOR_DATA_SEQ.NEXTVAL, :farmId, :sensorType, :value, :unit, SYSDATE, 'NORMAL', :notes
);

-- Get last inserted sensor_id in current session
SELECT SENSOR_DATA_SEQ.CURRVAL FROM DUAL;

-- Update status after threshold evaluation
UPDATE SENSOR_DATA SET STATUS = :status WHERE SENSOR_ID = :sensorId;

-- Persist critical alert
INSERT INTO SENSOR_ALERTS (
  ALERT_ID, SENSOR_ID, FARM_ID, FARMER_ID, SENSOR_TYPE, SENSOR_VALUE,
  THRESHOLD_VALUE, ALERT_MESSAGE, SMS_SENT, EMAIL_SENT, NOTIFICATION_SENT,
  SMS_STATUS, EMAIL_STATUS, CREATED_DATE
) VALUES (
  SENSOR_ALERT_SEQ.NEXTVAL, :sensorId, :farmId, :farmerId, :sensorType, :value,
  :thresholdValue, :alertMessage, :smsSent, :emailSent, :notificationSent,
  :smsStatus, :emailStatus, SYSDATE
);

-- Readings list with filters
SELECT s.SENSOR_ID, s.FARM_ID, f.FARM_NAME, f.FARMER_ID, fa.NAME AS FARMER_NAME,
       s.SENSOR_TYPE, s.SENSOR_VALUE, s.UNIT, s.RECORDED_DATE, s.STATUS, s.NOTES
FROM SENSOR_DATA s
JOIN FARM f ON s.FARM_ID = f.FARM_ID
JOIN FARMER fa ON f.FARMER_ID = fa.FARMER_ID
WHERE 1=1
  AND (:farmId   IS NULL OR s.FARM_ID    = :farmId)
  AND (:stype    IS NULL OR s.SENSOR_TYPE= :stype)
  AND (:status   IS NULL OR s.STATUS     = :status)
  AND (:start    IS NULL OR s.RECORDED_DATE >= TO_DATE(:start, 'YYYY-MM-DD'))
  AND (:endDate  IS NULL OR s.RECORDED_DATE <= TO_DATE(:endDate, 'YYYY-MM-DD') + 1)
ORDER BY s.RECORDED_DATE DESC;

-- Admin: alerts list
SELECT sa.ALERT_ID, sa.SENSOR_ID, sa.FARM_ID, f.FARM_NAME, sa.FARMER_ID, fa.NAME AS FARMER_NAME,
       sa.SENSOR_TYPE, sa.SENSOR_VALUE, sa.THRESHOLD_VALUE, sa.ALERT_MESSAGE,
       sa.SMS_SENT, sa.EMAIL_SENT, sa.NOTIFICATION_SENT, sa.SMS_STATUS, sa.EMAIL_STATUS, sa.CREATED_DATE
FROM SENSOR_ALERTS sa
JOIN FARM f ON sa.FARM_ID = f.FARM_ID
JOIN FARMER fa ON sa.FARMER_ID = fa.FARMER_ID
WHERE 1=1
  AND (:farmId IS NULL OR sa.FARM_ID = :farmId)
  AND (:stype  IS NULL OR sa.SENSOR_TYPE = :stype)
  AND (:start  IS NULL OR sa.CREATED_DATE >= TO_DATE(:start, 'YYYY-MM-DD'))
  AND (:endD   IS NULL OR sa.CREATED_DATE <= TO_DATE(:endD,   'YYYY-MM-DD') + 1)
ORDER BY sa.CREATED_DATE DESC;

-- Stats
SELECT COUNT(*) FROM SENSOR_DATA;                          -- total readings
SELECT COUNT(*) FROM SENSOR_DATA WHERE STATUS='CRITICAL';   -- critical
SELECT COUNT(*) FROM SENSOR_DATA WHERE STATUS='WARNING';    -- warning
SELECT COUNT(*) FROM SENSOR_ALERTS;                         -- total alerts
SELECT SENSOR_TYPE, COUNT(*) FROM SENSOR_DATA GROUP BY SENSOR_TYPE ORDER BY COUNT(*) DESC;

/* =============================================================
   THRESHOLDS (farmer-configurable)
   ============================================================= */

-- Get thresholds for one type
SELECT MIN_VALUE, MAX_VALUE, CRITICAL_MIN, CRITICAL_MAX
FROM SENSOR_THRESHOLDS
WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType;

-- Upsert thresholds (update if exists)
SELECT THRESHOLD_ID FROM SENSOR_THRESHOLDS WHERE FARMER_ID=:farmerId AND SENSOR_TYPE=:sensorType;
UPDATE SENSOR_THRESHOLDS
SET CRITICAL_MIN=:criticalMin, CRITICAL_MAX=:criticalMax, UPDATED_DATE=SYSDATE
WHERE FARMER_ID=:farmerId AND SENSOR_TYPE=:sensorType;

-- Insert thresholds (create new row)
INSERT INTO SENSOR_THRESHOLDS (
  THRESHOLD_ID, FARMER_ID, SENSOR_TYPE, CRITICAL_MIN, CRITICAL_MAX, CREATED_DATE, UPDATED_DATE
) VALUES (
  SENSOR_THRESHOLD_SEQ.NEXTVAL, :farmerId, :sensorType, :criticalMin, :criticalMax, SYSDATE, SYSDATE
);

-- Default thresholds for all farmers (safe upsert)
MERGE INTO SENSOR_THRESHOLDS t
USING (
  SELECT f.farmer_id, s.sensor_type, s.min_value, s.max_value, s.critical_min, s.critical_max
  FROM FARMER f
  CROSS JOIN (
    SELECT 'SOIL_MOISTURE' sensor_type, NULL min_value, NULL max_value, 20 critical_min, 80     critical_max FROM dual
    UNION ALL SELECT 'SOIL_PH'     , NULL, NULL, 5.0, 8.5   FROM dual
    UNION ALL SELECT 'TEMPERATURE' , NULL, NULL, 5  , 40    FROM dual
    UNION ALL SELECT 'HUMIDITY'    , NULL, NULL, 30 , 95    FROM dual
    UNION ALL SELECT 'LIGHT'       , NULL, NULL, 1000, 100000 FROM dual
  ) s
) src
ON (t.farmer_id = src.farmer_id AND t.sensor_type = src.sensor_type)
WHEN MATCHED THEN UPDATE SET
  t.min_value=src.min_value, t.max_value=src.max_value,
  t.critical_min=src.critical_min, t.critical_max=src.critical_max,
  t.updated_date=SYSDATE
WHEN NOT MATCHED THEN INSERT (
  THRESHOLD_ID, FARMER_ID, SENSOR_TYPE, MIN_VALUE, MAX_VALUE, CRITICAL_MIN, CRITICAL_MAX, CREATED_DATE, UPDATED_DATE
) VALUES (
  SENSOR_THRESHOLD_SEQ.NEXTVAL, src.farmer_id, src.sensor_type, src.min_value, src.max_value, src.critical_min, src.critical_max, SYSDATE, SYSDATE
);

/* =============================================================
   TRIGGERS (farmer totals maintenance)
   ============================================================= */

CREATE OR REPLACE TRIGGER TRG_FARM_INSERT
AFTER INSERT ON FARM FOR EACH ROW
BEGIN
  UPDATE FARMER SET TOTAL_FARMS = TOTAL_FARMS + 1, TOTAL_AREA = TOTAL_AREA + :NEW.AREA
  WHERE FARMER_ID = :NEW.FARMER_ID;
END;
/

CREATE OR REPLACE TRIGGER TRG_FARM_UPDATE
AFTER UPDATE ON FARM FOR EACH ROW
BEGIN
  UPDATE FARMER SET TOTAL_AREA = TOTAL_AREA - :OLD.AREA + :NEW.AREA
  WHERE FARMER_ID = :NEW.FARMER_ID;
END;
/

CREATE OR REPLACE TRIGGER TRG_FARM_DELETE
AFTER DELETE ON FARM FOR EACH ROW
BEGIN
  UPDATE FARMER SET TOTAL_FARMS = TOTAL_FARMS - 1, TOTAL_AREA = TOTAL_AREA - :OLD.AREA
  WHERE FARMER_ID = :OLD.FARMER_ID;
END;
/

/* =============================================================
   PROCEDURES & FUNCTIONS (used by analytics/admin tools)
   ============================================================= */

CREATE OR REPLACE PROCEDURE CALCULATE_FARM_PROFITABILITY(
  p_farm_id IN NUMBER, p_profit OUT NUMBER, p_revenue OUT NUMBER, p_cost OUT NUMBER
) AS
BEGIN
  SELECT NVL(SUM(total_amount),0) INTO p_revenue FROM SALES WHERE farm_id=p_farm_id;
  SELECT NVL(SUM(total_cost),0) INTO p_cost FROM (
    SELECT total_cost FROM FERTILIZER WHERE farm_id=p_farm_id
    UNION ALL
    SELECT total_cost FROM LABOURWORK WHERE farm_id=p_farm_id
  );
  p_profit := p_revenue - p_cost;
END;
/

CREATE OR REPLACE PROCEDURE UPDATE_CROP_STATUS(
  p_crop_id IN NUMBER, p_new_status IN VARCHAR2, p_actual_yield IN NUMBER DEFAULT NULL, p_actual_harvest_date IN DATE DEFAULT NULL
) AS
BEGIN
  UPDATE CROP
  SET crop_status=p_new_status,
      actual_yield = NVL(p_actual_yield, actual_yield),
      actual_harvest_date = NVL(p_actual_harvest_date, actual_harvest_date)
  WHERE crop_id=p_crop_id;
  COMMIT;
END;
/

CREATE OR REPLACE PROCEDURE RECALC_FARMER_TOTALS AS
BEGIN
  UPDATE FARMER f
  SET (TOTAL_FARMS, TOTAL_AREA) = (
    SELECT COUNT(*), NVL(SUM(AREA),0) FROM FARM WHERE FARMER_ID=f.FARMER_ID AND STATUS='ACTIVE'
  );
  COMMIT;
END;
/

-- Optional helper used by registration flow in some environments
CREATE OR REPLACE PROCEDURE RESET_SEQUENCE(p_sequence_name IN VARCHAR2) AS
  v_max NUMBER := 0; v_sql VARCHAR2(4000);
BEGIN
  IF UPPER(p_sequence_name)='FARMER_SEQ' THEN SELECT NVL(MAX(farmer_id),0) INTO v_max FROM FARMER; END IF;
  IF UPPER(p_sequence_name)='FARM_SEQ' THEN SELECT NVL(MAX(farm_id),0) INTO v_max FROM FARM; END IF;
  IF UPPER(p_sequence_name)='SENSOR_DATA_SEQ' THEN SELECT NVL(MAX(sensor_id),0) INTO v_max FROM SENSOR_DATA; END IF;
  IF UPPER(p_sequence_name)='SENSOR_ALERT_SEQ' THEN SELECT NVL(MAX(alert_id),0) INTO v_max FROM SENSOR_ALERTS; END IF;
  IF UPPER(p_sequence_name)='SENSOR_THRESHOLD_SEQ' THEN SELECT NVL(MAX(threshold_id),0) INTO v_max FROM SENSOR_THRESHOLDS; END IF;
  BEGIN EXECUTE IMMEDIATE 'DROP SEQUENCE '||p_sequence_name; EXCEPTION WHEN OTHERS THEN NULL; END;
  v_sql := 'CREATE SEQUENCE '||p_sequence_name||' START WITH '||(v_max+1)||' INCREMENT BY 1 NOCACHE';
  EXECUTE IMMEDIATE v_sql;
END;
/

CREATE OR REPLACE FUNCTION GET_FARMER_STATS(p_farmer_id IN NUMBER) RETURN VARCHAR2 AS
  v_stats VARCHAR2(1000); v_farms NUMBER; v_crops NUMBER; v_revenue NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_farms FROM FARM WHERE farmer_id=p_farmer_id;
  SELECT COUNT(*) INTO v_crops FROM CROP c JOIN FARM f ON c.farm_id=f.farm_id WHERE f.farmer_id=p_farmer_id;
  SELECT NVL(SUM(s.total_amount),0) INTO v_revenue FROM SALES s JOIN FARM f ON s.farm_id=f.farm_id WHERE f.farmer_id=p_farmer_id;
  v_stats := 'Farms: '||v_farms||', Crops: '||v_crops||', Revenue: $'||v_revenue;
  RETURN v_stats;
END;
/

/* =============================================================
   VIEWS (for analytics)
   ============================================================= */

CREATE OR REPLACE VIEW FARMER_DASHBOARD AS
SELECT f.farmer_id, f.name AS farmer_name, f.phone,
       COUNT(DISTINCT fm.farm_id) AS total_farms,
       NVL(SUM(fm.area),0) AS total_area,
       COUNT(DISTINCT c.crop_id) AS total_crops,
       NVL(SUM(CASE WHEN c.crop_status='HARVESTED' THEN c.actual_yield ELSE 0 END),0) AS total_yield,
       NVL(SUM(s.total_amount),0) AS total_revenue,
       NVL(AVG(s.price_per_unit),0) AS avg_selling_price
FROM FARMER f
LEFT JOIN FARM fm ON f.farmer_id=fm.farmer_id
LEFT JOIN CROP c ON fm.farm_id=c.farm_id
LEFT JOIN SALES s ON fm.farm_id=s.farm_id
GROUP BY f.farmer_id, f.name, f.phone;
/

CREATE OR REPLACE VIEW FARM_PERFORMANCE AS
SELECT fm.farm_id, fm.farm_name, f.name AS farmer_name, fm.area, fm.soil_type,
       COUNT(DISTINCT c.crop_id) AS crops_count,
       NVL(SUM(c.expected_yield),0) AS expected_total_yield,
       NVL(SUM(c.actual_yield),0) AS actual_total_yield,
       CASE WHEN SUM(c.expected_yield)>0 THEN ROUND((SUM(c.actual_yield)/SUM(c.expected_yield))*100,2) ELSE 0 END AS yield_efficiency,
       NVL(SUM(s.total_amount),0) AS total_revenue,
       NVL(SUM(fer.total_cost),0) AS fertilizer_cost,
       NVL(SUM(lw.total_cost),0) AS labour_cost
FROM FARM fm
JOIN FARMER f ON fm.farmer_id=f.farmer_id
LEFT JOIN CROP c ON fm.farm_id=c.farm_id
LEFT JOIN SALES s ON fm.farm_id=s.farm_id
LEFT JOIN FERTILIZER fer ON fm.farm_id=fer.farm_id
LEFT JOIN LABOURWORK lw ON fm.farm_id=lw.farm_id
GROUP BY fm.farm_id, fm.farm_name, f.name, fm.area, fm.soil_type;
/

CREATE OR REPLACE VIEW CROP_ANALYTICS AS
SELECT c.crop_name,
       COUNT(*) AS total_crops,
       NVL(AVG(c.actual_yield),0) AS avg_yield,
       NVL(MIN(c.actual_yield),0) AS min_yield,
       NVL(MAX(c.actual_yield),0) AS max_yield,
       NVL(AVG(s.price_per_unit),0) AS avg_price,
       NVL(SUM(s.total_amount),0) AS total_revenue,
       NVL(AVG(c.actual_harvest_date - c.sowing_date),0) AS avg_growth_days
FROM CROP c
LEFT JOIN SALES s ON c.crop_id=s.crop_id
WHERE c.crop_status='HARVESTED'
GROUP BY c.crop_name;
/

CREATE OR REPLACE VIEW MONTHLY_REVENUE AS
SELECT TO_CHAR(s.sale_date,'YYYY-MM') AS month, f.name AS farmer_name,
       NVL(SUM(s.total_amount),0) AS monthly_revenue,
       COUNT(s.sale_id) AS sales_count,
       NVL(AVG(s.price_per_unit),0) AS avg_price
FROM SALES s
JOIN FARM fm ON s.farm_id=fm.farm_id
JOIN FARMER f ON fm.farmer_id=f.farmer_id
GROUP BY TO_CHAR(s.sale_date,'YYYY-MM'), f.name
ORDER BY month DESC;
/

-- End of all.sql (documentation catalog)
