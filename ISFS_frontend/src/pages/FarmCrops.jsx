import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";

export default function FarmCrops() {
  const navigate = useNavigate();
  const { farmId } = useParams();
  const [crops, setCrops] = useState([]);
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (farmId) {
      fetchFarmAndCrops();
    }
  }, [farmId]);

  const fetchFarmAndCrops = async () => {
    try {
      setLoading(true);
      
      // Fetch farm details
      const farmRes = await axios.get("/farms");
      const allFarms = farmRes.data;
      const currentFarm = allFarms.find(f => {
        const fId = f.farmId || f.FARM_ID || f.farm_id || f[0];
        return fId && fId.toString() === farmId;
      });
      
      console.log(`🏡 Farm found:`, currentFarm);
      setFarm(currentFarm);

      // Fetch crops for this specific farm
      const cropsRes = await axios.get(`/crops?farm_id=${farmId}`);
      console.log(`🌾 Retrieved ${cropsRes.data.length} crops for farm ${farmId}`);
      setCrops(cropsRes.data);
      
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load crops. Please try again.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANTED': return 'bg-blue-100 text-blue-800';
      case 'GROWING': return 'bg-green-100 text-green-800';
      case 'MATURE': return 'bg-yellow-100 text-yellow-800';
      case 'HARVESTED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading farm crops...</p>
        </div>
      </div>
    );
  }

  const farmName = farm?.FARM_NAME || farm?.farm_name || 'Farm';

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🌾 {farmName} - Crops</h1>
              <p className="text-lg mt-1 opacity-90">View and manage crops on this farm</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-crop")}
                className="group bg-green-800 hover:bg-green-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Plant New Crop
              </button>
              <button
                onClick={() => navigate("/farms")}
                className="group bg-green-800 hover:bg-green-900 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Farms
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Crops on {farmName}</h2>
            <button
              onClick={fetchFarmAndCrops}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {crops.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌾</div>
              <p className="text-xl text-gray-600 mb-2">No crops planted on this farm yet</p>
              <p className="text-gray-500 mb-6">Start by planting your first crop!</p>
              <button
                onClick={() => navigate("/add-crop")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Plant Your First Crop
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Crop Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Variety</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Sowing Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expected Harvest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actual Harvest</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expected Yield</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actual Yield</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {crops.map((crop, index) => {
                      const cropId = crop.CROP_ID || crop.crop_id || crop[0];
                      const cropName = crop.CROP_NAME || crop.crop_name || crop[2];
                      const variety = crop.VARIETY || crop.variety || crop[3];
                      const sowingDate = crop.SOWING_DATE || crop.sowing_date || crop[4];
                      const expectedHarvest = crop.EXPECTED_HARVEST_DATE || crop.expected_harvest_date || crop[5];
                      const actualHarvest = crop.ACTUAL_HARVEST_DATE || crop.actual_harvest_date || crop[6];
                      const expectedYield = crop.EXPECTED_YIELD || crop.expected_yield || crop[7];
                      const actualYield = crop.ACTUAL_YIELD || crop.actual_yield || crop[8];
                      const status = crop.CROP_STATUS || crop.crop_status || crop[9];

                      return (
                        <tr key={`crop-${cropId}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cropId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {cropName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {variety || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {sowingDate ? new Date(sowingDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {expectedHarvest ? new Date(expectedHarvest).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {actualHarvest ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {new Date(actualHarvest).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not harvested</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {expectedYield ? `${expectedYield} kg` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {actualYield ? `${actualYield} kg` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => navigate(`/crops/${cropId}/edit`)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Total Crops on this farm: <span className="font-semibold">{crops.length}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
