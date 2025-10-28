import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import api from "../api/axios";

const featureCards = [
  {
    name: "Farm Management",
    description: "Manage your farms, track soil analysis, and monitor weather data.",
    icon: "🏡",
    viewRoute: "/farms",
    addRoute: "/add-farm",
    color: "bg-green-500"
  },
  {
    name: "Crop Management",
    description: "Track crop lifecycle, growth stages, and yield predictions.",
    icon: "🌾",
    viewRoute: "/crops",
    addRoute: "/add-crop",
    color: "bg-yellow-500"
  },
  {
    name: "Labour Management",
    description: "Monitor work hours, skills, and wage calculations.",
    icon: "👥",
    viewRoute: "/labours",
    addRoute: "/add-labours",
    color: "bg-blue-500"
  },
  {
    name: "Labour Work & Attendance",
    description: "Track daily attendance, work hours, and manage payments.",
    icon: "📋",
    viewRoute: "/labour-work",
    addRoute: "/add-labour-work",
    color: "bg-teal-500"
  },
  {
    name: "Fertilizer Tracking",
    description: "Record fertilizer applications and effectiveness ratings.",
    icon: "🧪",
    viewRoute: "/fertilizers",
    addRoute: "/add-fertilizers",
    color: "bg-purple-500"
  },
  {
    name: "Equipment Management",
    description: "Track equipment inventory and maintenance schedules.",
    icon: "🔧",
    viewRoute: "/equipment",
    addRoute: "/add-equipment",
    color: "bg-gray-500"
  },
  {
    name: "Sales & Revenue",
    description: "Track crop sales, revenue, and financial analytics.",
    icon: "💰",
    viewRoute: "/sales",
    addRoute: "/add-sales",
    color: "bg-emerald-500"
  }
];

// DBMS Feature visualization components
const ComplexQueryViz = () => (
  <div className="space-y-2">
    <div className="bg-blue-50 p-3 rounded text-xs font-mono">
      <div className="text-blue-700">SELECT farms.name, crops.crop_type, sales.revenue</div>
      <div className="text-blue-700">FROM farms</div>
      <div className="text-blue-600">JOIN crops ON farms.farm_id = crops.farm_id</div>
      <div className="text-blue-600">JOIN sales ON crops.crop_id = sales.crop_id</div>
      <div className="text-blue-500">WHERE sales.sale_date &gt; '2024-01-01'</div>
    </div>
    <div className="flex items-center justify-around text-xs">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg mb-1">🏡</div>
        <div className="text-gray-600">Farms</div>
      </div>
      <div className="text-2xl text-gray-400">⟷</div>
      <div className="text-center">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-lg mb-1">🌾</div>
        <div className="text-gray-600">Crops</div>
      </div>
      <div className="text-2xl text-gray-400">⟷</div>
      <div className="text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-lg mb-1">💰</div>
        <div className="text-gray-600">Sales</div>
      </div>
    </div>
  </div>
);

const DatabaseViewViz = () => (
  <div className="space-y-2">
    <div className="bg-purple-50 p-2 rounded">
      <div className="text-xs font-semibold text-purple-900 mb-2">VIEW: farm_performance</div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs bg-white p-1.5 rounded">
          <span className="text-gray-600">Farm A</span>
          <span className="text-green-600 font-semibold">$45,200</span>
        </div>
        <div className="flex justify-between text-xs bg-white p-1.5 rounded">
          <span className="text-gray-600">Farm B</span>
          <span className="text-green-600 font-semibold">$38,750</span>
        </div>
        <div className="flex justify-between text-xs bg-white p-1.5 rounded">
          <span className="text-gray-600">Farm C</span>
          <span className="text-green-600 font-semibold">$52,900</span>
        </div>
      </div>
    </div>
    <div className="text-xs text-gray-500 text-center">Auto-aggregated from multiple tables</div>
  </div>
);

const StoredProcedureViz = () => (
  <div className="space-y-2">
    <div className="bg-orange-50 p-2 rounded">
      <div className="text-xs font-semibold text-orange-900 mb-2">CALL calculate_profitability()</div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
          </div>
          <span className="text-xs text-green-600 font-semibold">75%</span>
        </div>
        <div className="grid grid-cols-3 gap-1 text-xs">
          <div className="bg-white p-1 rounded text-center">
            <div className="text-gray-500">Revenue</div>
            <div className="font-semibold text-green-600">$50K</div>
          </div>
          <div className="bg-white p-1 rounded text-center">
            <div className="text-gray-500">Costs</div>
            <div className="font-semibold text-red-600">$12.5K</div>
          </div>
          <div className="bg-white p-1 rounded text-center">
            <div className="text-gray-500">Profit</div>
            <div className="font-semibold text-blue-600">$37.5K</div>
          </div>
        </div>
      </div>
    </div>
    <div className="text-xs text-gray-500 text-center">Automated calculations</div>
  </div>
);

