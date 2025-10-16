import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function Farms() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check if logged in and fetch farms
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchFarms();
  }, [navigate]);

  const fetchFarms = async () => {
    try {
      const response = await axios.get("/farmers/farms");
      setFarms(response.data);
    } catch (err) {
      console.error("Error fetching farms:", err);
      setError("Failed to load farms data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farms...</p>
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
              <h1 className="text-3xl font-bold">🏡 Farm Management</h1>
              <p className="text-lg mt-1 opacity-90">Manage your farms and monitor performance</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-farm")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                + Add Farm
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {farms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Farms Found</h2>
            <p className="text-gray-600 mb-6">You haven't added any farms yet. Start by adding your first farm!</p>
            <button
              onClick={() => navigate("/add-farm")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Your First Farm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <div key={farm.FARM_ID} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{farm.FARM_NAME}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    farm.STATUS === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {farm.STATUS}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span className="font-medium">{farm.LOCATION}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Area:</span>
                    <span className="font-medium">{farm.AREA} acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Soil Type:</span>
                    <span className="font-medium">{farm.SOIL_TYPE}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crops:</span>
                    <span className="font-medium">{farm.CROP_COUNT || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenue:</span>
                    <span className="font-medium text-green-600">${farm.TOTAL_REVENUE || 0}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => navigate(`/farms/${farm.FARM_ID}/crops`)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    View Crops
                  </button>
                  <button
                    onClick={() => navigate(`/farms/${farm.FARM_ID}/edit`)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}