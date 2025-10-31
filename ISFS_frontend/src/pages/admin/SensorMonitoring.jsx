import { useState, useEffect } from 'react';
import api from '../../api/axios';
import SensorCharts from '../../components/SensorCharts';
import SensorAlerts from '../../components/SensorAlerts';

const SensorMonitoring = () => {
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    farmId: '',
    sensorType: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [selectedReading, setSelectedReading] = useState(null);
  const [activeTab, setActiveTab] = useState('table'); // 'table', 'charts', 'alerts'

  useEffect(() => {
    fetchReadings();
    fetchStats();
  }, [filters]);

  const fetchReadings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.farmId) params.append('farmId', filters.farmId);
      if (filters.sensorType) params.append('sensorType', filters.sensorType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/admin/sensors/readings?${params.toString()}`);
      console.log('Sensor readings API response:', response.data);
      const readingsData = response.data.readings || response.data || [];
      console.log('Setting readings:', readingsData.length, 'items');
      setReadings(readingsData);
    } catch (error) {
      console.error('Error fetching sensor readings:', error);
      // Don't set empty array if it's an auth error - let the axios interceptor handle it
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        setReadings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/sensors/stats');
      console.log('Stats API response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error details:', error.response?.data);
      // Don't clear stats on auth errors - let axios interceptor handle redirect
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        setStats(null);
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.farmId) params.append('farmId', filters.farmId);
      if (filters.sensorType) params.append('sensorType', filters.sensorType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/admin/sensors/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sensor-data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sensor Monitoring System</h1>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Readings</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalReadings || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Critical Readings</div>
              <div className="text-2xl font-bold text-red-600">{stats.criticalCount || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Total Alerts</div>
              <div className="text-2xl font-bold text-orange-600">{stats.totalAlerts || 0}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">SMS Success Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.alertDelivery?.smsSuccessRate ?? 
                 (stats.totalAlerts > 0 
                  ? Math.round((stats.alertDelivery?.smsSuccess / stats.totalAlerts) * 100) 
                  : 0)}%
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="NORMAL">Normal</option>
              <option value="WARNING">Warning</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Export to CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('table')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'table'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Data Table
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'charts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Charts
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'alerts'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Alert History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sensor Readings</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : readings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No sensor readings found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or submit a sensor reading first.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farm</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sensor Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {readings.map((reading) => (
                      <tr key={reading.sensorId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{reading.farmName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{reading.sensorType}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-semibold">{reading.sensorValue}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{reading.unit || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reading.status)}`}>
                            {reading.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {reading.recordedDate ? new Date(reading.recordedDate).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {reading.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sensor Data Visualization</h2>
            {filters.farmId && filters.sensorType ? (
              <SensorCharts
                farmId={filters.farmId}
                sensorType={filters.sensorType}
                startDate={filters.startDate}
                endDate={filters.endDate}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please select a Farm ID and Sensor Type to view charts
              </div>
            )}
          </div>
        )}

        {activeTab === 'alerts' && (
          <SensorAlerts
            onAlertClick={(alert) => {
              setSelectedReading(alert);
              alert(`Alert Details:\n\nFarm: ${alert.farmName}\nSensor: ${alert.sensorType}\nValue: ${alert.sensorValue}\nMessage: ${alert.alertMessage}`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SensorMonitoring;

