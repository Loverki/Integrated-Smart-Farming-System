import { getConnection } from "../database/connection.js";

/**
 * Default thresholds for different sensor types
 */
export function getDefaultThresholds() {
  return {
    SOIL_MOISTURE: {
      min_value: null,
      max_value: null,
      critical_min: 20,
      critical_max: 80,
      warning_min: 30,
      warning_max: 70,
      unit: '%'
    },
    SOIL_PH: {
      min_value: null,
      max_value: null,
      critical_min: 5.0,
      critical_max: 8.5,
      warning_min: 6.0,
      warning_max: 7.5,
      unit: 'pH'
    },
    TEMPERATURE: {
      min_value: null,
      max_value: null,
      critical_min: 5,
      critical_max: 40,
      warning_min: 10,
      warning_max: 35,
      unit: '°C'
    },
    HUMIDITY: {
      min_value: null,
      max_value: null,
      critical_min: 30,
      critical_max: 95,
      warning_min: 40,
      warning_max: 85,
      unit: '%'
    },
    LIGHT: {
      min_value: null,
      max_value: null,
      critical_min: 1000,
      critical_max: 100000,
      warning_min: 2000,
      warning_max: 80000,
      unit: 'lux'
    }
  };
}

/**
 * Get farmer-specific thresholds or return defaults
 */
