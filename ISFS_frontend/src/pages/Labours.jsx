import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Labours() {
  const navigate = useNavigate();
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLabours();
  }, []);

  const fetchLabours = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/labours");
      setLabours(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching labours:", err);
      setError("Failed to load labours. Please try again.");
      // Handle 401 errors by redirecting to login
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
              <h1 className="text-3xl font-bold">🧑‍🌾 Labour Management</h1>
              <p className="text-lg mt-1 opacity-90">Manage farm labour and track work hours</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-labours")}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                ➕ Add Labour
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
            <h2 className="text-2xl font-bold text-gray-800">All Labour Workers</h2>
            <button
              onClick={fetchLabours}
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

          {loading && labours.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading labours...</p>
            </div>
          ) : labours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No labour workers registered yet.</p>
              <button
                onClick={() => navigate("/add-labours")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add First Labour
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
                    <th className="p-3 border">Skill</th>
                    <th className="p-3 border">Hourly Rate (₹)</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Hire Date</th>
                  </tr>
                </thead>
                <tbody>
                  {labours.map((labour, index) => {
                    // Handle both object and array formats
                    const labourId = labour.LABOUR_ID || labour.labour_id || labour[0];
                    const name = labour.NAME || labour.name || labour[1];
                    const phone = labour.PHONE || labour.phone || labour[2];
                    const email = labour.EMAIL || labour.email || labour[3];
                    const skill = labour.SKILL || labour.skill || labour[4];
                    const hourlyRate = labour.HOURLY_RATE || labour.hourly_rate || labour[5];
                    const status = labour.STATUS || labour.status || labour[8];
                    const hireDate = labour.HIRE_DATE || labour.hire_date || labour[7];

                    return (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{labourId}</td>
                        <td className="p-3 border font-semibold">{name}</td>
                        <td className="p-3 border">{phone || '-'}</td>
                        <td className="p-3 border text-sm">{email || '-'}</td>
                        <td className="p-3 border">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {skill}
                          </span>
                        </td>
                        <td className="p-3 border font-semibold text-green-700">
                          {hourlyRate ? `₹${parseFloat(hourlyRate).toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status || 'AVAILABLE'}
                          </span>
                        </td>
                        <td className="p-3 border text-sm">
                          {hireDate ? new Date(hireDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Total Labours: <span className="font-semibold">{labours.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
