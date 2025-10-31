-- Integrated Smart Farming System - SQL Reference (Used by Code)
-- Purpose: One place to see SQL statements used in backend/frontend and what they do.

-- =====================================
-- AUTH (backend/routes/authRoutes.js)
-- =====================================
-- Ensure unique phone, then insert farmer with sequence
-- SELECT FARMER_ID FROM FARMER WHERE PHONE = :phone;
-- INSERT INTO FARMER (FARMER_ID, NAME, PHONE, ADDRESS, PASSWORD)
--   VALUES (FARMER_SEQ.NEXTVAL, :name, :phone, :address, :password);

-- Sequence maintenance used during registration
-- SELECT COUNT(*) AS farmer_count, NVL(MAX(farmer_id), 0) AS max_id FROM FARMER;
-- SELECT COUNT(*) FROM user_sequences WHERE sequence_name = 'FARMER_SEQ';
-- DROP SEQUENCE FARMER_SEQ; CREATE SEQUENCE FARMER_SEQ START WITH :max_id_plus_one INCREMENT BY 1 NOCACHE;
-- Optional: BEGIN RESET_SEQUENCE('FARMER_SEQ'); END;

-- =====================================
-- SENSORS (backend/routes/sensorRoutes.js & services)
-- =====================================
-- Validate farm belongs to farmer
-- SELECT FARMER_ID FROM FARM WHERE FARM_ID = :farmId;

-- Insert sensor reading
-- INSERT INTO SENSOR_DATA (
--   sensor_id, farm_id, sensor_type, sensor_value, unit, recorded_date, status, notes
-- ) VALUES (
--   SENSOR_DATA_SEQ.NEXTVAL, :farmId, :sensorType, :value, :unit, SYSDATE, 'NORMAL', :notes
-- );
-- Get last inserted ID in same session
-- SELECT SENSOR_DATA_SEQ.CURRVAL FROM DUAL;

-- Update status after threshold check
-- UPDATE SENSOR_DATA SET status = :status WHERE sensor_id = :sensorId;

-- Persist critical alert
-- INSERT INTO SENSOR_ALERTS (
--   alert_id, sensor_id, farm_id, farmer_id, sensor_type, sensor_value,
--   threshold_value, alert_message, sms_sent, email_sent, notification_sent,
--   sms_status, email_status, created_date
-- ) VALUES (
--   SENSOR_ALERT_SEQ.NEXTVAL, :sensorId, :farmId, :farmerId, :sensorType, :value,
--   :thresholdValue, :alertMessage, :smsSent, :emailSent, :notificationSent,
--   :smsStatus, :emailStatus, SYSDATE
-- );

-- Readings list (filters applied as needed)
-- SELECT s.sensor_id, s.farm_id, f.farm_name, f.farmer_id, fa.name AS farmer_name,
--        s.sensor_type, s.sensor_value, s.unit, s.recorded_date, s.status, s.notes
-- FROM SENSOR_DATA s
-- JOIN FARM f ON s.farm_id = f.farm_id
-- JOIN FARMER fa ON f.farmer_id = fa.farmer_id
-- WHERE 1=1 AND (:farmId IS NULL OR s.farm_id = :farmId)
--   AND (:sensorType IS NULL OR s.sensor_type = :sensorType)
--   AND (:status IS NULL OR s.status = :status)
--   AND (:startDate IS NULL OR s.recorded_date >= TO_DATE(:startDate, 'YYYY-MM-DD'))
--   AND (:endDate IS NULL OR s.recorded_date <= TO_DATE(:endDate, 'YYYY-MM-DD') + 1)
-- ORDER BY s.recorded_date DESC;

-- =====================================
-- THRESHOLDS (backend/routes/sensorRoutes.js)
-- =====================================
-- Upsert thresholds for a farmer and sensorType
-- SELECT THRESHOLD_ID FROM SENSOR_THRESHOLDS WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType;
-- UPDATE SENSOR_THRESHOLDS SET CRITICAL_MIN = :criticalMin, CRITICAL_MAX = :criticalMax, UPDATED_DATE = SYSDATE
--   WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType;
-- INSERT INTO SENSOR_THRESHOLDS (
--   threshold_id, farmer_id, sensor_type, critical_min, critical_max, created_date, updated_date
-- ) VALUES (
--   SENSOR_THRESHOLD_SEQ.NEXTVAL, :farmerId, :sensorType, :criticalMin, :criticalMax, SYSDATE, SYSDATE
-- );

-- Get thresholds for a sensorType
-- SELECT MIN_VALUE, MAX_VALUE, CRITICAL_MIN, CRITICAL_MAX FROM SENSOR_THRESHOLDS
--   WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType;

-- =====================================
-- ADMIN SENSOR VIEWS (backend/routes/sensorRoutes.js)
-- =====================================
-- Alerts list
-- SELECT sa.alert_id, sa.sensor_id, sa.farm_id, f.farm_name, sa.farmer_id, fa.name as farmer_name,
--        sa.sensor_type, sa.sensor_value, sa.threshold_value, sa.alert_message,
--        sa.sms_sent, sa.email_sent, sa.notification_sent, sa.sms_status, sa.email_status, sa.created_date
-- FROM SENSOR_ALERTS sa
-- JOIN FARM f ON sa.farm_id = f.farm_id
-- JOIN FARMER fa ON sa.farmer_id = fa.farmer_id
-- WHERE 1=1 ... ORDER BY sa.created_date DESC;

-- Stats
-- SELECT COUNT(*) FROM SENSOR_DATA;                      -- totalReadings
-- SELECT COUNT(*) FROM SENSOR_DATA WHERE status='CRITICAL'; -- criticalCount
-- SELECT COUNT(*) FROM SENSOR_DATA WHERE status='WARNING';  -- warningCount
-- SELECT COUNT(*) FROM SENSOR_ALERTS;                    -- totalAlerts
-- SELECT sensor_type, COUNT(*) FROM SENSOR_DATA GROUP BY sensor_type ORDER BY COUNT(*) DESC; -- byType

-- =====================================
-- FRONTEND HINTS
-- =====================================
-- Tokens:
--  Farmer token:  localStorage.getItem('token')
--  Admin token:   localStorage.getItem('adminToken')
-- Adding sensor from UI calls: PUT /api/sensors/thresholds

-- End of reference
