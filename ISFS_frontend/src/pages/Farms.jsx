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
      const response = await axios.get("/farms");
      console.log("✅ Farms loaded:", response.data);
      // Filter to only show active farms (check both uppercase and lowercase)
      const activeFarms = response.data.filter(farm => 
        (farm.status === 'ACTIVE' || farm.STATUS === 'ACTIVE')
      );
      console.log(`📊 Active farms: ${activeFarms.length} out of ${response.data.length}`);
      setFarms(activeFarms);
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
                className="group bg-green-800 hover:bg-green-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Farm
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-green-800 hover:bg-green-900 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Dashboard
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

        {/* View All Crops Button */}
        {farms.length > 0 && (
          <div className="mb-8 relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-400">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-2000"></div>
              <div className="absolute bottom-0 left-1/2 w-80 h-80 bg-teal-200 rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-4000"></div>
            </div>
            
            {/* Decorative Top Wave */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-50"></div>
            
            <div className="relative p-10 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative bg-white bg-opacity-25 backdrop-blur-lg p-6 rounded-3xl border-2 border-white border-opacity-40 shadow-xl">
                    <svg className="w-14 h-14 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="text-white">
                  <h2 className="text-4xl font-black mb-3 tracking-tight drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                    View All Crops Overview
                  </h2>
                  <p className="text-lg font-medium opacity-95 mb-4 max-w-2xl leading-relaxed">
                    See detailed information about all crops planted across all your farms in one comprehensive view
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="group px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-bold border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-gray-900">
                      <span className="text-lg">📊</span>
                      Performance Metrics
                    </span>
                    <span className="group px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-bold border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-gray-900">
                      <span className="text-lg">🌾</span>
                      Growth Tracking
                    </span>
                    <span className="group px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-bold border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-gray-900">
                      <span className="text-lg">📈</span>
                      Yield Analysis
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate("/crops-overview")}
                className="group relative bg-white text-emerald-700 px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-all duration-300 shadow-2xl hover:shadow-emerald-300/50 transform hover:scale-110 hover:-translate-y-1 flex items-center gap-4 border-3 border-emerald-200 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <svg className="w-7 h-7 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="relative">View All Crops</span>
                <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Decorative Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <path d="M0 60h1440V0s-120 60-360 60S720 0 720 0 600 60 360 60 0 0 0 0v60z" fill="rgb(240 253 244)" fillOpacity="1"></path>
              </svg>
            </div>
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
            {farms.map((farm, index) => {
              const farmId = farm.farmId || farm.FARM_ID || farm.farm_id;
              const farmName = farm.farmName || farm.FARM_NAME || farm.farm_name;
              const location = farm.location || farm.LOCATION;
              const area = farm.area || farm.AREA;
              const soilType = farm.soilType || farm.SOIL_TYPE || farm.soil_type;
              const status = farm.status || farm.STATUS;
              const cropCount = farm.cropCount || farm.CROP_COUNT || farm.crop_count || 0;
              const totalRevenue = farm.totalRevenue || farm.TOTAL_REVENUE || farm.total_revenue || 0;
              
              return (
                <div key={farmId || `farm-${index}`} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{farmName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium">{location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Area:</span>
                      <span className="font-medium">{area} acres</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Soil Type:</span>
                      <span className="font-medium">{soilType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Crops:</span>
                      <span className="font-medium">{cropCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={() => navigate(`/farms/${farmId}/edit`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Farm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}