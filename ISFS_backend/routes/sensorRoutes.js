import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";
import { getConnection } from "../database/connection.js";
import { processSensorReading } from "../services/sensorMonitorService.js";
import { 
  getSensorReadings, 
  getFarmerThresholds, 
  getDefaultThresholds,
  exportSensorDataToCSV 
} from "../services/sensorService.js";

const router = express.Router();
const adminRouter = express.Router();

// ==================== FARMER ENDPOINTS ====================

// POST /api/sensors/reading - Submit sensor reading
router.post("/reading", protect, async (req, res) => {
  const { farmId, sensorType, value, unit, notes } = req.body;
  const farmerId = req.farmer?.farmer_id;

  if (!farmId || !sensorType || value === undefined || value === null) {
    return res.status(400).json({ 
      message: "farmId, sensorType, and value are required" 
    });
  }

  // Validate that the farm belongs to the logged-in farmer
  let connection;
  try {
    connection = await getConnection();
    const farmCheck = await connection.execute(
      `SELECT FARMER_ID FROM FARM WHERE FARM_ID = :farmId`,
      { farmId }
    );

    if (!farmCheck.rows || farmCheck.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Farm not found" });
    }

    const farmFarmerId = farmCheck.rows[0][0];
    if (farmFarmerId !== farmerId) {
      await connection.close();
      return res.status(403).json({ message: "Access denied: Farm does not belong to you" });
    }

    await connection.close();

    // Process sensor reading
    const result = await processSensorReading(farmId, sensorType, parseFloat(value), unit, notes);

    res.json({
      message: "Sensor reading stored successfully",
      sensorId: result.sensorId,
      status: result.status,
      isCritical: result.isCritical,
      isWarning: result.isWarning,
      alert: result.alert
    });
  } catch (error) {
    console.error("Error submitting sensor reading:", error);
    res.status(500).json({ 
      message: "Failed to store sensor reading", 
      error: error.message 
    });
  }
});

