import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const WeatherDashboard = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch farms on mount
  useEffect(() => {
    fetchFarms();
    fetchAlerts();
  }, []);

  // Fetch weather when farm selected
  useEffect(() => {
    if (selectedFarm) {
      fetchCurrentWeather(selectedFarm);
      fetchForecast(selectedFarm);
    }
  }, [selectedFarm]);

  const fetchFarms = async () => {
    try {
      const response = await api.get('/farms');
      const farmsData = response.data;
      console.log('🏡 Farms loaded for weather:', farmsData);
      setFarms(farmsData);
      if (farmsData.length > 0 && !selectedFarm) {
        const firstFarmId = farmsData[0].farmId || farmsData[0].FARM_ID || farmsData[0].farm_id;
        console.log('🌤️ Auto-selecting farm for weather:', firstFarmId);
        setSelectedFarm(firstFarmId);
      }
    } catch (error) {
      console.error('Error fetching farms:', error);
      alert('Failed to load farms. Please refresh the page.');
    }
  };

  const fetchCurrentWeather = async (farmId) => {
    setLoading(true);
    try {
      console.log(`🌦️ Fetching current weather for farm ${farmId}`);
      const response = await api.get(`/weather/current/${farmId}`);
      console.log('✅ Weather data received:', response.data);
      setCurrentWeather(response.data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      alert('Failed to fetch weather data. Please check if your farm has a valid location.');
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (farmId) => {
    try {
      console.log(`📅 Fetching forecast for farm ${farmId}`);
      const response = await api.get(`/weather/forecast/${farmId}`);
      console.log('✅ Forecast data received:', response.data);
      setForecast(response.data.forecast || []);
    } catch (error) {
      console.error('Error fetching forecast:', error);
      // Don't alert here as it's not critical
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/weather/alerts?limit=20');
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleRefreshWeather = async () => {
    setRefreshing(true);
    try {
      await api.post('/weather/refresh');
      if (selectedFarm) {
        await fetchCurrentWeather(selectedFarm);
        await fetchForecast(selectedFarm);
      }
      await fetchAlerts();
    } catch (error) {
      console.error('Error refreshing weather:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const markAlertAsRead = async (alertId) => {
    try {
      await api.put(`/weather/alerts/${alertId}/read`);
      setAlerts(prev => prev.map(alert => 
        alert.alertId === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getDailyForecast = () => {
    // Group forecast by day and get one entry per day
    const dailyMap = new Map();
    forecast.forEach(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      if (!dailyMap.has(date)) {
        dailyMap.set(date, item);
      }
    });
    return Array.from(dailyMap.values()).slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Weather Dashboard</h1>
            <div className="flex gap-4">
              <button
                onClick={handleRefreshWeather}
                disabled={refreshing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Weather'}
              </button>
              <button
                onClick={() => navigate('/alert-preferences')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ⚙️ Alert Settings
              </button>
            </div>
          </div>

          {/* Farm Selector */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Farm</label>
            <select
              value={selectedFarm || ''}
              onChange={(e) => setSelectedFarm(Number(e.target.value))}
              className="w-full md:w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
            >
              {farms.map((farm, index) => {
                const farmId = farm.farmId || farm.FARM_ID || farm.farm_id;
                const farmName = farm.farmName || farm.FARM_NAME || farm.farm_name;
                const location = farm.location || farm.LOCATION;
                return (
                  <option key={farmId || `farm-${index}`} value={farmId}>
                    {farmName} {location ? `- ${location}` : ''}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Current Weather */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        ) : currentWeather ? (
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{currentWeather.location}</h2>
                <p className="text-5xl font-bold">{Math.round(currentWeather.temperature)}°C</p>
                <p className="text-xl capitalize mt-2">{currentWeather.weather_description}</p>
                <p className="text-sm mt-1">Feels like {Math.round(currentWeather.feels_like)}°C</p>
              </div>
              {currentWeather.weather_icon && (
                <img 
                  src={getWeatherIcon(currentWeather.weather_icon)} 
                  alt="Weather" 
                  className="w-32 h-32"
                />
              )}
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-blue-400">
              <div>
                <p className="text-sm opacity-80">Humidity</p>
                <p className="text-2xl font-semibold">{currentWeather.humidity}%</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Wind Speed</p>
                <p className="text-2xl font-semibold">{currentWeather.wind_speed} km/h</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Pressure</p>
                <p className="text-2xl font-semibold">{currentWeather.pressure} hPa</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Rainfall</p>
                <p className="text-2xl font-semibold">{currentWeather.rainfall} mm</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* 5-Day Forecast */}
        {getDailyForecast().length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">5-Day Forecast</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {getDailyForecast().map((day, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="font-semibold text-gray-700">
                    {new Date(day.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  {day.weather_icon && (
                    <img 
                      src={getWeatherIcon(day.weather_icon)} 
                      alt="Weather" 
                      className="w-16 h-16 mx-auto"
                    />
                  )}
                  <p className="text-2xl font-bold text-gray-800">{Math.round(day.temperature)}°C</p>
                  <p className="text-sm text-gray-600 capitalize">{day.weather_description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>💧 {day.humidity}%</p>
                    <p>💨 {day.wind_speed} km/h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Weather Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No weather alerts</p>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.alertId}
                  className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)} ${
                    alert.isRead ? 'opacity-60' : ''
                  }`}
                  onClick={() => !alert.isRead && markAlertAsRead(alert.alertId)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{alert.alertType.replace(/_/g, ' ')}</span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full">
                          {alert.severity}
                        </span>
                        {!alert.isRead && (
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-sm mb-1">{alert.message}</p>
                      <div className="flex gap-4 text-xs opacity-75">
                        <span>📍 {alert.farmName}</span>
                        <span>📅 {new Date(alert.createdDate).toLocaleString()}</span>
                        <span>📱 {alert.sentVia}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;

