import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function CropsOverview() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/crops");
      console.log(`✅ Received ${res.data.length} crops from all farms`);
      setCrops(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching crops:", err);
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
      case 'PLANTED': return { bg: 'from-blue-400 to-blue-600', text: 'text-blue-700', badge: 'bg-blue-100' };
      case 'GROWING': return { bg: 'from-green-400 to-green-600', text: 'text-green-700', badge: 'bg-green-100' };
      case 'MATURE': return { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-700', badge: 'bg-yellow-100' };
      case 'HARVESTED': return { bg: 'from-purple-400 to-purple-600', text: 'text-purple-700', badge: 'bg-purple-100' };
      default: return { bg: 'from-gray-400 to-gray-600', text: 'text-gray-700', badge: 'bg-gray-100' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PLANTED': return '🌱';
      case 'GROWING': return '🌿';
      case 'MATURE': return '🌾';
      case 'HARVESTED': return '✅';
      default: return '📋';
    }
  };

  const getCropIcon = (cropName) => {
    const name = cropName?.toLowerCase() || '';
    if (name.includes('wheat')) return '🌾';
    if (name.includes('rice')) return '🌾';
    if (name.includes('corn') || name.includes('maize')) return '🌽';
    if (name.includes('tomato')) return '🍅';
    if (name.includes('potato')) return '🥔';
    if (name.includes('carrot')) return '🥕';
    return '🌱';
  };

  const calculateProgress = (sowingDate, harvestDate) => {
    if (!sowingDate || !harvestDate) return 0;
    const now = new Date();
    const sowing = new Date(sowingDate);
    const harvest = new Date(harvestDate);
    const total = harvest - sowing;
    const elapsed = now - sowing;
    const progress = (elapsed / total) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const filteredCrops = crops.filter(crop => {
    const status = crop.CROP_STATUS || crop.crop_status || crop[9];
    const cropName = crop.CROP_NAME || crop.crop_name || crop[2];
    const farmName = crop.FARM_NAME || crop.farm_name || crop[11];
    
    const matchesSearch = searchTerm === "" || 
      cropName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "ALL" || status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: crops.length,
    planted: crops.filter(c => (c.CROP_STATUS || c.crop_status || c[9]) === 'PLANTED').length,
    growing: crops.filter(c => (c.CROP_STATUS || c.crop_status || c[9]) === 'GROWING').length,
    mature: crops.filter(c => (c.CROP_STATUS || c.crop_status || c[9]) === 'MATURE').length,
    harvested: crops.filter(c => (c.CROP_STATUS || c.crop_status || c[9]) === 'HARVESTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-8 border-gray-200 border-t-green-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">🌾</span>
            </div>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700">Loading crops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white shadow-2xl overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-teal-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Back Button */}
          <button
            onClick={() => navigate("/farms")}
            className="group mb-8 bg-white bg-opacity-20 backdrop-blur-md hover:bg-opacity-30 p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 hover:-translate-x-1 border border-white border-opacity-20 hover:border-opacity-40"
          >
            <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="text-7xl animate-bounce">🌾</div>
              <h1 className="text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-green-100 to-white drop-shadow-2xl">
                Crops Overview
              </h1>
              <div className="text-7xl animate-bounce animation-delay-300">🌱</div>
            </div>
            <p className="text-2xl font-medium opacity-95 max-w-3xl mx-auto leading-relaxed">
              Comprehensive view of all crops across your farms with detailed analytics and insights
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="group bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Total</div>
                <div className="text-5xl group-hover:scale-125 transition-transform">📊</div>
              </div>
              <div className="text-5xl font-black text-emerald-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">All Crops</div>
            </div>

            <div className="group bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Planted</div>
                <div className="text-5xl group-hover:scale-125 transition-transform">🌱</div>
              </div>
              <div className="text-5xl font-black text-blue-600">{stats.planted}</div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">Recently Sown</div>
            </div>

            <div className="group bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Growing</div>
                <div className="text-5xl group-hover:scale-125 transition-transform">🌿</div>
              </div>
              <div className="text-5xl font-black text-green-600">{stats.growing}</div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">In Progress</div>
            </div>

            <div className="group bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Mature</div>
                <div className="text-5xl group-hover:scale-125 transition-transform">🌾</div>
              </div>
              <div className="text-5xl font-black text-yellow-600">{stats.mature}</div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">Ready Soon</div>
            </div>

            <div className="group bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 transform">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Harvested</div>
                <div className="text-5xl group-hover:scale-125 transition-transform">✅</div>
              </div>
              <div className="text-5xl font-black text-purple-600">{stats.harvested}</div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">Completed</div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60h1440V0s-120 60-360 60S720 0 720 0 600 60 360 60 0 0 0 0v60z" fill="rgb(240 253 244)" fillOpacity="1"></path>
          </svg>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border-2 border-green-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by crop name or farm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              {['ALL', 'PLANTED', 'GROWING', 'MATURE', 'HARVESTED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? '📋 All' : `${getStatusIcon(status)} ${status}`}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchCrops}
              className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Crops Grid */}
        {filteredCrops.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="text-8xl mb-6">🌾</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">No Crops Found</h3>
            <p className="text-xl text-gray-600 mb-8">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Try adjusting your filters or search term'
                : "You haven't planted any crops yet"}
            </p>
            <button
              onClick={() => navigate("/add-crop")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🌱 Plant Your First Crop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCrops.map((crop, index) => {
              const cropId = crop.CROP_ID || crop.crop_id || crop[0];
              const cropName = crop.CROP_NAME || crop.crop_name || crop[2];
              const farmName = crop.FARM_NAME || crop.farm_name || crop[11];
              const variety = crop.VARIETY || crop.variety || crop[3];
              const sowingDate = crop.SOWING_DATE || crop.sowing_date || crop[4];
              const expectedHarvest = crop.EXPECTED_HARVEST_DATE || crop.expected_harvest_date || crop[5];
              const expectedYield = crop.EXPECTED_YIELD || crop.expected_yield || crop[6];
              const actualYield = crop.ACTUAL_YIELD || crop.actual_yield || crop[7];
              const status = crop.CROP_STATUS || crop.crop_status || crop[9];
              const statusColors = getStatusColor(status);
              const progress = calculateProgress(sowingDate, expectedHarvest);

              return (
                <div
                  key={`crop-${cropId}-${index}`}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-gray-100 hover:border-green-400 transform hover:-translate-y-2"
                >
                  {/* Card Header with Gradient */}
                  <div className={`relative bg-gradient-to-br ${statusColors.bg} text-white p-6 h-40 overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative flex items-center justify-between">
                      <div>
                        <div className="text-5xl mb-2">{getCropIcon(cropName)}</div>
                        <h3 className="text-2xl font-black">{cropName}</h3>
                        <p className="text-sm opacity-90 font-medium">ID: {cropId}</p>
                      </div>
                      <div className={`px-4 py-2 ${statusColors.badge} rounded-2xl text-sm font-bold ${statusColors.text} backdrop-blur-sm`}>
                        {getStatusIcon(status)} {status}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-white bg-opacity-30">
                      <div 
                        className="h-full bg-white transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    {/* Farm Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏡</span>
                      <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold flex-1">
                        {farmName}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                        <div className="text-xs text-purple-600 font-bold uppercase mb-1">Variety</div>
                        <div className="text-sm font-bold text-purple-900">{variety || 'N/A'}</div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4">
                        <div className="text-xs text-orange-600 font-bold uppercase mb-1">Progress</div>
                        <div className="text-sm font-bold text-orange-900">{Math.round(progress)}%</div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
                        <div className="text-xs text-green-600 font-bold uppercase mb-1">Expected</div>
                        <div className="text-sm font-bold text-green-900">{expectedYield || 0} kg</div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
                        <div className="text-xs text-blue-600 font-bold uppercase mb-1">Actual</div>
                        <div className="text-sm font-bold text-blue-900">{actualYield || 0} kg</div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">📅</span>
                        <span className="text-gray-600 font-medium">Sown:</span>
                        <span className="font-bold text-gray-900">
                          {sowingDate ? new Date(sowingDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">🎯</span>
                        <span className="text-gray-600 font-medium">Harvest:</span>
                        <span className="font-bold text-gray-900">
                          {expectedHarvest ? new Date(expectedHarvest).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => navigate(`/crops/${cropId}/edit`)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Crop Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {filteredCrops.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-600">
              Showing <span className="font-bold text-green-600">{filteredCrops.length}</span> of <span className="font-bold text-green-600">{crops.length}</span> crops
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

