import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Farmers() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/farmers");
      setFarmers(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching farmers:", err);
      setError("Failed to load farmers. Please try again.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">👨‍🌾 Farmer Management</h1>
              <p className="text-lg mt-1 opacity-90">Manage registered farmers and their information</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-farmer")}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                ➕ Add Farmer
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Registered Farmers</h2>
            <button
              onClick={fetchFarmers}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading && farmers.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading farmers...</p>
            </div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No farmers registered yet.</p>
              <button
                onClick={() => navigate("/add-farmer")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add First Farmer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border">ID</th>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Phone</th>
                    <th className="p-3 border">Email</th>
                    <th className="p-3 border">Address</th>
                    <th className="p-3 border">Registration Date</th>
                    <th className="p-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((farmer, index) => {
                    // Handle both object and array formats
                    const id = farmer.FARMER_ID || farmer.farmer_id || farmer[0];
                    const name = farmer.NAME || farmer.name || farmer[1];
                    const phone = farmer.PHONE || farmer.phone || farmer[2];
                    const email = farmer.EMAIL || farmer.email || farmer[3];
                    const address = farmer.ADDRESS || farmer.address || farmer[4];
                    const regDate = farmer.REG_DATE || farmer.reg_date || farmer[5];
                    const status = farmer.STATUS || farmer.status || farmer[6];

                    return (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{id}</td>
                        <td className="p-3 border font-semibold">{name}</td>
                        <td className="p-3 border">{phone || '-'}</td>
                        <td className="p-3 border text-sm">{email || '-'}</td>
                        <td className="p-3 border text-sm">{address || '-'}</td>
                        <td className="p-3 border text-sm">
                          {regDate ? new Date(regDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Total Farmers: <span className="font-semibold">{farmers.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
