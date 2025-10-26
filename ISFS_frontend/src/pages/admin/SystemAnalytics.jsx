import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

export default function SystemAnalytics() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState(null);
  const [revenueData, setRevenueData] = useState({ monthly_trend: [], crop_revenue: [] });
  const [cropsData, setCropsData] = useState({ distribution: [], performance: [] });
  const [topFarmers, setTopFarmers] = useState([]);
  const [sortBy, setSortBy] = useState('revenue');

  useEffect(() => {
    fetchAllAnalytics();
  }, [sortBy]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, revenueRes, cropsRes, topFarmersRes] = await Promise.all([
        axios.get("/admin/analytics/overview"),
        axios.get("/admin/analytics/revenue"),
        axios.get("/admin/analytics/crops"),
        axios.get(`/admin/analytics/top-farmers?sortBy=${sortBy}&limit=10`)
      ]);

      setOverview(overviewRes.data);
      setRevenueData(revenueRes.data);
      setCropsData(cropsRes.data);
      setTopFarmers(topFarmersRes.data);
      setError("");
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">📊 System Analytics</h1>
              <p className="text-lg mt-1 opacity-90">System-wide performance metrics</p>
            </div>
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Overview Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.TOTAL_FARMERS}</p>
                </div>
                <div className="text-3xl">👨‍🌾</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Farms</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.TOTAL_FARMS}</p>
                </div>
                <div className="text-3xl">🏡</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Crops</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.TOTAL_CROPS}</p>
                </div>
                <div className="text-3xl">🌾</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${overview.TOTAL_REVENUE}</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Labours</p>
                  <p className="text-2xl font-bold text-gray-900">{overview.TOTAL_LABOURS}</p>
                </div>
                <div className="text-3xl">👷</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fertilizer Cost</p>
                  <p className="text-2xl font-bold text-gray-900">${overview.TOTAL_FERTILIZER_COST}</p>
                </div>
                <div className="text-3xl">🧪</div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Trends */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Monthly Revenue Trend</h2>
            <button
              onClick={() => exportToCSV(revenueData.monthly_trend, 'revenue_trend')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
          {revenueData.monthly_trend.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Count</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.monthly_trend.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.MONTH}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${item.REVENUE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.SALES_COUNT}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No revenue data available</p>
          )}
        </div>

        {/* Revenue by Crop */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Revenue by Crop Type</h2>
            <button
              onClick={() => exportToCSV(revenueData.crop_revenue, 'crop_revenue')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
          {revenueData.crop_revenue.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {revenueData.crop_revenue.map((crop, idx) => (
                <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{crop.CROP_NAME}</p>
                      <p className="text-xl font-bold text-green-600">${crop.TOTAL_REVENUE}</p>
                      <p className="text-xs text-gray-500">{crop.SALES_COUNT} sales</p>
                    </div>
                    <div className="text-2xl">🌾</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No crop revenue data available</p>
          )}
        </div>

        {/* Crop Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Crop Distribution</h2>
            <button
              onClick={() => exportToCSV(cropsData.distribution, 'crop_distribution')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
          {cropsData.distribution.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Yield</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual Yield</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cropsData.distribution.map((crop, idx) => (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{crop.CROP_NAME}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{crop.COUNT}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{crop.TOTAL_EXPECTED_YIELD} kg</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{crop.TOTAL_ACTUAL_YIELD} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No crop data available</p>
          )}
        </div>

        {/* Top Farmers Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">🏆 Top Farmers Leaderboard</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="farms">Sort by Farms</option>
              <option value="crops">Sort by Crops</option>
              <option value="yield">Sort by Yield</option>
            </select>
          </div>
          {topFarmers.length > 0 ? (
            <div className="space-y-3">
              {topFarmers.map((farmer, idx) => (
                <div key={farmer.FARMER_ID} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg hover:shadow-md transition-shadow">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    idx === 0 ? 'bg-yellow-400 text-white' :
                    idx === 1 ? 'bg-gray-300 text-white' :
                    idx === 2 ? 'bg-orange-400 text-white' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{farmer.NAME}</p>
                    <div className="flex gap-4 text-xs text-gray-600 mt-1">
                      <span>🏡 {farmer.TOTAL_FARMS} farms</span>
                      <span>🌾 {farmer.TOTAL_CROPS} crops</span>
                      <span>💰 ${farmer.TOTAL_REVENUE}</span>
                      <span>📊 {farmer.TOTAL_YIELD} kg yield</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No farmers data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

