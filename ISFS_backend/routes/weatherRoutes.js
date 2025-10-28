import express from 'express';
import { getConnection } from '../database/connection.js';
import { protect } from '../middleware/authMiddleware.js';
import { 
  fetchCurrentWeather, 
  fetchWeatherForecast, 
  getCoordinatesFromLocation,
  storeWeatherData 
} from '../services/weatherService.js';
import { getUnreadAlerts, markAlertAsRead } from '../services/alertService.js';

const router = express.Router();

// Apply authentication middleware
router.use(protect);

// GET /weather/current/:farm_id - Get current weather for a farm
router.get('/current/:farm_id', async (req, res) => {
  const { farm_id } = req.params;
  const farmer_id = req.farmer?.farmer_id;

  let connection;
  try {
    connection = await getConnection();

    // Verify farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT location FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Farm not found or access denied' });
    }

    const location = farmCheck.rows[0][0];
    
    // Get coordinates and fetch weather
    const coords = await getCoordinatesFromLocation(location);
    const weatherData = await fetchCurrentWeather(coords.latitude, coords.longitude);

    // Store weather data in database
    await storeWeatherData(parseInt(farm_id), weatherData);

    res.json({
      farmId: farm_id,
      location: location,
      ...weatherData
    });
  } catch (error) {
    console.error('Error fetching current weather:', error.message);
    res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /weather/forecast/:farm_id - Get 5-day forecast for a farm
router.get('/forecast/:farm_id', async (req, res) => {
  const { farm_id } = req.params;
  const farmer_id = req.farmer?.farmer_id;

  let connection;
  try {
    connection = await getConnection();

    // Verify farm belongs to farmer
    const farmCheck = await connection.execute(
      `SELECT location FROM FARM WHERE farm_id = :farm_id AND farmer_id = :farmer_id`,
      { farm_id: parseInt(farm_id), farmer_id }
    );

    if (farmCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Farm not found or access denied' });
    }

    const location = farmCheck.rows[0][0];
    
    // Get coordinates and fetch forecast
    const coords = await getCoordinatesFromLocation(location);
    const forecastData = await fetchWeatherForecast(coords.latitude, coords.longitude);

    res.json({
      farmId: farm_id,
      location: location,
      forecast: forecastData
    });
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
    res.status(500).json({ message: 'Failed to fetch forecast data', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /weather/alerts - Get farmer's weather alerts
router.get('/alerts', async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;
  const { limit = 50, unread_only = 'false' } = req.query;

  let connection;
  try {
    connection = await getConnection();

    let query = `
      SELECT 
        wa.alert_id, wa.farm_id, wa.alert_type, wa.weather_condition,
        DBMS_LOB.SUBSTR(wa.message, 4000, 1) as message,
        wa.sent_via, wa.status, wa.severity, wa.created_date, 
        wa.sent_date, wa.is_read, f.farm_name
      FROM WEATHER_ALERT wa
      LEFT JOIN FARM f ON wa.farm_id = f.farm_id
      WHERE wa.farmer_id = :farmer_id AND wa.status = 'SENT'
    `;

    if (unread_only === 'true') {
      query += ` AND wa.is_read = 0`;
    }

    query += ` ORDER BY wa.created_date DESC FETCH FIRST :limit ROWS ONLY`;

    const result = await connection.execute(query, {
      farmer_id,
      limit: parseInt(limit)
    });

    const alerts = result.rows.map(row => ({
      alertId: row[0],
      farmId: row[1],
      alertType: row[2],
      weatherCondition: row[3],
      message: row[4],
      sentVia: row[5],
      status: row[6],
      severity: row[7],
      createdDate: row[8],
      sentDate: row[9],
      isRead: row[10] === 1,
      farmName: row[11]
    }));

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    res.status(500).json({ message: 'Failed to fetch alerts', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /weather/alerts/:alert_id/read - Mark alert as read
router.put('/alerts/:alert_id/read', async (req, res) => {
  const { alert_id } = req.params;
  const farmer_id = req.farmer?.farmer_id;

  let connection;
  try {
    connection = await getConnection();

    // Verify alert belongs to farmer
    const alertCheck = await connection.execute(
      `SELECT farmer_id FROM WEATHER_ALERT WHERE alert_id = :alert_id`,
      { alert_id: parseInt(alert_id) }
    );

    if (alertCheck.rows.length === 0 || alertCheck.rows[0][0] !== farmer_id) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    await markAlertAsRead(parseInt(alert_id));

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Error marking alert as read:', error.message);
    res.status(500).json({ message: 'Failed to mark alert as read', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /weather/preferences - Get farmer's alert preferences
router.get('/preferences', async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;

  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT * FROM ALERT_PREFERENCES WHERE farmer_id = :farmer_id`,
      { farmer_id }
    );

    if (result.rows.length === 0) {
      // Return default preferences
      return res.json({
        farmerId: farmer_id,
        smsEnabled: true,
        inAppEnabled: true,
        temperatureThresholdHigh: 35,
        temperatureThresholdLow: 5,
        rainfallThreshold: 50,
        windThreshold: 40,
        humidityThresholdHigh: 90,
        humidityThresholdLow: 30
      });
    }

    const row = result.rows[0];
    res.json({
      preferenceId: row[0],
      farmerId: row[1],
      smsEnabled: row[2] === 1,
      inAppEnabled: row[3] === 1,
      temperatureThresholdHigh: row[4],
      temperatureThresholdLow: row[5],
      rainfallThreshold: row[6],
      windThreshold: row[7],
      humidityThresholdHigh: row[8],
      humidityThresholdLow: row[9]
    });
  } catch (error) {
    console.error('Error fetching preferences:', error.message);
    res.status(500).json({ message: 'Failed to fetch preferences', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /weather/preferences - Update farmer's alert preferences
router.put('/preferences', async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;
  const {
    smsEnabled,
    inAppEnabled,
    temperatureThresholdHigh,
    temperatureThresholdLow,
    rainfallThreshold,
    windThreshold,
    humidityThresholdHigh,
    humidityThresholdLow
  } = req.body;

  let connection;
  try {
    connection = await getConnection();

    // Check if preferences exist
    const existing = await connection.execute(
      `SELECT preference_id FROM ALERT_PREFERENCES WHERE farmer_id = :farmer_id`,
      { farmer_id }
    );

    if (existing.rows.length === 0) {
      // Insert new preferences
      await connection.execute(
        `INSERT INTO ALERT_PREFERENCES (
          preference_id, farmer_id, sms_enabled, in_app_enabled,
          temperature_threshold_high, temperature_threshold_low,
          rainfall_threshold, wind_threshold,
          humidity_threshold_high, humidity_threshold_low
        ) VALUES (
          ALERT_PREF_SEQ.NEXTVAL, :farmer_id, :sms_enabled, :in_app_enabled,
          :temp_high, :temp_low, :rainfall, :wind, :humidity_high, :humidity_low
        )`,
        {
          farmer_id,
          sms_enabled: smsEnabled ? 1 : 0,
          in_app_enabled: inAppEnabled ? 1 : 0,
          temp_high: temperatureThresholdHigh,
          temp_low: temperatureThresholdLow,
          rainfall: rainfallThreshold,
          wind: windThreshold,
          humidity_high: humidityThresholdHigh,
          humidity_low: humidityThresholdLow
        },
        { autoCommit: true }
      );
    } else {
      // Update existing preferences
      await connection.execute(
        `UPDATE ALERT_PREFERENCES SET
          sms_enabled = :sms_enabled,
          in_app_enabled = :in_app_enabled,
          temperature_threshold_high = :temp_high,
          temperature_threshold_low = :temp_low,
          rainfall_threshold = :rainfall,
          wind_threshold = :wind,
          humidity_threshold_high = :humidity_high,
          humidity_threshold_low = :humidity_low,
          updated_date = SYSDATE
         WHERE farmer_id = :farmer_id`,
        {
          farmer_id,
          sms_enabled: smsEnabled ? 1 : 0,
          in_app_enabled: inAppEnabled ? 1 : 0,
          temp_high: temperatureThresholdHigh,
          temp_low: temperatureThresholdLow,
          rainfall: rainfallThreshold,
          wind: windThreshold,
          humidity_high: humidityThresholdHigh,
          humidity_low: humidityThresholdLow
        },
        { autoCommit: true }
      );
    }

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Error updating preferences:', error.message);
    res.status(500).json({ message: 'Failed to update preferences', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /weather/refresh - Manually refresh weather data for all farms
router.post('/refresh', async (req, res) => {
  const farmer_id = req.farmer?.farmer_id;

  let connection;
  try {
    connection = await getConnection();

    // Get all farmer's farms
    const result = await connection.execute(
      `SELECT farm_id, farm_name, location FROM FARM WHERE farmer_id = :farmer_id AND status = 'ACTIVE'`,
      { farmer_id }
    );

    const weatherData = [];

    for (const row of result.rows) {
      const farmId = row[0];
      const farmName = row[1];
      const location = row[2];

      try {
        const coords = await getCoordinatesFromLocation(location);
        const weather = await fetchCurrentWeather(coords.latitude, coords.longitude);
        await storeWeatherData(farmId, weather);

        weatherData.push({
          farmId,
          farmName,
          ...weather
        });
      } catch (error) {
        console.error(`Error fetching weather for farm ${farmId}:`, error.message);
      }
    }

    res.json({
      message: 'Weather data refreshed',
      farmsUpdated: weatherData.length,
      weather: weatherData
    });
  } catch (error) {
    console.error('Error refreshing weather:', error.message);
    res.status(500).json({ message: 'Failed to refresh weather', error: error.message });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;