// GET /api/sensors/readings - Get sensor readings for logged-in farmer's farms
router.get("/readings", protect, async (req, res) => {
  const farmerId = req.farmer?.farmer_id;
  const { farmId, sensorType, startDate, endDate, status } = req.query;

  let connection;
  try {
    connection = await getConnection();

    // If farmId specified, verify it belongs to farmer
    let validFarmId = null;
    if (farmId) {
      const farmCheck = await connection.execute(
        `SELECT FARM_ID FROM FARM WHERE FARM_ID = :farmId AND FARMER_ID = :farmerId`,
        { farmId: parseInt(farmId), farmerId }
      );
      if (farmCheck.rows && farmCheck.rows.length > 0) {
        validFarmId = parseInt(farmId);
      }
    } else {
      // Get all farm IDs for this farmer
      const farmsResult = await connection.execute(
        `SELECT FARM_ID FROM FARM WHERE FARMER_ID = :farmerId`,
        { farmerId }
      );
      if (farmsResult.rows && farmsResult.rows.length > 0) {
        // For multiple farms, we'll filter in the service
        // Pass null to get all farms
        validFarmId = null;
      }
    }

    // Get all farm IDs for this farmer first
    const farmerFarmsResult = await connection.execute(
      `SELECT FARM_ID FROM FARM WHERE FARMER_ID = :farmerId`,
      { farmerId }
    );
    const farmerFarmIds = farmerFarmsResult.rows.map(row => row[0]);
    
    await connection.close();

    // Get readings (filter by farmer's farms)
    // Since getSensorReadings opens its own connection, we'll filter after
    const allReadings = await getSensorReadings(validFarmId, sensorType, startDate, endDate, status);
    
    // Filter to only include this farmer's farms
    const filteredReadings = allReadings.filter(r => farmerFarmIds.includes(r.farmId));

    res.json({
      readings: filteredReadings,
      count: filteredReadings.length
    });
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ 
      message: "Failed to fetch sensor readings", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/sensors/readings/:farmId - Get readings for specific farm
router.get("/readings/:farmId", protect, async (req, res) => {
  const { farmId } = req.params;
  const farmerId = req.farmer?.farmer_id;
  const { sensorType, startDate, endDate, status } = req.query;

  let connection;
  try {
    connection = await getConnection();

    // Verify farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT FARM_ID FROM FARM WHERE FARM_ID = :farmId AND FARMER_ID = :farmerId`,
      { farmId: parseInt(farmId), farmerId }
    );

    if (!farmCheck.rows || farmCheck.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Farm not found or access denied" });
    }

    await connection.close();

    const readings = await getSensorReadings(parseInt(farmId), sensorType, startDate, endDate, status);

    res.json({
      readings,
      count: readings.length
    });
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ 
      message: "Failed to fetch sensor readings", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/sensors/thresholds - Get current thresholds for farmer
router.get("/thresholds", protect, async (req, res) => {
  const farmerId = req.farmer?.farmer_id;
  const { sensorType } = req.query;

  try {
    const defaults = getDefaultThresholds();
    
    if (sensorType) {
      const thresholds = await getFarmerThresholds(farmerId, sensorType);
      const defaultThresholds = defaults[sensorType] || defaults.TEMPERATURE;
      
      res.json({
        sensorType,
        thresholds: {
          critical_min: thresholds.critical_min ?? defaultThresholds.critical_min,
          critical_max: thresholds.critical_max ?? defaultThresholds.critical_max,
          warning_min: defaultThresholds.warning_min,
          warning_max: defaultThresholds.warning_max,
          unit: defaultThresholds.unit
        },
        defaults: defaultThresholds
      });
    } else {
      // Return all sensor types
      const allThresholds = {};
      for (const type of Object.keys(defaults)) {
        const thresholds = await getFarmerThresholds(farmerId, type);
        const defaultThresholds = defaults[type];
        allThresholds[type] = {
          critical_min: thresholds.critical_min ?? defaultThresholds.critical_min,
          critical_max: thresholds.critical_max ?? defaultThresholds.critical_max,
          warning_min: defaultThresholds.warning_min,
          warning_max: defaultThresholds.warning_max,
          unit: defaultThresholds.unit
        };
      }
      
      res.json({
        thresholds: allThresholds,
        defaults
      });
    }
  } catch (error) {
    console.error("Error fetching thresholds:", error);
    res.status(500).json({ 
      message: "Failed to fetch thresholds", 
      error: error.message 
    });
  }
});

// PUT /api/sensors/thresholds - Update thresholds for farmer
router.put("/thresholds", protect, async (req, res) => {
  const farmerId = req.farmer?.farmer_id;
  const { sensorType, criticalMin, criticalMax, useDefaults } = req.body;

  if (!sensorType) {
    return res.status(400).json({ 
      message: "sensorType is required" 
    });
  }

  let connection;
  try {
    connection = await getConnection();

    // Determine values to store: allow farmer to add a sensor with defaults
    // If neither value provided or useDefaults=true, fallback to system defaults
    let valuesToPersist = { criticalMin, criticalMax };
    if ((criticalMin === undefined && criticalMax === undefined) || useDefaults === true) {
      const defaults = getDefaultThresholds();
      const def = defaults[sensorType] || defaults.TEMPERATURE;
      valuesToPersist.criticalMin = def.critical_min;
      valuesToPersist.criticalMax = def.critical_max;
    }

    // Check if threshold exists
    const existing = await connection.execute(
      `SELECT THRESHOLD_ID FROM SENSOR_THRESHOLDS 
       WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType`,
      { farmerId, sensorType }
    );

    if (existing.rows && existing.rows.length > 0) {
      // Update existing
      await connection.execute(
        `UPDATE SENSOR_THRESHOLDS 
         SET CRITICAL_MIN = :criticalMin, 
             CRITICAL_MAX = :criticalMax,
             UPDATED_DATE = SYSDATE
         WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType`,
        {
          criticalMin: valuesToPersist.criticalMin !== undefined ? valuesToPersist.criticalMin : null,
          criticalMax: valuesToPersist.criticalMax !== undefined ? valuesToPersist.criticalMax : null,
          farmerId,
          sensorType
        },
        { autoCommit: true }
      );
    } else {
      // Insert new
      await connection.execute(
        `INSERT INTO SENSOR_THRESHOLDS (
          threshold_id, farmer_id, sensor_type, critical_min, critical_max, created_date, updated_date
        ) VALUES (
          SENSOR_THRESHOLD_SEQ.NEXTVAL, :farmerId, :sensorType, :criticalMin, :criticalMax, SYSDATE, SYSDATE
        )`,
        {
          farmerId,
          sensorType,
          criticalMin: valuesToPersist.criticalMin !== undefined ? valuesToPersist.criticalMin : null,
          criticalMax: valuesToPersist.criticalMax !== undefined ? valuesToPersist.criticalMax : null
        },
        { autoCommit: true }
      );
    }

    await connection.close();

    res.json({
      message: existing.rows && existing.rows.length > 0 ? "Thresholds updated successfully" : "Sensor added with thresholds",
      sensorType,
      criticalMin: valuesToPersist.criticalMin ?? null,
      criticalMax: valuesToPersist.criticalMax ?? null
    });
  } catch (error) {
    console.error("Error updating thresholds:", error);
    res.status(500).json({ 
      message: "Failed to update thresholds", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// ==================== ADMIN ENDPOINTS ====================

// POST /api/admin/sensors/reading - Admin endpoint to submit reading for any farm
adminRouter.post("/reading", protectAdmin, async (req, res) => {
  const { farmId, sensorType, value, unit, notes } = req.body;

  if (!farmId || !sensorType || value === undefined || value === null) {
    return res.status(400).json({ 
      message: "farmId, sensorType, and value are required" 
    });
  }

  try {
    const result = await processSensorReading(farmId, sensorType, parseFloat(value), unit, notes);

    res.json({
      message: "Sensor reading stored successfully",
      sensorId: result.sensorId,
      status: result.status,
      isCritical: result.isCritical,
      isWarning: result.isWarning,
      alert: result.alert
    });
  } catch (error) {
    console.error("Error submitting sensor reading:", error);
    res.status(500).json({ 
      message: "Failed to store sensor reading", 
      error: error.message 
    });
  }
});

// GET /api/admin/sensors/readings - Get all sensor readings (with filters)
adminRouter.get("/readings", protectAdmin, async (req, res) => {
  const { farmId, sensorType, startDate, endDate, status } = req.query;

  try {
    const readings = await getSensorReadings(
      farmId ? parseInt(farmId) : null,
      sensorType || null,
      startDate || null,
      endDate || null,
      status || null
    );

    res.json({
      readings,
      count: readings.length
    });
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ 
      message: "Failed to fetch sensor readings", 
      error: error.message 
    });
  }
});

// GET /api/admin/sensors/alerts - Get historical sensor alerts
adminRouter.get("/alerts", protectAdmin, async (req, res) => {
  const { farmId, sensorType, startDate, endDate } = req.query;

  let connection;
  try {
    connection = await getConnection();

    let query = `
      SELECT 
        sa.alert_id,
        sa.sensor_id,
        sa.farm_id,
        f.farm_name,
        sa.farmer_id,
        fa.name as farmer_name,
        sa.sensor_type,
        sa.sensor_value,
        sa.threshold_value,
        sa.alert_message,
        sa.sms_sent,
        sa.email_sent,
        sa.notification_sent,
        sa.sms_status,
        sa.email_status,
        sa.created_date
      FROM SENSOR_ALERTS sa
      JOIN FARM f ON sa.farm_id = f.farm_id
      JOIN FARMER fa ON sa.farmer_id = fa.farmer_id
      WHERE 1=1
    `;

    const params = {};

    if (farmId) {
      query += ` AND sa.farm_id = :farmId`;
      params.farmId = parseInt(farmId);
    }

    if (sensorType) {
      query += ` AND sa.sensor_type = :sensorType`;
      params.sensorType = sensorType;
    }

    if (startDate) {
      query += ` AND sa.created_date >= TO_DATE(:startDate, 'YYYY-MM-DD')`;
      params.startDate = startDate;
    }

    if (endDate) {
      query += ` AND sa.created_date <= TO_DATE(:endDate, 'YYYY-MM-DD') + 1`;
      params.endDate = endDate;
    }

    query += ` ORDER BY sa.created_date DESC`;

    const result = await connection.execute(query, params);

    const alerts = result.rows.map(row => ({
      alertId: row[0],
      sensorId: row[1],
      farmId: row[2],
      farmName: row[3],
      farmerId: row[4],
      farmerName: row[5],
      sensorType: row[6],
      sensorValue: row[7],
      thresholdValue: row[8],
      alertMessage: row[9],
      smsSent: row[10] === 1,
      emailSent: row[11] === 1,
      notificationSent: row[12] === 1,
      smsStatus: row[13],
      emailStatus: row[14],
      createdDate: row[15]
    }));

    res.json({
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error("Error fetching sensor alerts:", error);
    res.status(500).json({ 
      message: "Failed to fetch sensor alerts", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/sensors/export - Export sensor data to CSV
adminRouter.get("/export", protectAdmin, async (req, res) => {
  const { farmId, sensorType, startDate, endDate, status } = req.query;

  try {
    const csvData = await exportSensorDataToCSV(
      farmId ? parseInt(farmId) : null,
      sensorType || null,
      startDate || null,
      endDate || null,
      status || null
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sensor-data.csv');
    res.send(csvData);
  } catch (error) {
    console.error("Error exporting sensor data:", error);
    res.status(500).json({ 
      message: "Failed to export sensor data", 
      error: error.message 
    });
  }
});

// GET /api/admin/sensors/stats - Get sensor statistics
adminRouter.get("/stats", protectAdmin, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    // Helper function to extract count from Oracle result
    const extractCount = (result) => {
      if (!result.rows || result.rows.length === 0) return 0;
      const row = result.rows[0];
      if (Array.isArray(row)) {
        return row[0] || 0;
      } else {
        // Object format
        return Object.values(row)[0] || 0;
      }
    };

    // Total readings
    const totalResult = await connection.execute(
      `SELECT COUNT(*) FROM SENSOR_DATA`
    );
    const totalReadings = extractCount(totalResult);

    // Critical readings
    const criticalResult = await connection.execute(
      `SELECT COUNT(*) FROM SENSOR_DATA WHERE status = 'CRITICAL'`
    );
    const criticalCount = extractCount(criticalResult);

    // Warning readings
    const warningResult = await connection.execute(
      `SELECT COUNT(*) FROM SENSOR_DATA WHERE status = 'WARNING'`
    );
    const warningCount = extractCount(warningResult);

    // Total alerts
    const alertsResult = await connection.execute(
      `SELECT COUNT(*) FROM SENSOR_ALERTS`
    );
    const totalAlerts = extractCount(alertsResult);

    // SMS Success count
    const smsSuccessResult = await connection.execute(
      `SELECT COUNT(*) FROM SENSOR_ALERTS WHERE sms_status = 'SENT' OR sms_status = 'SUCCESS'`
    );
    const smsSuccess = extractCount(smsSuccessResult);

    // Email Success count
    const emailSuccessResult = await connection.execute(
      `SELECT COUNT(*) FROM SENSOR_ALERTS WHERE email_status = 'SENT' OR email_status = 'SUCCESS'`
    );
    const emailSuccess = extractCount(emailSuccessResult);

    // Readings by sensor type
    const typeResult = await connection.execute(
      `SELECT sensor_type, COUNT(*) as count 
       FROM SENSOR_DATA 
       GROUP BY sensor_type 
       ORDER BY count DESC`
    );
    const byType = typeResult.rows.map(row => {
      if (Array.isArray(row)) {
        return {
          sensorType: row[0],
          count: row[1]
        };
      } else {
        return {
          sensorType: row.SENSOR_TYPE || row.sensor_type,
          count: row.COUNT || row.count || Object.values(row).find(v => typeof v === 'number')
        };
      }
    });

    // Calculate SMS success rate
    const smsSuccessRate = totalAlerts > 0 ? Math.round((smsSuccess / totalAlerts) * 100) : 0;

    const stats = {
      totalReadings,
      criticalCount,
      warningCount,
      totalAlerts,
      alertDelivery: {
        smsSuccess,
        emailSuccess,
        smsSuccessRate
      },
      bySensorType: byType
    };

    console.log('[Sensor Stats] Fetched statistics:', stats);

    res.json(stats);
  } catch (error) {
    console.error("Error fetching sensor statistics:", error);
    res.status(500).json({ 
      message: "Failed to fetch sensor statistics", 
      error: error.message 
    });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;
export { adminRouter };