const TriggerViz = () => (
  <div className="space-y-2">
    <div className="space-y-2">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-2 rounded">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <div className="text-xs">
            <div className="font-semibold text-yellow-900">ON INSERT Sale</div>
            <div className="text-yellow-700">→ Update farm total_revenue</div>
          </div>
        </div>
      </div>
      <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <div className="text-xs">
            <div className="font-semibold text-red-900">ON UPDATE Crop</div>
            <div className="text-red-700">→ Log activity + Send alert</div>
          </div>
        </div>
      </div>
      <div className="bg-green-50 border-l-4 border-green-500 p-2 rounded">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div className="text-xs">
            <div className="font-semibold text-green-900">ON DELETE Equipment</div>
            <div className="text-green-700">→ Archive maintenance records</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TransactionViz = () => (
  <div className="space-y-2">
    <div className="bg-indigo-50 p-2 rounded text-xs font-mono">
      <div className="text-indigo-700 mb-1">BEGIN TRANSACTION;</div>
      <div className="pl-4 space-y-1">
        <div className="text-indigo-600">INSERT INTO sales VALUES(...);</div>
        <div className="text-indigo-600">UPDATE farm SET revenue = ...;</div>
        <div className="text-indigo-600">UPDATE crop SET status = ...;</div>
      </div>
      <div className="text-indigo-700 mt-1">COMMIT;</div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-green-50 p-2 rounded text-center">
        <div className="text-lg">✅</div>
        <div className="text-xs font-semibold text-green-700">All Success</div>
        <div className="text-xs text-gray-600">Commit</div>
      </div>
      <div className="bg-red-50 p-2 rounded text-center">
        <div className="text-lg">↩️</div>
        <div className="text-xs font-semibold text-red-700">Any Fail</div>
        <div className="text-xs text-gray-600">Rollback</div>
      </div>
    </div>
  </div>
);

const SecurityViz = () => (
  <div className="space-y-2">
    <div className="space-y-2">
      <div className="bg-blue-50 p-2 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <div className="text-xs">
              <div className="font-semibold text-blue-900">Farmer Role</div>
              <div className="text-blue-700">Full CRUD Access</div>
            </div>
          </div>
          <div className="text-green-600 text-xs font-semibold">✓ All</div>
        </div>
      </div>
      <div className="bg-gray-50 p-2 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <div className="text-xs">
              <div className="font-semibold text-gray-900">Labour Role</div>
              <div className="text-gray-700">Read-Only Access</div>
            </div>
          </div>
          <div className="text-orange-600 text-xs font-semibold">✓ View</div>
        </div>
      </div>
      <div className="bg-purple-50 p-2 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👨‍💼</span>
            <div className="text-xs">
              <div className="font-semibold text-purple-900">Admin Role</div>
              <div className="text-purple-700">System Management</div>
            </div>
          </div>
          <div className="text-purple-600 text-xs font-semibold">✓ Full</div>
        </div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [farmerStats, setFarmerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSQLModal, setShowSQLModal] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);

  // Check if logged in and fetch farmer statistics
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    fetchFarmerStats();
    fetchWeatherAlerts();
  }, [navigate]);

  // Handle token expiration/invalid token errors
  const handleAuthError = () => {
    console.log("Auth error detected - clearing local storage and redirecting to login");
    localStorage.removeItem("token");
    localStorage.removeItem("farmerId");
    localStorage.removeItem("farmerName");
    alert("Your session has expired or is invalid. Please log in again.");
    navigate("/login");
  };

  const fetchFarmerStats = async () => {
    try {
      const response = await axios.get("/farmers/dashboard-stats");
      setFarmerStats(response.data);
    } catch (err) {
      console.error("Error fetching farmer stats:", err);
      
      // Check if it's an authentication error
      if (err.response && err.response.status === 401) {
        handleAuthError();
        return;
      }
      
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherAlerts = async () => {
    try {
      const response = await api.get('/weather/alerts?limit=5');
      setWeatherAlerts(response.data);
      const unreadCount = response.data.filter(alert => !alert.isRead).length;
      setUnreadAlertsCount(unreadCount);
    } catch (err) {
      console.debug('Weather alerts not available');
    }
  };

  const farmerName = localStorage.getItem("farmerName");
  const farmerId = localStorage.getItem("farmerId");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("farmerId");
    localStorage.removeItem("farmerName");
    navigate("/");
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold">🌾 Smart Farming Dashboard</h1>
              {farmerName && <p className="text-lg mt-1 opacity-90">Welcome back, {farmerName}!</p>}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/analytics")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Analytics</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Overview */}
        {farmerStats && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Farm Overview</h2>
              <button
                onClick={() => setShowSQLModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                View SQL Queries
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Farms"
                value={farmerStats.total_farms || 0}
                icon="🏡"
                color="#10B981"
                subtitle="Active farm locations"
              />
              <StatCard
                title="Total Crops"
                value={farmerStats.total_crops || 0}
                icon="🌾"
                color="#F59E0B"
                subtitle="Crops planted this season"
              />
              <StatCard
                title="Total Revenue"
                value={`$${farmerStats.total_revenue || 0}`}
                icon="💰"
                color="#059669"
                subtitle="Year-to-date earnings"
              />
              <StatCard
                title="Avg Yield"
                value={`${farmerStats.avg_yield || 0} kg`}
                icon="📈"
                color="#7C3AED"
                subtitle={farmerStats.avg_actual_yield > 0 ? "Actual harvested yield" : "Expected yield"}
              />
            </div>

            {/* Weather Alerts Widget */}
            {weatherAlerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🌤️ Recent Weather Alerts
                    {unreadAlertsCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadAlertsCount} new
                      </span>
                    )}
                  </h3>
                  <button
                    onClick={() => navigate('/weather')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="space-y-2">
                  {weatherAlerts.slice(0, 3).map(alert => (
                    <div
                      key={alert.alertId}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-500' :
                        alert.severity === 'WARNING' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-blue-50 border-blue-500'
                      } ${!alert.isRead ? 'ring-2 ring-offset-2 ring-blue-300' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              {alert.alertType.replace(/_/g, ' ')}
                            </span>
                            {!alert.isRead && (
                              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">NEW</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(alert.createdDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/add-farm")}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white p-4 rounded-lg hover:from-emerald-500 hover:to-emerald-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🏡</div>
              <div className="font-semibold">Add New Farm</div>
              <div className="text-sm opacity-90">Register new farm</div>
            </button>
            <button
              onClick={() => navigate("/add-crop")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🌱</div>
              <div className="font-semibold">Add New Crop</div>
              <div className="text-sm opacity-90">Record crop planting</div>
            </button>
            <button
              onClick={() => navigate("/weather")}
              className="bg-gradient-to-r from-sky-400 to-sky-500 text-white p-4 rounded-lg hover:from-sky-500 hover:to-sky-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🌤️</div>
              <div className="font-semibold">Weather Dashboard</div>
              <div className="text-sm opacity-90">View weather & alerts</div>
            </button>
            <button
              onClick={() => navigate("/add-sales")}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Record Sale</div>
              <div className="text-sm opacity-90">Track crop sales</div>
            </button>
            <button
              onClick={() => navigate("/financial-analytics")}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">💵</div>
              <div className="font-semibold">Financial Analytics</div>
              <div className="text-sm opacity-90">Track profits & costs</div>
            </button>
          </div>
        </div>

        {/* New: Farm Insights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/farm-comparison")}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl group-hover:scale-110 transition-transform">🏆</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Farm Performance Comparison</h3>
                  <p className="text-sm text-gray-600">Compare yields and profitability across all your farms</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("/financial-analytics")}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl group-hover:scale-110 transition-transform">💰</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Financial Overview</h3>
                  <p className="text-sm text-gray-600">View investments, costs, profits, and ROI</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <div
                key={card.name}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                      {card.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(card.viewRoute)}
                      className={`flex-1 ${card.color} text-white px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity`}
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(card.addRoute)}
                      className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DBMS Features Showcase with Visualizations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced DBMS Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Complex Queries */}
            <div className="border-2 border-blue-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🔍</div>
                <h3 className="font-bold text-gray-900">Complex Queries</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">JOIN operations across farms, crops, and sales tables</p>
              <ComplexQueryViz />
              <button
                onClick={() => navigate("/database-views")}
                className="mt-3 w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                View Analytics →
              </button>
            </div>

            {/* Database Views */}
            <div className="border-2 border-purple-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">📊</div>
                <h3 className="font-bold text-gray-900">Database Views</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Pre-aggregated views for quick performance insights</p>
              <DatabaseViewViz />
              <button
                onClick={() => navigate("/database-views")}
                className="mt-3 w-full bg-purple-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                View Analytics →
              </button>
            </div>

            {/* Stored Procedures */}
            <div className="border-2 border-orange-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">⚙️</div>
                <h3 className="font-bold text-gray-900">Stored Procedures</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Automated profitability and yield calculations</p>
              <StoredProcedureViz />
              <button
                onClick={() => navigate("/stored-procedures")}
                className="mt-3 w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Execute Procedures →
              </button>
            </div>

            {/* Triggers */}
            <div className="border-2 border-yellow-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🔄</div>
                <h3 className="font-bold text-gray-900">Triggers</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Automated actions on INSERT, UPDATE, DELETE</p>
              <TriggerViz />
              <button
                onClick={() => navigate("/functions")}
                className="mt-3 w-full bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
              >
                View Functions →
              </button>
            </div>

            {/* Transaction Control */}
            <div className="border-2 border-indigo-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">💾</div>
                <h3 className="font-bold text-gray-900">Transaction Control</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">ACID compliance with COMMIT and ROLLBACK</p>
              <TransactionViz />
              <button
                onClick={() => navigate("/database-views")}
                className="mt-3 w-full bg-indigo-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                View Analytics →
              </button>
            </div>

            {/* Data Security */}
            <div className="border-2 border-green-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🔐</div>
                <h3 className="font-bold text-gray-900">Data Security</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">Role-based access control and permissions</p>
              <SecurityViz />
              <button
                onClick={() => navigate("/functions")}
                className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Execute Functions →
              </button>
            </div>

          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Crop planted successfully</p>
                <p className="text-xs text-gray-500">Wheat planted in North Field - 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sale recorded</p>
                <p className="text-xs text-gray-500">500kg Rice sold for $1,250 - 1 day ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fertilizer applied</p>
                <p className="text-xs text-gray-500">NPK fertilizer applied to South Garden - 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SQL Query Modal */}
      {showSQLModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSQLModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Farm Overview SQL Queries</h3>
                  <p className="text-sm opacity-90 mt-1">Database queries executed to fetch dashboard statistics</p>
                </div>
                <button
                  onClick={() => setShowSQLModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Query 1: Total Farms */}
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏡</span>
                  <h4 className="font-bold text-gray-900">Total Farms Query</h4>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{`SELECT COUNT(*) as total_farms
FROM FARM
WHERE farmer_id = :farmer_id`}
                </pre>
                <div className="mt-3 bg-white p-3 rounded">
                  <span className="text-sm font-semibold text-gray-700">Result: </span>
                  <span className="text-lg font-bold text-green-600">{farmerStats?.total_farms || 0} farms</span>
                </div>
              </div>

              {/* Query 2: Total Crops */}
              <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌾</span>
                  <h4 className="font-bold text-gray-900">Total Crops Query</h4>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{`SELECT COUNT(c.crop_id) as total_crops
FROM CROP c
JOIN FARM f ON c.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id`}
                </pre>
                <div className="mt-3 bg-white p-3 rounded">
                  <span className="text-sm font-semibold text-gray-700">Result: </span>
                  <span className="text-lg font-bold text-yellow-600">{farmerStats?.total_crops || 0} crops</span>
                </div>
              </div>

              {/* Query 3: Total Revenue */}
              <div className="border-2 border-emerald-200 rounded-lg p-4 bg-emerald-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💰</span>
                  <h4 className="font-bold text-gray-900">Total Revenue Query</h4>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{`SELECT NVL(SUM(s.total_amount), 0) as total_revenue
FROM SALES s
JOIN FARM f ON s.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id`}
                </pre>
                <div className="mt-3 bg-white p-3 rounded">
                  <span className="text-sm font-semibold text-gray-700">Result: </span>
                  <span className="text-lg font-bold text-emerald-600">${farmerStats?.total_revenue || 0}</span>
                </div>
              </div>

              {/* Query 4: Average Yield */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📈</span>
                  <h4 className="font-bold text-gray-900">Average Yield Query</h4>
                </div>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{`SELECT 
  NVL(AVG(c.expected_yield), 0) as avg_expected_yield,
  NVL(AVG(c.actual_yield), 0) as avg_actual_yield
FROM CROP c
JOIN FARM f ON c.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id`}
                </pre>
                <div className="mt-3 bg-white p-3 rounded">
                  <span className="text-sm font-semibold text-gray-700">Result: </span>
                  <span className="text-lg font-bold text-purple-600">{farmerStats?.avg_yield || 0} kg</span>
                </div>
              </div>

              {/* Query Execution Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Query Execution Details</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>All queries use JOINs to fetch related data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>NVL function handles NULL values gracefully</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Filtered by farmer_id for data security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Aggregate functions (COUNT, SUM, AVG) for statistics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}