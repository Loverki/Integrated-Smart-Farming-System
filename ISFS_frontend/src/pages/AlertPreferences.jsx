import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AlertPreferences = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    smsEnabled: true,
    inAppEnabled: true,
    temperatureThresholdHigh: 35,
    temperatureThresholdLow: 5,
    rainfallThreshold: 50,
    windThreshold: 40,
    humidityThresholdHigh: 90,
    humidityThresholdLow: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/weather/preferences');
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await api.put('/weather/preferences', preferences);
      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setTimeout(() => {
        navigate('/weather');
      }, 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setPreferences({
      smsEnabled: true,
      inAppEnabled: true,
      temperatureThresholdHigh: 35,
      temperatureThresholdLow: 5,
      rainfallThreshold: 50,
      windThreshold: 40,
      humidityThresholdHigh: 90,
      humidityThresholdLow: 30
    });
    setMessage({ type: 'info', text: 'Reset to default values' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Alert Preferences</h1>
            <button
              onClick={() => navigate('/weather')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Weather
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Configure when and how you receive weather alerts for your farms
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Channels */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Notification Channels</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="smsEnabled"
                  checked={preferences.smsEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-800">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive alerts via SMS text messages</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="inAppEnabled"
                  checked={preferences.inAppEnabled}
                  onChange={handleChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-gray-800">In-App Notifications</p>
                  <p className="text-sm text-gray-600">View alerts in your dashboard</p>
                </div>
              </label>
            </div>
          </div>

          {/* Temperature Thresholds */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🌡️ Temperature Alerts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  High Temperature Alert (°C)
                </label>
                <input
                  type="number"
                  name="temperatureThresholdHigh"
                  value={preferences.temperatureThresholdHigh}
                  onChange={handleChange}
                  min="25"
                  max="50"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when temperature exceeds this value</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Temperature Alert (°C)
                </label>
                <input
                  type="number"
                  name="temperatureThresholdLow"
                  value={preferences.temperatureThresholdLow}
                  onChange={handleChange}
                  min="0"
                  max="15"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when temperature drops below this value</p>
              </div>
            </div>
          </div>

          {/* Other Weather Thresholds */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🌦️ Other Weather Conditions</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💧 Rainfall Alert Threshold (mm)
                </label>
                <input
                  type="number"
                  name="rainfallThreshold"
                  value={preferences.rainfallThreshold}
                  onChange={handleChange}
                  min="10"
                  max="200"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when rainfall exceeds this amount</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💨 Wind Speed Alert Threshold (km/h)
                </label>
                <input
                  type="number"
                  name="windThreshold"
                  value={preferences.windThreshold}
                  onChange={handleChange}
                  min="20"
                  max="100"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Alert when wind speed exceeds this value</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    High Humidity Alert (%)
                  </label>
                  <input
                    type="number"
                    name="humidityThresholdHigh"
                    value={preferences.humidityThresholdHigh}
                    onChange={handleChange}
                    min="70"
                    max="100"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when humidity exceeds this value</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Low Humidity Alert (%)
                  </label>
                  <input
                    type="number"
                    name="humidityThresholdLow"
                    value={preferences.humidityThresholdLow}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when humidity drops below this value</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <button
              type="button"
              onClick={resetToDefaults}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/weather')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlertPreferences;

