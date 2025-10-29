import axios from 'axios';
import { getConnection } from '../database/connection.js';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetch current weather for a farm location
 * @param {number} latitude - Farm latitude
 * @param {number} longitude - Farm longitude
 * @returns {Promise<Object>} Weather data
 */
export async function fetchCurrentWeather(latitude, longitude) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric' // Celsius
      }
    });

    return {
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      wind_speed: response.data.wind.speed,
      wind_deg: response.data.wind.deg,
      rainfall: response.data.rain?.['1h'] || 0,
      weather_main: response.data.weather[0].main,
      weather_description: response.data.weather[0].description,
      weather_icon: response.data.weather[0].icon,
      clouds: response.data.clouds.all,
      timestamp: new Date(response.data.dt * 1000)
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    throw new Error('Failed to fetch weather data from OpenWeatherMap');
  }
}

/**
 * Fetch 5-day weather forecast
 * @param {number} latitude - Farm latitude
 * @param {number} longitude - Farm longitude
 * @returns {Promise<Array>} Array of forecast data
 */
export async function fetchWeatherForecast(latitude, longitude) {
  try {
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    return response.data.list.map(item => ({
      timestamp: new Date(item.dt * 1000),
      temperature: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      wind_speed: item.wind.speed,
      rainfall: item.rain?.['3h'] || 0,
      weather_main: item.weather[0].main,
      weather_description: item.weather[0].description,
      weather_icon: item.weather[0].icon,
      clouds: item.clouds.all
    }));
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    throw new Error('Failed to fetch forecast data from OpenWeatherMap');
  }
}

/**
 * Store weather data in database
 * @param {number} farmId - Farm ID
 * @param {Object} weatherData - Weather data object
 */
export async function storeWeatherData(farmId, weatherData) {
  let connection;
  try {
    connection = await getConnection();
    
    await connection.execute(
      `INSERT INTO WEATHER_DATA (
        weather_id, farm_id, recorded_date, temperature, rainfall, 
        humidity, wind_speed
      ) VALUES (
        WEATHER_SEQ.NEXTVAL, :farm_id, SYSDATE, :temperature, :rainfall, 
        :humidity, :wind_speed
      )`,
      {
        farm_id: farmId,
        temperature: weatherData.temperature,
        rainfall: weatherData.rainfall,
        humidity: weatherData.humidity,
        wind_speed: weatherData.wind_speed
      },
      { autoCommit: true }
    );
    
    console.log(`✅ Weather data stored for farm ${farmId}`);
  } catch (error) {
    console.error('Error storing weather data:', error.message);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Get coordinates from farm location
 * @param {string} location - Farm location string
 * @returns {Promise<Object>} Coordinates {latitude, longitude}
 */
export async function getCoordinatesFromLocation(location) {
  try {
    console.log(`🌍 Fetching coordinates for location: "${location}"`);
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeatherMap API key is not configured. Please set OPENWEATHER_API_KEY in .env file');
    }

    // Add country code for better results (India)
    const searchQuery = `${location},IN`;
    
    const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct`, {
      params: {
        q: searchQuery,
        limit: 1,
        appid: OPENWEATHER_API_KEY
      }
    });

    console.log(`📍 Geocoding response for "${searchQuery}":`, response.data);

    if (response.data.length === 0) {
      console.error(`❌ Location "${location}" not found in OpenWeatherMap geocoding`);
      throw new Error(`Location "${location}" not found. Please use a valid city name like "Kurnool", "Mumbai", "Delhi", etc.`);
    }

    const coords = {
      latitude: response.data[0].lat,
      longitude: response.data[0].lon
    };
    
    console.log(`✅ Coordinates found for ${location}: ${coords.latitude}, ${coords.longitude}`);
    
    return coords;
  } catch (error) {
    console.error(`❌ Error getting coordinates for "${location}":`, error.message);
    if (error.response) {
      console.error('API Response:', error.response.status, error.response.data);
    }
    // Re-throw the error instead of using default coordinates
    throw new Error(`Failed to get coordinates for location "${location}". Please check if the location name is valid.`);
  }
}

/**
 * Analyze weather data for alert conditions
 * @param {Object} weatherData - Weather data
 * @param {Object} thresholds - Farmer's alert thresholds
 * @returns {Array} Array of alert conditions detected
 */
export function analyzeWeatherForAlerts(weatherData, thresholds) {
  const alerts = [];

  // Check temperature thresholds
  if (weatherData.temperature >= thresholds.temperature_threshold_high) {
    alerts.push({
      type: 'EXTREME_HEAT',
      condition: `Temperature: ${weatherData.temperature}°C`,
      severity: 'CRITICAL',
      message: `Extreme heat alert! Temperature has reached ${weatherData.temperature}°C. Consider providing extra water to crops and avoid working during peak hours.`
    });
  } else if (weatherData.temperature <= thresholds.temperature_threshold_low) {
    alerts.push({
      type: 'EXTREME_COLD',
      condition: `Temperature: ${weatherData.temperature}°C`,
      severity: 'WARNING',
      message: `Cold weather alert! Temperature has dropped to ${weatherData.temperature}°C. Protect sensitive crops from frost damage.`
    });
  }

  // Check rainfall threshold
  if (weatherData.rainfall >= thresholds.rainfall_threshold) {
    alerts.push({
      type: 'HEAVY_RAIN',
      condition: `Rainfall: ${weatherData.rainfall}mm`,
      severity: 'WARNING',
      message: `Heavy rainfall alert! ${weatherData.rainfall}mm of rain expected. Check drainage systems and protect crops from waterlogging.`
    });
  }

  // Check wind speed threshold
  if (weatherData.wind_speed >= thresholds.wind_threshold) {
    alerts.push({
      type: 'HIGH_WIND',
      condition: `Wind Speed: ${weatherData.wind_speed} km/h`,
      severity: 'WARNING',
      message: `High wind alert! Wind speed reaching ${weatherData.wind_speed} km/h. Secure equipment and check crop support structures.`
    });
  }

  // Check humidity thresholds
  if (weatherData.humidity >= thresholds.humidity_threshold_high) {
    alerts.push({
      type: 'HIGH_HUMIDITY',
      condition: `Humidity: ${weatherData.humidity}%`,
      severity: 'INFO',
      message: `High humidity alert! Humidity at ${weatherData.humidity}%. Monitor for fungal diseases and ensure proper ventilation.`
    });
  } else if (weatherData.humidity <= thresholds.humidity_threshold_low) {
    alerts.push({
      type: 'LOW_HUMIDITY',
      condition: `Humidity: ${weatherData.humidity}%`,
      severity: 'INFO',
      message: `Low humidity alert! Humidity at ${weatherData.humidity}%. Consider additional irrigation to prevent crop stress.`
    });
  }

  return alerts;
}

