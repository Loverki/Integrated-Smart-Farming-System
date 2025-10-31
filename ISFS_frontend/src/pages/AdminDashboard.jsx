import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

const adminFeatures = [
  {
    name: "Farmer Management",
    description: "Manage farmers, view registrations, and monitor farmer activities.",
    icon: "👨‍🌾",
    route: "/admin/farmers",
    color: "bg-green-500",
    implemented: true
  },
  {
    name: "System Analytics",
    description: "View system-wide analytics, performance metrics, and trends.",
    icon: "📊",
    route: "/admin/analytics",
    color: "bg-blue-500",
    implemented: true
  },
  {
    name: "Weather Alert Management",
    description: "Send weather alerts, broadcast messages, and view alert history.",
    icon: "🌤️",
    route: "/admin/alerts",
    color: "bg-sky-500",
    implemented: true
  },
  {
    name: "Database Management",
    description: "Execute complex queries, manage views, and monitor database performance.",
    icon: "🗄️",
    route: "/admin/database",
    color: "bg-purple-500",
    implemented: true
  },
  {
    name: "User Management",
    description: "Manage admin users, roles, and permissions (SUPER_ADMIN only).",
    icon: "👥",
    route: "/admin/users",
    color: "bg-indigo-500",
    implemented: true,
    requiresSuperAdmin: true
  },
  {
    name: "Sequence Management",
    description: "Reset and synchronize database sequences with current data.",
    icon: "🔢",
    route: "/admin/sequences",
    color: "bg-orange-500",
    implemented: true
  },
  {
    name: "Sensor Monitoring",
    description: "Monitor sensor readings, view alerts, and track critical thresholds.",
    icon: "📡",
    route: "/admin/sensors",
    color: "bg-cyan-500",
    implemented: true
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      alert("Please log in as admin first!");
      navigate("/admin-login");
      return;
    }

    fetchAdminStats();
  }, [navigate]);

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get("/admin/stats");
      setAdminStats(response.data);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError("Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const adminName = localStorage.getItem("adminName");
  const adminRole = localStorage.getItem("adminRole");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    localStorage.removeItem("adminRole");
    navigate("/");
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🛠️ Admin Dashboard</h1>
              <p className="text-lg mt-1 opacity-90">
                Welcome back, {adminName}! ({adminRole})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/admin/analytics")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                📊 System Analytics
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

        {/* System Overview */}
        {adminStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatCard
                title="Total Farmers"
                value={adminStats.total_farmers || 0}
                icon="👨‍🌾"
                color="#10B981"
                subtitle="Registered farmers"
              />
              <StatCard
                title="Total Farms"
                value={adminStats.total_farms || 0}
                icon="🏡"
                color="#3B82F6"
                subtitle="Active farm locations"
              />
              <StatCard
                title="Total Crops"
                value={adminStats.total_crops || 0}
                icon="🌾"
                color="#F59E0B"
                subtitle="Crops in system"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${(adminStats.total_revenue || 0).toLocaleString('en-IN')}`}
                icon="💰"
                color="#059669"
                subtitle="System-wide revenue"
              />
              <StatCard
                title="Active Farmers"
                value={adminStats.active_farmers || 0}
                icon="✅"
                color="#7C3AED"
                subtitle="Currently active"
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/analytics")}
              className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">System Analytics</div>
              <div className="text-sm opacity-90">View comprehensive analytics</div>
            </button>
            <button
              onClick={() => navigate("/admin/farmers")}
              className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg hover:from-green-500 hover:to-green-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">👨‍🌾</div>
              <div className="font-semibold">Manage Farmers</div>
              <div className="text-sm opacity-90">View and manage farmers</div>
            </button>
            <button
              onClick={() => navigate("/admin/alerts")}
              className="bg-gradient-to-r from-sky-400 to-sky-500 text-white p-4 rounded-lg hover:from-sky-500 hover:to-sky-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🌤️</div>
              <div className="font-semibold">Weather Alerts</div>
              <div className="text-sm opacity-90">Send alerts & broadcast</div>
            </button>
            <button
              onClick={() => navigate("/admin/database")}
              className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-lg hover:from-purple-500 hover:to-purple-600 transition-all transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🗄️</div>
              <div className="font-semibold">Database Tools</div>
              <div className="text-sm opacity-90">Execute queries and views</div>
            </button>
          </div>
        </div>

        {/* Admin Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Administrative Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminFeatures.map((feature) => {
              // Hide SUPER_ADMIN only features for non-super admins
              if (feature.requiresSuperAdmin && adminRole !== 'SUPER_ADMIN') {
                return null;
              }
              
              return (
                <div
                  key={feature.name}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
                        {feature.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                    <button
                      onClick={() => navigate(feature.route)}
                      className={`w-full ${feature.color} text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                    >
                      <span>Access {feature.name}</span>
                      {feature.implemented && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DBMS Features Showcase */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced DBMS Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Query Execution</h3>
              <p className="text-sm text-gray-600 mb-3">Execute complex SQL queries with real-time results</p>
              <button
                onClick={() => navigate("/admin/query-executor")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Open Query Executor →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📊 Database Views</h3>
              <p className="text-sm text-gray-600 mb-3">Access pre-built views for analytics and reporting</p>
              <button
                onClick={() => navigate("/admin/database-views")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Database Views →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">⚙️ Stored Procedures</h3>
              <p className="text-sm text-gray-600 mb-3">Execute stored procedures for complex operations</p>
              <button
                onClick={() => navigate("/admin/stored-procedures")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Execute Procedures →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔄 Trigger Management</h3>
              <p className="text-sm text-gray-600 mb-3">Monitor and manage database triggers</p>
              <button
                onClick={() => navigate("/admin/triggers")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Manage Triggers →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">💾 Transaction Logs</h3>
              <p className="text-sm text-gray-600 mb-3">View transaction logs and rollback operations</p>
              <button
                onClick={() => navigate("/admin/transaction-logs")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Logs →
              </button>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">🔐 Security Management</h3>
              <p className="text-sm text-gray-600 mb-3">Manage user permissions and database security</p>
              <button
                onClick={() => navigate("/admin/security")}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Security Settings →
              </button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Database</h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Server</h3>
              <p className="text-sm text-green-600">Running</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Security</h3>
              <p className="text-sm text-green-600">Secured</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Backup</h3>
              <p className="text-sm text-green-600">Updated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
