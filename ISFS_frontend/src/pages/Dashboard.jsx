import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

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
    addRoute: "/add-labour",
    color: "bg-blue-500"
  },
  {
    name: "Fertilizer Tracking",
    description: "Record fertilizer applications and effectiveness ratings.",
    icon: "🧪",
    viewRoute: "/fertilizers",
    addRoute: "/add-fertilizer",
    color: "bg-purple-500"
  },
  {
    name: "Pest & Disease Control",
    description: "Monitor crop health and track treatment applications.",
    icon: "🛡️",
    viewRoute: "/pest-disease",
    addRoute: "/add-pest-disease",
    color: "bg-red-500"
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
    name: "Irrigation System",
    description: "Monitor water usage and irrigation schedules.",
    icon: "💧",
    viewRoute: "/irrigation",
    addRoute: "/add-irrigation",
    color: "bg-cyan-500"
  },
  {
    name: "Sales & Revenue",
    description: "Track crop sales, revenue, and financial analytics.",
    icon: "💰",
    viewRoute: "/sales",
    addRoute: "/add-sale",
    color: "bg-emerald-500"
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [farmerStats, setFarmerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if logged in and fetch farmer statistics
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first!");
      navigate("/login");
      return;
    }

    fetchFarmerStats();
  }, [navigate]);

  const fetchFarmerStats = async () => {
    try {
      const response = await axios.get("/farmers/dashboard-stats");
      setFarmerStats(response.data);
    } catch (err) {
      console.error("Error fetching farmer stats:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
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
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                📊 Analytics
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Overview</h2>
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
                subtitle="Average crop yield"
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/add-crop")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🌱</div>
              <div className="font-semibold">Add New Crop</div>
              <div className="text-sm opacity-90">Record crop planting</div>
            </button>
            <button
              onClick={() => navigate("/add-sale")}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Record Sale</div>
              <div className="text-sm opacity-90">Track crop sales</div>
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">View Analytics</div>
              <div className="text-sm opacity-90">Farm performance</div>
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Farm Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

        {/* DBMS Features Showcase */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced DBMS Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Complex Queries</h3>
              <p className="text-sm text-gray-600 mb-3">Advanced JOIN operations for comprehensive data analysis</p>
              <button
                onClick={() => navigate("/query-builder")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Try Query Builder →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Database Views</h3>
              <p className="text-sm text-gray-600 mb-3">Pre-built views for farm performance analytics</p>
              <button
                onClick={() => navigate("/database-views")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Analytics →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚙️ Stored Procedures</h3>
              <p className="text-sm text-gray-600 mb-3">Automated calculations for profitability and yield predictions</p>
              <button
                onClick={() => navigate("/automated-reports")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Generate Reports →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Triggers</h3>
              <p className="text-sm text-gray-600 mb-3">Automated updates for farm statistics and alerts</p>
              <button
                onClick={() => navigate("/notifications")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Alerts →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">💾 Transaction Control</h3>
              <p className="text-sm text-gray-600 mb-3">Data consistency with COMMIT and ROLLBACK operations</p>
              <button
                onClick={() => navigate("/transaction-log")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                View Logs →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔐 Data Security</h3>
              <p className="text-sm text-gray-600 mb-3">Secure data access with role-based permissions</p>
              <button
                onClick={() => navigate("/security-settings")}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                Security Info →
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
    </div>
  );
}