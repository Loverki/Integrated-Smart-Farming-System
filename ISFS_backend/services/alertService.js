import { getConnection } from '../database/connection.js';
import { sendSMS, sendBulkSMS } from './smsService.js';
import { fetchCurrentWeather, getCoordinatesFromLocation, analyzeWeatherForAlerts } from './weatherService.js';

/**
 * Create and send weather alert to a farmer
 * @param {Object} alertData - Alert information
 * @returns {Promise<Object>} Alert result
 */
export async function createWeatherAlert(alertData) {
  const {
    farmerId,
    farmId,
    alertType,
    weatherCondition,
    message,
    sendVia = 'IN_APP',
    severity = 'INFO'
  } = alertData;

  let connection;
  try {
    connection = await getConnection();

    // Insert alert into database
    const result = await connection.execute(
      `INSERT INTO WEATHER_ALERT (
        alert_id, farmer_id, farm_id, alert_type, weather_condition,
        message, sent_via, status, severity, sent_date
      ) VALUES (
        WEATHER_ALERT_SEQ.NEXTVAL, :farmer_id, :farm_id, :alert_type, 
        :weather_condition, :message, :sent_via, 'PENDING', :severity, SYSDATE
      ) RETURNING alert_id INTO :alert_id`,
      {
        farmer_id: farmerId,
        farm_id: farmId,
        alert_type: alertType,
        weather_condition: weatherCondition,
        message: message,
        sent_via: sendVia,
        severity: severity,
        alert_id: { dir: connection.oracledb.BIND_OUT, type: connection.oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const alertId = result.outBinds.alert_id[0];

    // If SMS should be sent, get farmer's phone number
    if (sendVia === 'SMS' || sendVia === 'BOTH') {
      const farmerResult = await connection.execute(
        `SELECT phone FROM FARMER WHERE farmer_id = :farmer_id`,
        { farmer_id: farmerId }
      );

      if (farmerResult.rows.length > 0) {
        const phone = farmerResult.rows[0][0];
        const smsResult = await sendSMS(phone, message);

        if (smsResult.success) {
          await connection.execute(
            `UPDATE WEATHER_ALERT SET status = 'SENT' WHERE alert_id = :alert_id`,
            { alert_id: alertId },
            { autoCommit: false }
          );
        } else {
          await connection.execute(
            `UPDATE WEATHER_ALERT SET status = 'FAILED' WHERE alert_id = :alert_id`,
            { alert_id: alertId },
            { autoCommit: false }
          );
        }
      }
    } else {
      // For in-app only, mark as sent
      await connection.execute(
        `UPDATE WEATHER_ALERT SET status = 'SENT' WHERE alert_id = :alert_id`,
        { alert_id: alertId },
        { autoCommit: false }
      );
    }

    await connection.commit();

    console.log(`✅ Weather alert created: ${alertId} for farmer ${farmerId}`);

    return {
      success: true,
      alertId: alertId,
      message: 'Alert created successfully'
    };
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating weather alert:', error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Check weather for all farms and send alerts if needed
 */
export async function checkWeatherAndSendAlerts() {
  let connection;
  try {
    connection = await getConnection();

    // Get all active farms with their farmer info and alert preferences
    const result = await connection.execute(
      `SELECT 
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
      WHERE f.status = 'ACTIVE' AND fa.status = 'ACTIVE'`
    );

    console.log(`🔍 Checking weather for ${result.rows.length} farms...`);

    for (const row of result.rows) {
      const farm = {
        farmId: row[0],
        farmName: row[1],
        location: row[2],
        farmerId: row[3],
        phone: row[4],
        farmerName: row[5],
        smsEnabled: row[6],
        inAppEnabled: row[7],
        thresholds: {
          temperature_threshold_high: row[8],
          temperature_threshold_low: row[9],
          rainfall_threshold: row[10],
          wind_threshold: row[11],
          humidity_threshold_high: row[12],
          humidity_threshold_low: row[13]
        }
      };

      try {
        // Get coordinates and fetch weather
        const coords = await getCoordinatesFromLocation(farm.location);
        const weatherData = await fetchCurrentWeather(coords.latitude, coords.longitude);

        // Analyze weather for alert conditions
        const alerts = analyzeWeatherForAlerts(weatherData, farm.thresholds);

        // Send alerts if any conditions met
        for (const alert of alerts) {
          const sendVia = farm.smsEnabled && farm.inAppEnabled ? 'BOTH' : 
                         farm.smsEnabled ? 'SMS' : 'IN_APP';

          await createWeatherAlert({
            farmerId: farm.farmerId,
            farmId: farm.farmId,
            alertType: alert.type,
            weatherCondition: alert.condition,
            message: `${farm.farmName}: ${alert.message}`,
            sendVia: sendVia,
            severity: alert.severity
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error checking weather for farm ${farm.farmId}:`, error.message);
      }
    }

    console.log('✅ Weather check completed');
  } catch (error) {
    console.error('Error in weather check process:', error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Send manual alert to specific farmers
 * @param {Array<number>} farmerIds - Array of farmer IDs
 * @param {string} message - Alert message
 * @param {string} alertType - Type of alert
 * @returns {Promise<Array>} Results
 */
export async function sendManualAlert(farmerIds, message, alertType = 'MANUAL', severity = 'INFO') {
  let connection;
  try {
    connection = await getConnection();

    const results = [];

    for (const farmerId of farmerIds) {
      // Get farmer's farms and phone
      const farmerResult = await connection.execute(
        `SELECT f.farmer_id, f.phone, f.name, fm.farm_id, fm.farm_name,
                COALESCE(ap.sms_enabled, 1) as sms_enabled
         FROM FARMER f
         LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id
         LEFT JOIN ALERT_PREFERENCES ap ON f.farmer_id = ap.farmer_id
         WHERE f.farmer_id = :farmer_id AND f.status = 'ACTIVE'
         FETCH FIRST 1 ROWS ONLY`,
        { farmer_id: farmerId }
      );

      if (farmerResult.rows.length > 0) {
        const row = farmerResult.rows[0];
        const phone = row[1];
        const farmerName = row[2];
        const farmId = row[3] || null; // Handle NULL farm_id
        const smsEnabled = row[5];

        const sendVia = smsEnabled ? 'BOTH' : 'IN_APP';

        const result = await createWeatherAlert({
          farmerId: farmerId,
          farmId: farmId, // Can be NULL if farmer has no farms
          alertType: alertType,
          weatherCondition: 'Manual Alert',
          message: message,
          sendVia: sendVia,
          severity: severity
        });

        results.push({
          farmerId: farmerId,
          farmerName: farmerName,
          ...result
        });
      } else {
        // Farmer not found or inactive
        results.push({
          farmerId: farmerId,
          farmerName: 'Unknown',
          success: false,
          error: 'Farmer not found or inactive'
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending manual alerts:', error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Get unread alerts for a farmer
 * @param {number} farmerId - Farmer ID
 * @returns {Promise<Array>} Unread alerts
 */
export async function getUnreadAlerts(farmerId) {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT alert_id, alert_type, weather_condition, message, severity, created_date
       FROM WEATHER_ALERT
       WHERE farmer_id = :farmer_id AND is_read = 0 AND status = 'SENT'
       ORDER BY created_date DESC`,
      { farmer_id: farmerId }
    );

    return result.rows.map(row => ({
      alertId: row[0],
      alertType: row[1],
      condition: row[2],
      message: row[3],
      severity: row[4],
      createdDate: row[5]
    }));
  } catch (error) {
    console.error('Error fetching unread alerts:', error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Mark alert as read
 * @param {number} alertId - Alert ID
 */
export async function markAlertAsRead(alertId) {
  let connection;
  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE WEATHER_ALERT SET is_read = 1 WHERE alert_id = :alert_id`,
      { alert_id: alertId },
      { autoCommit: true }
    );
  } catch (error) {
    console.error('Error marking alert as read:', error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