export async function getFarmerThresholds(farmerId, sensorType) {
  let connection;
  try {
    connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT MIN_VALUE, MAX_VALUE, CRITICAL_MIN, CRITICAL_MAX 
       FROM SENSOR_THRESHOLDS 
       WHERE FARMER_ID = :farmerId AND SENSOR_TYPE = :sensorType`,
      { farmerId, sensorType }
    );

    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      const defaults = getDefaultThresholds();
      const defaultThresholds = defaults[sensorType] || defaults.TEMPERATURE;
      
      return {
        min_value: row[0],
        max_value: row[1],
        critical_min: row[2] ?? defaultThresholds.critical_min,
        critical_max: row[3] ?? defaultThresholds.critical_max,
        warning_min: defaultThresholds.warning_min,
        warning_max: defaultThresholds.warning_max
      };
    }

    // Return default thresholds
    const defaults = getDefaultThresholds();
    return defaults[sensorType] || defaults.TEMPERATURE;
  } catch (error) {
    console.error(`[Sensor Service] Error fetching thresholds:`, error.message);
    const defaults = getDefaultThresholds();
    return defaults[sensorType] || defaults.TEMPERATURE;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Check if sensor value exceeds thresholds
 * Returns: { isCritical: boolean, isWarning: boolean, status: string, thresholdValue: number }
 */
export async function checkSensorThresholds(farmId, sensorType, value) {
  let connection;
  try {
    connection = await getConnection();
    
    // Get farmer_id from farm
    const farmResult = await connection.execute(
      `SELECT FARMER_ID FROM FARM WHERE FARM_ID = :farmId`,
      { farmId }
    );

    if (!farmResult.rows || farmResult.rows.length === 0) {
      throw new Error(`Farm ${farmId} not found`);
    }

    const farmerId = farmResult.rows[0][0];
    const thresholds = await getFarmerThresholds(farmerId, sensorType);

    // Warning thresholds come from defaults or from the returned thresholds object
    const warningMin = thresholds.warning_min || null;
    const warningMax = thresholds.warning_max || null;

    let isCritical = false;
    let isWarning = false;
    let status = 'NORMAL';
    let thresholdValue = null;

    // Check critical thresholds (priority)
    if (thresholds.critical_min !== null && value < thresholds.critical_min) {
      isCritical = true;
      status = 'CRITICAL';
      thresholdValue = thresholds.critical_min;
    } else if (thresholds.critical_max !== null && value > thresholds.critical_max) {
      isCritical = true;
      status = 'CRITICAL';
      thresholdValue = thresholds.critical_max;
    }
    // Check warning thresholds if not critical
    else if (warningMin !== null && value < warningMin) {
      isWarning = true;
      status = 'WARNING';
      thresholdValue = warningMin;
    } else if (warningMax !== null && value > warningMax) {
      isWarning = true;
      status = 'WARNING';
      thresholdValue = warningMax;
    }

    return {
      isCritical,
      isWarning,
      status,
      thresholdValue,
      thresholds
    };
  } catch (error) {
    console.error(`[Sensor Service] Error checking thresholds:`, error.message);
    return {
      isCritical: false,
      isWarning: false,
      status: 'NORMAL',
      thresholdValue: null,
      thresholds: getDefaultThresholds()[sensorType] || getDefaultThresholds().TEMPERATURE
    };
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Store sensor reading in database
 */
export async function storeSensorReading(farmId, sensorType, value, unit, notes = null) {
  let connection;
  try {
    connection = await getConnection();
    
    // Insert sensor reading (without autoCommit first, so we can use CURRVAL)
    await connection.execute(
      `INSERT INTO SENSOR_DATA (
        sensor_id, farm_id, sensor_type, sensor_value, unit, recorded_date, status, notes
      ) VALUES (
        SENSOR_DATA_SEQ.NEXTVAL, :farmId, :sensorType, :value, :unit, SYSDATE, 'NORMAL', :notes
      )`,
      {
        farmId,
        sensorType,
        value,
        unit: unit || null,
        notes: notes || null
      },
      { autoCommit: false }  // Don't commit yet - we need to get the ID first
    );

    // Get the sensor ID using CURRVAL (works in same session before commit)
    let sensorId;
    try {
      const currvalResult = await connection.execute(
        `SELECT SENSOR_DATA_SEQ.CURRVAL FROM DUAL`
      );
      
      // Extract value - handle both array and object formats
      if (currvalResult.rows && currvalResult.rows.length > 0) {
        const row = currvalResult.rows[0];
        if (Array.isArray(row)) {
          sensorId = row[0];
        } else {
          sensorId = row.CURRVAL || row.currval || Object.values(row)[0];
        }
      }
      
      console.log(`[Sensor Service] CURRVAL result:`, { 
        rowsLength: currvalResult.rows?.length, 
        firstRow: currvalResult.rows?.[0],
        extractedId: sensorId 
      });
      
      if (!sensorId || sensorId === null || sensorId === undefined) {
        throw new Error('CURRVAL returned undefined');
      }
      
      console.log(`[Sensor Service] ✓ Got ID from CURRVAL: ${sensorId}`);
    } catch (currErr) {
      // If CURRVAL fails, query by unique combination
      console.warn(`[Sensor Service] CURRVAL failed:`, currErr.message);
      console.log(`[Sensor Service] Trying query method...`);
      
      try {
        const queryResult = await connection.execute(
          `SELECT sensor_id FROM SENSOR_DATA 
           WHERE farm_id = :farmId 
             AND sensor_type = :sensorType 
             AND sensor_value = :value
             AND recorded_date >= SYSDATE - 1/2880
           ORDER BY sensor_id DESC
           FETCH FIRST 1 ROW ONLY`,
          { farmId, sensorType, value }
        );
        
        if (queryResult.rows && queryResult.rows.length > 0) {
          const row = queryResult.rows[0];
          if (Array.isArray(row)) {
            sensorId = row[0];
          } else {
            sensorId = row.SENSOR_ID || row.sensor_id || Object.values(row)[0];
          }
          console.log(`[Sensor Service] ✓ Got ID from query: ${sensorId}`);
        } else {
          throw new Error('Query returned no rows');
        }
      } catch (queryErr) {
        // Last resort - get MAX ID
        console.warn(`[Sensor Service] Query method failed:`, queryErr.message);
        console.log(`[Sensor Service] Trying MAX method...`);
        
        const maxResult = await connection.execute(
          `SELECT MAX(sensor_id) FROM SENSOR_DATA`
        );
        
        if (maxResult.rows && maxResult.rows.length > 0) {
          const row = maxResult.rows[0];
          if (Array.isArray(row)) {
            sensorId = row[0];
          } else {
            sensorId = Object.values(row)[0];
          }
          console.log(`[Sensor Service] ✓ Got ID from MAX: ${sensorId}`);
        } else {
          throw new Error('MAX query returned no rows');
        }
      }
    }

    // Commit the transaction
    await connection.commit();

    if (!sensorId || sensorId === null || sensorId === undefined) {
      throw new Error('Failed to retrieve sensor ID after insert - tried all methods');
    }

    console.log(`[Sensor Service] ✓ Stored sensor reading: ID ${sensorId}, Farm ${farmId}, Type ${sensorType}, Value ${value}`);
    return sensorId;
  } catch (error) {
    // Rollback on error
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error(`[Sensor Service] Rollback error:`, rollbackErr.message);
      }
    }
    console.error(`[Sensor Service] Error storing sensor reading:`, error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Get sensor readings with optional filters
 */
export async function getSensorReadings(farmId = null, sensorType = null, startDate = null, endDate = null, status = null) {
  let connection;
  try {
    connection = await getConnection();
    
    let query = `
      SELECT 
        s.sensor_id,
        s.farm_id,
        f.farm_name,
        f.farmer_id,
        fa.name as farmer_name,
        s.sensor_type,
        s.sensor_value,
        s.unit,
        s.recorded_date,
        s.status,
        s.notes
      FROM SENSOR_DATA s
      JOIN FARM f ON s.farm_id = f.farm_id
      JOIN FARMER fa ON f.farmer_id = fa.farmer_id
      WHERE 1=1
    `;
    
    const params = {};
    
    if (farmId) {
      query += ` AND s.farm_id = :farmId`;
      params.farmId = farmId;
    }
    
    if (sensorType) {
      query += ` AND s.sensor_type = :sensorType`;
      params.sensorType = sensorType;
    }
    
    if (startDate) {
      query += ` AND s.recorded_date >= TO_DATE(:startDate, 'YYYY-MM-DD')`;
      params.startDate = startDate;
    }
    
    if (endDate) {
      query += ` AND s.recorded_date <= TO_DATE(:endDate, 'YYYY-MM-DD') + 1`;
      params.endDate = endDate;
    }
    
    if (status) {
      query += ` AND s.status = :status`;
      params.status = status;
    }
    
    query += ` ORDER BY s.recorded_date DESC`;
    
    const result = await connection.execute(query, params);
    
    const readings = result.rows.map(row => {
      // Handle both array and object formats from Oracle
      if (Array.isArray(row)) {
        return {
          sensorId: row[0],
          farmId: row[1],
          farmName: row[2] || 'Unknown',
          farmerId: row[3],
          farmerName: row[4] || 'Unknown',
          sensorType: row[5],
          sensorValue: row[6],
          unit: row[7] || null,
          recordedDate: row[8],
          status: row[9] || 'NORMAL',
          notes: row[10] || null
        };
      } else {
        // Object format (when outFormat is set)
        return {
          sensorId: row.SENSOR_ID || row.sensor_id,
          farmId: row.FARM_ID || row.farm_id,
          farmName: row.FARM_NAME || row.farm_name || 'Unknown',
          farmerId: row.FARMER_ID || row.farmer_id,
          farmerName: row.FARMER_NAME || row.farmer_name || row.NAME || row.name || 'Unknown',
          sensorType: row.SENSOR_TYPE || row.sensor_type,
          sensorValue: row.SENSOR_VALUE || row.sensor_value,
          unit: row.UNIT || row.unit || null,
          recordedDate: row.RECORDED_DATE || row.recorded_date,
          status: row.STATUS || row.status || 'NORMAL',
          notes: row.NOTES || row.notes || null
        };
      }
    });
    
    console.log(`[Sensor Service] Fetched ${readings.length} sensor readings`);
    if (readings.length > 0) {
      console.log(`[Sensor Service] Sample reading:`, readings[0]);
    }
    
    return readings;
  } catch (error) {
    console.error(`[Sensor Service] Error fetching sensor readings:`, error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Export sensor data to CSV format
 */
export async function exportSensorDataToCSV(farmId = null, sensorType = null, startDate = null, endDate = null, status = null) {
  const readings = await getSensorReadings(farmId, sensorType, startDate, endDate, status);
  
  // CSV header
  const headers = ['sensor_id', 'farm_name', 'sensor_type', 'sensor_value', 'unit', 'recorded_date', 'status', 'notes'];
  const csvRows = [headers.join(',')];
  
  // CSV rows
  readings.forEach(reading => {
    const row = [
      reading.sensorId,
      `"${reading.farmName}"`,
      reading.sensorType,
      reading.sensorValue,
      reading.unit || '',
      reading.recordedDate ? new Date(reading.recordedDate).toISOString().split('T')[0] : '',
      reading.status,
      `"${(reading.notes || '').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
}

