import { useState, useEffect } from 'react';
import api from '../api/axios';

const SensorAlerts = ({ onAlertClick }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    farmId: '',
    sensorType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.farmId) params.append('farmId', filters.farmId);
      if (filters.sensorType) params.append('sensorType', filters.sensorType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/admin/sensors/alerts?${params.toString()}`);
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Historical Alert Log</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Farm ID"
            value={filters.farmId}
            onChange={(e) => handleFilterChange('farmId', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={filters.sensorType}
            onChange={(e) => handleFilterChange('sensorType', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Sensor Types</option>
            <option value="SOIL_MOISTURE">Soil Moisture</option>
            <option value="SOIL_PH">Soil pH</option>
            <option value="TEMPERATURE">Temperature</option>
            <option value="HUMIDITY">Humidity</option>
            <option value="LIGHT">Light</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="End Date"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No alerts found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Threshold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert.alertId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{alert.farmName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{alert.sensorType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-semibold">{alert.sensorValue}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{alert.thresholdValue || 'N/A'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <span className={alert.smsSent ? "text-green-600" : "text-red-600"}>
                        SMS {alert.smsSent ? '✓' : '✗'}
                      </span>
                      <span className={alert.emailSent ? "text-green-600" : "text-red-600"}>
                        Email {alert.emailSent ? '✓' : '✗'}
                      </span>
                      <span className={alert.notificationSent ? "text-green-600" : "text-red-600"}>
                        App {alert.notificationSent ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      SMS: {alert.smsStatus || 'N/A'} | Email: {alert.emailStatus || 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {alert.createdDate ? new Date(alert.createdDate).toLocaleString() : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onAlertClick && onAlertClick(alert)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SensorAlerts;

