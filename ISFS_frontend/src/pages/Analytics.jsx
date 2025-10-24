import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

// Revenue Trends Chart Component
const RevenueTrendsChart = ({ monthlyRevenue = [] }) => {
  // Use real monthly revenue data from backend
  const hasData = monthlyRevenue && monthlyRevenue.length > 0;
  
  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm">No sales data available for the last 6 months</p>
        </div>
      </div>
    );
  }

  const data = monthlyRevenue.map(item => ({
    month: item.MONTH_NAME || item.month_name,
    revenue: parseFloat(item.REVENUE || item.revenue || 0)
  }));
  
  const maxValue = Math.max(...data.map(d => d.revenue), 1);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / data.length;
  const latestRevenue = data[data.length - 1]?.revenue || 0;
  const previousRevenue = data[data.length - 2]?.revenue || 0;
  const growthPercent = previousRevenue > 0 
    ? (((latestRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)
    : 0;
  
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between h-48 px-2">
        {data.map((item, index) => {
          const height = (item.revenue / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1 group">
              <div className="relative w-full flex items-end justify-center h-full">
                <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-green-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap z-10">
                  ₹{item.revenue.toLocaleString()}
                </div>
                <div 
                  className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all duration-500 hover:from-green-700 hover:to-green-500 cursor-pointer shadow-lg"
                  style={{ height: `${Math.max(height, 2)}%` }}
                ></div>
              </div>
              <p className="text-xs font-semibold text-gray-600 mt-2">{item.month}</p>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
          <span className="text-sm text-gray-600">Avg: ₹{avgRevenue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className={`w-5 h-5 ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={growthPercent >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
          </svg>
          <span className={`text-sm font-bold ${growthPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growthPercent >= 0 ? '+' : ''}{growthPercent}% from last month
          </span>
        </div>
      </div>
    </div>
  );
};

// Crop Performance Chart Component
const CropPerformanceChart = ({ cropPerformance = [], crops = 0, area = 0 }) => {
  // Use real crop performance data from backend
  const hasData = cropPerformance && cropPerformance.length > 0;
  
  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🌾</div>
          <p className="text-sm">No crop performance data available</p>
        </div>
      </div>
    );
  }

  // Map crop icons
  const getCropIcon = (cropName) => {
    const name = cropName?.toLowerCase() || '';
    if (name.includes('wheat')) return '🌾';
    if (name.includes('rice')) return '🌱';
    if (name.includes('corn') || name.includes('maize')) return '🌽';
    if (name.includes('cotton')) return '☁️';
    if (name.includes('tomato')) return '🍅';
    if (name.includes('potato')) return '🥔';
    if (name.includes('onion')) return '🧅';
    if (name.includes('carrot')) return '🥕';
    return '🌿';
  };

  const getCropColor = (index) => {
    const colors = ['bg-yellow-500', 'bg-green-500', 'bg-orange-500', 'bg-blue-500'];
    return colors[index % colors.length];
  };

  const cropData = cropPerformance.map((item, index) => ({
    name: item.CROP_NAME || item.crop_name,
    count: parseInt(item.CROP_COUNT || item.crop_count || 0),
    performance: parseInt(item.PERFORMANCE_PERCENTAGE || item.performance_percentage || 0),
    expectedYield: parseFloat(item.AVG_EXPECTED_YIELD || item.avg_expected_yield || 0),
    actualYield: parseFloat(item.AVG_ACTUAL_YIELD || item.avg_actual_yield || 0),
    color: getCropColor(index),
    icon: getCropIcon(item.CROP_NAME || item.crop_name)
  }));

  const avgPerformance = cropData.length > 0
    ? Math.round(cropData.reduce((sum, c) => sum + c.performance, 0) / cropData.length)
    : 0;

  return (
    <div className="space-y-4">
      {cropData.map((crop, index) => (
        <div key={index} className="group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{crop.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{crop.name}</span>
              <span className="text-xs text-gray-500">({crop.count} {crop.count === 1 ? 'plot' : 'plots'})</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">{crop.performance}%</span>
              {crop.actualYield > 0 && (
                <div className="text-xs text-gray-500">
                  {crop.actualYield.toFixed(0)}/{crop.expectedYield.toFixed(0)} kg
                </div>
              )}
            </div>
          </div>
          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${crop.color} rounded-full transition-all duration-1000 ease-out shadow-md relative`}
              style={{ width: `${Math.min(crop.performance, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
        </div>
      ))}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{crops}</div>
          <div className="text-xs text-gray-600 mt-1">Active Crops</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{area}</div>
          <div className="text-xs text-gray-600 mt-1">Total Acres</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{avgPerformance}%</div>
          <div className="text-xs text-gray-600 mt-1">Avg Performance</div>
        </div>
      </div>
    </div>
  );
};

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/farmers/analytics");
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
              <p className="text-lg mt-1 opacity-90">Advanced farm analytics and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-green-800 hover:bg-green-900 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Farms</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.total_farms || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">₹{analytics?.total_revenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Crops</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.total_crops || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Area</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics?.total_area || 0} acres</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📈</span>
                Revenue Trends
              </h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                6 Months
              </span>
            </div>
            <RevenueTrendsChart monthlyRevenue={analytics?.monthly_revenue || []} />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🌾</span>
                Crop Performance
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                Active
              </span>
            </div>
            <CropPerformanceChart 
              cropPerformance={analytics?.crop_performance || []}
              crops={analytics?.total_crops || 0} 
              area={analytics?.total_area || 0} 
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Recent Activity
          </h3>
          
          {analytics?.recent_activities && analytics.recent_activities.length > 0 ? (
            <div className="space-y-3">
              {analytics.recent_activities.map((activity, index) => {
                const activityType = activity.ACTIVITY_TYPE || activity.activity_type;
                const itemName = activity.ITEM_NAME || activity.item_name;
                const farmName = activity.FARM_NAME || activity.farm_name;
                const activityDate = activity.ACTIVITY_DATE || activity.activity_date;
                const details = activity.DETAILS || activity.details;
                
                // Determine color and icon based on activity type
                const getActivityStyle = (type) => {
                  switch(type) {
                    case 'crop':
                      return {
                        bg: 'bg-green-50',
                        dot: 'bg-green-500',
                        icon: '🌱',
                        title: 'Crop planted successfully',
                        color: 'text-green-700'
                      };
                    case 'sale':
                      return {
                        bg: 'bg-blue-50',
                        dot: 'bg-blue-500',
                        icon: '💰',
                        title: 'Sale recorded',
                        color: 'text-blue-700'
                      };
                    case 'fertilizer':
                      return {
                        bg: 'bg-yellow-50',
                        dot: 'bg-yellow-500',
                        icon: '🧪',
                        title: 'Fertilizer applied',
                        color: 'text-yellow-700'
                      };
                    default:
                      return {
                        bg: 'bg-gray-50',
                        dot: 'bg-gray-500',
                        icon: '📝',
                        title: 'Activity',
                        color: 'text-gray-700'
                      };
                  }
                };

                const style = getActivityStyle(activityType);
                
                // Calculate time ago
                const getTimeAgo = (date) => {
                  if (!date) return '';
                  const now = new Date();
                  const actDate = new Date(date);
                  const diffMs = now - actDate;
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMinutes = Math.floor(diffMs / (1000 * 60));
                  
                  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
                  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                  return actDate.toLocaleDateString();
                };

                return (
                  <div key={index} className={`flex items-start p-4 ${style.bg} rounded-lg hover:shadow-md transition-shadow`}>
                    <div className={`w-3 h-3 ${style.dot} rounded-full mt-1.5 mr-4 flex-shrink-0`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{style.icon}</span>
                        <p className={`font-bold ${style.color}`}>{style.title}</p>
              </div>
                      <p className="text-sm text-gray-700 font-medium">
                        {itemName} {activityType === 'crop' ? 'planted in' : activityType === 'sale' ? 'sold to' : 'applied to'} {farmName}
                      </p>
                      {details && activityType !== 'crop' && (
                        <p className="text-xs text-gray-600 mt-1">{details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activityDate)}</p>
              </div>
            </div>
                );
              })}
              </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-sm">No recent activities to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
