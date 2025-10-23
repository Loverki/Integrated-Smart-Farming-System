import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Crops() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/crops");
      setCrops(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching crops:", err);
      setError("Failed to load crops. Please try again.");
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
              <h1 className="text-3xl font-bold">🌾 Crop Management</h1>
              <p className="text-lg mt-1 opacity-90">Track crop growth and harvest schedules</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-crop")}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                ➕ Add Crop
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
            <h2 className="text-2xl font-bold text-gray-800">All Crops</h2>
            <button
              onClick={fetchCrops}
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

          {loading && crops.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading crops...</p>
            </div>
          ) : crops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No crops planted yet.</p>
              <button
                onClick={() => navigate("/add-crop")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add First Crop
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border">ID</th>
                    <th className="p-3 border">Farm</th>
                    <th className="p-3 border">Crop Name</th>
                    <th className="p-3 border">Variety</th>
                    <th className="p-3 border">Sowing Date</th>
                    <th className="p-3 border">Expected Harvest</th>
                    <th className="p-3 border">Expected Yield (kg)</th>
                    <th className="p-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((crop, index) => {
                    // Handle both object and array formats
                    const cropId = crop.CROP_ID || crop.crop_id || crop[0];
                    const farmName = crop.FARM_NAME || crop.farm_name || crop[14];
                    const cropName = crop.CROP_NAME || crop.crop_name || crop[2];
                    const variety = crop.VARIETY || crop.variety || crop[3];
                    const sowingDate = crop.SOWING_DATE || crop.sowing_date || crop[4];
                    const expectedHarvest = crop.EXPECTED_HARVEST_DATE || crop.expected_harvest_date || crop[5];
                    const expectedYield = crop.EXPECTED_YIELD || crop.expected_yield || crop[7];
                    const status = crop.CROP_STATUS || crop.crop_status || crop[9];

                    return (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{cropId}</td>
                        <td className="p-3 border">{farmName || '-'}</td>
                        <td className="p-3 border font-semibold">{cropName}</td>
                        <td className="p-3 border">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {variety || 'Standard'}
                          </span>
                        </td>
                        <td className="p-3 border text-sm">
                          {sowingDate ? new Date(sowingDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border text-sm">
                          {expectedHarvest ? new Date(expectedHarvest).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border font-semibold text-green-700">
                          {expectedYield ? parseFloat(expectedYield).toLocaleString() : '-'}
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            status === 'PLANTED' ? 'bg-blue-100 text-blue-800' :
                            status === 'GROWING' ? 'bg-green-100 text-green-800' :
                            status === 'MATURE' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'HARVESTED' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status || 'PLANTED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Total Crops: <span className="font-semibold">{crops.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
