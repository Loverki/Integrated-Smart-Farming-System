import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import SQLQueryVisualizer from "../components/SQLQueryVisualizer";

export default function FarmComparison() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [sortBy, setSortBy] = useState("profit");
  const [sortOrder, setSortOrder] = useState("desc");
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    fetchFarmComparison();
  }, []);

  const fetchFarmComparison = async () => {
    const startTime = Date.now();
    
    setQueries([{
      type: "Farm Performance Comparison Query",
      sql: "Fetching farm performance data...",
      status: "executing",
      description: "Comparing all farms with performance metrics"
    }]);
    setShowSQL(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await axios.get("/analytics/farm-comparison");
      const endTime = Date.now();

      setQueries([{
        type: "Farm Performance Comparison Query",
        sql: `SELECT 
  fm.farm_id,
  fm.farm_name,
  fm.area,
  fm.soil_type,
  COUNT(DISTINCT c.crop_id) AS total_crops,
  SUM(c.expected_yield) AS expected_yield,
  SUM(c.actual_yield) AS actual_yield,
  ROUND(
    (SUM(c.actual_yield) / NULLIF(SUM(c.expected_yield), 0)) * 100,
    2
  ) AS yield_efficiency,
  SUM(s.total_amount) AS revenue,
  SUM(fer.total_cost) AS fertilizer_cost,
  SUM(lw.total_cost) AS labour_cost,
  (
    SUM(s.total_amount) - 
    (NVL(SUM(fer.total_cost), 0) + NVL(SUM(lw.total_cost), 0))
  ) AS profit,
  ROUND(
    SUM(s.total_amount) / NULLIF(fm.area, 0),
    2
  ) AS revenue_per_acre
FROM FARM fm
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON fm.farm_id = s.farm_id
LEFT JOIN FERTILIZER fer ON fm.farm_id = fer.farm_id
LEFT JOIN LABOURWORK lw ON fm.farm_id = lw.farm_id
WHERE fm.farmer_id = :farmer_id
GROUP BY fm.farm_id, fm.farm_name, fm.area, fm.soil_type
ORDER BY profit DESC`,
        status: "success",
        description: `Retrieved ${response.data.length} farms with complete performance metrics`,
        time: endTime - startTime
      }]);

      setFarms(response.data);
    } catch (err) {
      console.error("Error fetching farm comparison:", err);
      setError("Failed to load farm comparison data");
      setQueries([{ 
        type: "Farm Performance Comparison Query",
        sql: "SELECT ... (query failed)", 
        status: "error",
        description: "Failed to fetch farm data"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sortFarms = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortedFarms = () => {
    return [...farms].sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const getBestFarm = () => {
    if (farms.length === 0) return null;
    return farms.reduce((best, farm) => 
      (farm.profit || 0) > (best.profit || 0) ? farm : best
    , farms[0]);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === "asc" ? <span className="text-green-600">↑</span> : <span className="text-green-600">↓</span>;
  };

  const bestFarm = getBestFarm();
  const sortedFarms = getSortedFarms();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farm comparison...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-indigo-800 hover:bg-indigo-900 p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 border-2 border-indigo-700 hover:border-indigo-600"
              >
                <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold">🏆 Farm Performance Comparison</h1>
                <p className="text-sm opacity-90 mt-1">Compare yields, revenue, and profitability across all your farms</p>
              </div>
            </div>
            <button
              onClick={() => setShowSQL(!showSQL)}
              className={`relative px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 shadow-md ${
                showSQL 
                  ? 'bg-gray-900 text-green-400 hover:bg-gray-800 border-2 border-green-400' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="font-mono text-sm">
                {showSQL ? 'Hide' : 'Show'} SQL
              </span>
              <span className={`ml-1 px-2 py-0.5 rounded text-xs font-bold ${
                showSQL ? 'bg-green-400 text-gray-900' : 'bg-blue-500 text-white'
              }`}>
                QUERY
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* SQL Visualization */}
        {showSQL && queries.length > 0 && (
          <div className="mb-8">
            <SQLQueryVisualizer 
              queries={queries}
              executionTime={queries[0]?.time}
            />
          </div>
        )}

        {/* Best Performing Farm */}
        {bestFarm && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="text-6xl">🏆</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Best Performing Farm</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div>
                    <div className="text-sm opacity-90">Farm Name</div>
                    <div className="text-xl font-bold">{bestFarm.farm_name}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Total Profit</div>
                    <div className="text-xl font-bold">${bestFarm.profit || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Yield Efficiency</div>
                    <div className="text-xl font-bold">{bestFarm.yield_efficiency || 0}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-90">Revenue/Acre</div>
                    <div className="text-xl font-bold">₹{bestFarm.revenue_per_acre || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Farm Comparison Table */}
        {farms.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">All Farms Comparison</h3>
              <p className="text-sm text-gray-600 mt-1">Click column headers to sort</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Farm Name
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => sortFarms("area")}
                    >
                      <div className="flex items-center gap-2">
                        Area (acres)
                        <SortIcon field="area" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => sortFarms("total_crops")}
                    >
                      <div className="flex items-center gap-2">
                        Crops
                        <SortIcon field="total_crops" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => sortFarms("yield_efficiency")}
                    >
                      <div className="flex items-center gap-2">
                        Yield Efficiency
                        <SortIcon field="yield_efficiency" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => sortFarms("revenue")}
                    >
                      <div className="flex items-center gap-2">
                        Revenue
                        <SortIcon field="revenue" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Costs
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => sortFarms("profit")}
                    >
                      <div className="flex items-center gap-2">
                        Profit
                        <SortIcon field="profit" />
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                      onClick={() => sortFarms("revenue_per_acre")}
                    >
                      <div className="flex items-center gap-2">
                        Revenue/Acre
                        <SortIcon field="revenue_per_acre" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedFarms.map((farm, index) => {
                    const isBest = farm.farm_id === bestFarm?.farm_id;
                    const totalCost = (farm.fertilizer_cost || 0) + (farm.labour_cost || 0);
                    
                    return (
                      <tr 
                        key={farm.farm_id} 
                        className={`hover:bg-gray-50 ${isBest ? 'bg-yellow-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {isBest && <span className="mr-2">🏆</span>}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{farm.farm_name}</div>
                              <div className="text-xs text-gray-500">{farm.soil_type || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farm.area || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {farm.total_crops || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  (farm.yield_efficiency || 0) >= 80 ? 'bg-green-500' :
                                  (farm.yield_efficiency || 0) >= 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(farm.yield_efficiency || 0, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {farm.yield_efficiency || 0}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ₹{farm.revenue || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{totalCost.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            F: ₹{farm.fertilizer_cost || 0} | L: ₹{farm.labour_cost || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-bold ${
                            (farm.profit || 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ₹{farm.profit || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-semibold">
                          ₹{farm.revenue_per_acre || 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-gray-600">Total Farms</div>
                  <div className="text-lg font-bold text-gray-900">{farms.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Revenue</div>
                  <div className="text-lg font-bold text-green-600">
                    ₹{farms.reduce((sum, f) => sum + (f.revenue || 0), 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Total Profit</div>
                  <div className="text-lg font-bold text-blue-600">
                    ₹{farms.reduce((sum, f) => sum + (f.profit || 0), 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Avg Yield Efficiency</div>
                  <div className="text-lg font-bold text-purple-600">
                    {(farms.reduce((sum, f) => sum + (f.yield_efficiency || 0), 0) / farms.length).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Farms Found</h3>
            <p className="text-gray-600 mb-6">Start by adding your first farm to see comparison data</p>
            <button
              onClick={() => navigate("/add-farm")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Add Farm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

