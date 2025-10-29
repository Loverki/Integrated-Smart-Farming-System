import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Fertilizers() {
  const navigate = useNavigate();
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFertilizers();
  }, []);

  const fetchFertilizers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/fertilizers");
      console.log("Fertilizers received:", res.data);
      // Ensure we have an array and filter out any invalid entries
      const validFertilizers = Array.isArray(res.data) ? res.data.filter(f => f && (f.FERTILIZER_ID || f.fertilizer_id || f[0])) : [];
      setFertilizers(validFertilizers);
      setError("");
    } catch (err) {
      console.error("Error fetching fertilizers:", err);
      setError("Failed to load fertilizers. Please try again.");
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
              <h1 className="text-3xl font-bold">🧪 Fertilizer Tracking</h1>
              <p className="text-lg mt-1 opacity-90">Track fertilizer applications and effectiveness</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-fertilizers")}
                className="group bg-green-800 hover:bg-green-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Fertilizer
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-green-800 hover:bg-green-900 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
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

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Fertilizer Applications</h2>
            <button
              onClick={fetchFertilizers}
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

          {loading && fertilizers.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading fertilizers...</p>
            </div>
          ) : fertilizers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No fertilizer applications recorded yet.</p>
              <button
                onClick={() => navigate("/add-fertilizers")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add First Fertilizer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border">ID</th>
                    <th className="p-3 border">Farm</th>
                    <th className="p-3 border">Fertilizer Name</th>
                    <th className="p-3 border">Type</th>
                    <th className="p-3 border">Quantity</th>
                    <th className="p-3 border">Total Cost</th>
                    <th className="p-3 border">Applied Date</th>
                    <th className="p-3 border">Effectiveness</th>
                    <th className="p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fertilizers.map((fert, index) => {
                    // Handle both object and array formats
                    const id = fert.FERTILIZER_ID || fert.fertilizer_id || fert[0];
                    const farmName = fert.FARM_NAME || fert.farm_name || fert[1];
                    const name = fert.FERTILIZER_NAME || fert.fertilizer_name || fert[2];
                    const type = fert.FERTILIZER_TYPE || fert.fertilizer_type || fert[3];
                    const qty = fert.QUANTITY_USED || fert.quantity_used || fert[4];
                    const unit = fert.UNIT || fert.unit || fert[5];
                    const cost = fert.TOTAL_COST || fert.total_cost || fert[6];
                    const date = fert.APPLICATION_DATE || fert.application_date || fert.APPLIED_DATE || fert.applied_date || fert[7];
                    const rating = fert.EFFECTIVENESS_RATING || fert.effectiveness_rating || fert[8];

                    return (
                      <tr key={`fertilizer-${id}-${index}`} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{id}</td>
                        <td className="p-3 border">{farmName ||'-'}</td>
                        <td className="p-3 border font-semibold">{name}</td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            type === 'ORGANIC' ? 'bg-green-100 text-green-800' :
                            type === 'BIO_FERTILIZER' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {type}
                          </span>
                        </td>
                        <td className="p-3 border">{qty} {unit}</td>
                        <td className="p-3 border font-semibold text-green-700">
                          {cost ? `₹${parseFloat(cost).toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 border text-sm">
                          {date ? new Date(date).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border text-center">
                          {rating ? '⭐'.repeat(parseInt(rating)) : '-'}
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => alert('Fertilizer records are historical and cannot be edited. You can add a new application instead.')}
                            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition-colors text-sm font-semibold flex items-center gap-1 cursor-not-allowed"
                            title="Fertilizer applications are historical records"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Locked
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Total Applications: <span className="font-semibold">{fertilizers.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
