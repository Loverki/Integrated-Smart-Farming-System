import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

export default function FarmerManagement() {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchFarmers();
  }, [pagination.page, searchTerm]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/admin/farmers", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });
      setFarmers(response.data.farmers);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
      setError("");
    } catch (err) {
      console.error("Error fetching farmers:", err);
      setError(err.response?.data?.message || "Failed to fetch farmers");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (farmerId) => {
    try {
      const response = await axios.get(`/admin/farmers/${farmerId}`);
      setSelectedFarmer(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error fetching farmer details:", err);
      alert("Failed to load farmer details");
    }
  };

  const handleToggleStatus = async (farmerId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} this farmer?`
    );

    if (!confirmed) return;

    try {
      await axios.put(`/admin/farmers/${farmerId}/status`, { status: newStatus });
      fetchFarmers(); // Refresh list
      alert(`Farmer ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error("Error updating farmer status:", err);
      alert("Failed to update farmer status");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchFarmers();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">👨‍🌾 Farmer Management</h1>
              <p className="text-lg mt-1 opacity-90">Manage and monitor all farmers</p>
            </div>
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search by farmer name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Farmers Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading farmers...</p>
          </div>
        ) : farmers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No farmers found</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Farmer ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Farms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Crops
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {farmers.map((farmer) => (
                    <tr key={farmer.FARMER_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{farmer.FARMER_ID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {farmer.NAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {farmer.PHONE}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {farmer.TOTAL_FARMS}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {farmer.TOTAL_CROPS}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₹{(farmer.TOTAL_REVENUE || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          farmer.STATUS === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {farmer.STATUS || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewDetails(farmer.FARMER_ID)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleToggleStatus(farmer.FARMER_ID, farmer.STATUS || 'ACTIVE')}
                          className={`${
                            (farmer.STATUS || 'ACTIVE') === 'ACTIVE' 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {(farmer.STATUS || 'ACTIVE') === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {farmers.length} of {pagination.total} farmers
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Farmer Detail Modal */}
      {showDetailModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">{selectedFarmer.farmer.NAME}</h3>
                  <p className="text-sm opacity-90">Farmer ID: #{selectedFarmer.farmer.FARMER_ID}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Farmer Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Farmer Information</h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedFarmer.farmer.PHONE}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium">{selectedFarmer.farmer.ADDRESS || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registration Date</p>
                    <p className="font-medium">{new Date(selectedFarmer.farmer.REG_DATE).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="font-medium text-green-600">₹{(selectedFarmer.total_revenue || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Farms */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Farms ({selectedFarmer.farms.length})</h4>
                {selectedFarmer.farms.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFarmer.farms.map((farm) => (
                      <div key={farm.FARM_ID} className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{farm.FARM_NAME}</p>
                            <p className="text-sm text-gray-600">{farm.LOCATION}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-gray-600">Area: <span className="font-medium">{farm.AREA} acres</span></p>
                            <p className="text-gray-600">Soil: <span className="font-medium">{farm.SOIL_TYPE}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No farms registered</p>
                )}
              </div>

              {/* Crops */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Crops ({selectedFarmer.crops.length})</h4>
                {selectedFarmer.crops.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Crop Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Farm</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sowing Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expected Yield</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actual Yield</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedFarmer.crops.map((crop) => (
                          <tr key={crop.CROP_ID}>
                            <td className="px-4 py-2 text-sm text-gray-900">{crop.CROP_NAME}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{crop.FARM_NAME}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {new Date(crop.SOWING_DATE).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">{crop.EXPECTED_YIELD || 'N/A'} kg</td>
                            <td className="px-4 py-2 text-sm text-gray-600">{crop.ACTUAL_YIELD || 'N/A'} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No crops planted</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

