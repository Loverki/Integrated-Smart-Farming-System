import { useState, useEffect } from 'react';
import api from '../../api/axios';

const AlertManagement = () => {
  const [farmers, setFarmers] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedFarmers, setSelectedFarmers] = useState([]);
  const [alertForm, setAlertForm] = useState({
    title: '',
    message: '',
    alertType: 'MANUAL',
    severity: 'INFO'
  });
  const [filter, setFilter] = useState({
    status: '',
    severity: '',
    farmer_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchFarmers();
    fetchAlertHistory();
    fetchStats();
  }, [filter]);

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/admin/farmers?limit=1000'); // Get all farmers
      
      // The API returns { farmers: [...], pagination: {...} }
      // Farmers data is an array of objects with uppercase property names
      const rawFarmers = response.data.farmers || [];
      
      // Map Oracle object format with uppercase keys to camelCase
      const farmersData = rawFarmers.map(row => ({
        farmerId: row.FARMER_ID,
        name: row.NAME,
        phone: row.PHONE,
        address: row.ADDRESS,
        regDate: row.REG_DATE,
        status: row.STATUS,
        totalFarms: row.TOTAL_FARMS,
        totalCrops: row.TOTAL_CROPS,
        totalRevenue: row.TOTAL_REVENUE
      }));
      
      setFarmers(farmersData);
    } catch (error) {
      console.error('Error fetching farmers:', error);
      setFarmers([]); // Set empty array on error
    }
  };

  const fetchAlertHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.severity) params.append('severity', filter.severity);
      if (filter.farmer_id) params.append('farmer_id', filter.farmer_id);

      const response = await api.get(`/admin/alerts/history?${params.toString()}`);
      setAlertHistory(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alert history:', error);
      setAlertHistory([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/alerts/stats');
      setStats(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats([]); // Set empty array on error
    }
  };

  const handleFarmerSelection = (farmerId) => {
    setSelectedFarmers(prev => {
      if (prev.includes(farmerId)) {
        return prev.filter(id => id !== farmerId);
      } else {
        return [...prev, farmerId];
      }
    });
  };

  const selectAllFarmers = () => {
    if (selectedFarmers.length === farmers.length) {
      setSelectedFarmers([]);
    } else {
      setSelectedFarmers(farmers.map(f => f.farmerId || f.farmer_id));
    }
  };

  const handleSendAlert = async (e) => {
    e.preventDefault();
    
    if (selectedFarmers.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one farmer' });
      return;
    }

    if (!alertForm.message.trim()) {
      setMessage({ type: 'error', text: 'Please enter a message' });
      return;
    }

    setSending(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admin/alerts/send', {
        farmerIds: selectedFarmers,
        title: alertForm.title,
        message: alertForm.message,
        alertType: alertForm.alertType,
        severity: alertForm.severity
      });

      setMessage({ 
        type: 'success', 
        text: `Notification sent to ${response.data.totalSent} farmer(s)` 
      });
      
      setAlertForm({ title: '', message: '', alertType: 'MANUAL', severity: 'INFO' });
      setSelectedFarmers([]);
      fetchAlertHistory();
      fetchStats();
    } catch (error) {
      console.error('Error sending alert:', error);
      setMessage({ type: 'error', text: 'Failed to send alert' });
    } finally {
      setSending(false);
    }
  };

  const handleBroadcast = async () => {
    if (!alertForm.message.trim()) {
      setMessage({ type: 'error', text: 'Please enter a message' });
      return;
    }

    if (!window.confirm('Send this alert to ALL active farmers?')) {
      return;
    }

    setSending(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/admin/alerts/broadcast', {
        title: alertForm.title,
        message: alertForm.message,
        alertType: 'BROADCAST',
        severity: alertForm.severity
      });

      setMessage({ 
        type: 'success', 
        text: `Broadcast sent to ${response.data.totalSent} farmer(s)` 
      });
      
      setAlertForm({ title: '', message: '', alertType: 'MANUAL', severity: 'INFO' });
      fetchAlertHistory();
      fetchStats();
    } catch (error) {
      console.error('Error broadcasting alert:', error);
      setMessage({ type: 'error', text: 'Failed to broadcast alert' });
    } finally {
      setSending(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Notification Management</h1>
        <p className="text-gray-600 mb-6">
          Send important notifications to farmers about weather, fertilizer use, and other farming advisories.
        </p>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Alert Statistics */}
        {stats && Array.isArray(stats) && stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {stats.slice(0, 4).map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.alertType}</h3>
                <p className="text-2xl font-bold text-gray-800">{stat.count}</p>
                <div className="mt-2 text-xs text-gray-500">
                  <span className="mr-2">✅ {stat.sent} sent</span>
                  <span>❌ {stat.failed} failed</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Send Alert Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Send Notification to Farmers</h2>
            
            <form onSubmit={handleSendAlert} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Title
                </label>
                <input
                  type="text"
                  value={alertForm.title}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="Enter notification title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Message
                </label>
                <textarea
                  value={alertForm.message}
                  onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  placeholder="Enter notification message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Type
                  </label>
                  <select
                    value={alertForm.alertType}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, alertType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="INFO">General Info</option>
                    <option value="WEATHER">Weather Update</option>
                    <option value="FERTILIZER">Fertilizer Advisory</option>
                    <option value="ADVISORY">Advisory</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={alertForm.severity}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, severity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : `Send to ${selectedFarmers.length} Selected`}
                </button>
                <button
                  type="button"
                  onClick={handleBroadcast}
                  disabled={sending}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Broadcast to All
                </button>
              </div>
            </form>
          </div>

          {/* Farmer Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Select Farmers</h2>
              <button
                onClick={selectAllFarmers}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {selectedFarmers.length === farmers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {farmers && farmers.length > 0 ? (
                farmers.map((farmer, index) => (
                  <label
                    key={`farmer-${farmer.farmerId}-${index}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFarmers.includes(farmer.farmerId)}
                      onChange={() => handleFarmerSelection(farmer.farmerId)}
                      className="w-4 h-4 text-green-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{farmer.name}</p>
                      <p className="text-sm text-gray-600">{farmer.phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      farmer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {farmer.status}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-center py-8 text-gray-500">
                  No farmers found. {farmers.length === 0 ? 'Please add farmers to the system.' : 'Loading...'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notification History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Notification History</h2>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filter.severity}
                onChange={(e) => setFilter(prev => ({ ...prev, severity: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Severities</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </select>

              <select
                value={filter.status}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8 text-gray-600">Loading...</p>
          ) : alertHistory.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No alerts found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Farmer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Farm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Message</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {alertHistory.map(alert => (
                    <tr key={alert.alertId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{alert.farmerName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{alert.farmName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{alert.alertType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {alert.message}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.status === 'SENT' ? 'bg-green-100 text-green-800' :
                          alert.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(alert.createdDate).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertManagement;

