import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function DatabaseViews() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState(null);
  const [viewData, setViewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("adminToken");
    if (!token && !adminToken) {
      navigate("/login");
    }
  }, [navigate]);

  const views = [
    {
      id: "farmer-dashboard",
      name: "FARMER_DASHBOARD",
      description: "Comprehensive farmer dashboard with key metrics",
      icon: "👨‍🌾",
      color: "blue",
      sql: `SELECT 
  f.farmer_id,
  f.name as farmer_name,
  f.phone,
  COUNT(fm.farm_id) as total_farms,
  SUM(fm.area) as total_area,
  COUNT(c.crop_id) as total_crops,
  SUM(CASE WHEN c.crop_status = 'HARVESTED' 
      THEN c.actual_yield ELSE 0 END) as total_yield,
  SUM(s.total_amount) as total_revenue,
  AVG(s.price_per_unit) as avg_selling_price
FROM FARMER f
LEFT JOIN FARM fm ON f.farmer_id = fm.farmer_id
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON fm.farm_id = s.farm_id
WHERE f.farmer_id = :farmer_id
GROUP BY f.farmer_id, f.name, f.phone`,
      columns: ["FARMER_ID", "FARMER_NAME", "PHONE", "TOTAL_FARMS", "TOTAL_AREA", "TOTAL_CROPS", "TOTAL_YIELD", "TOTAL_REVENUE", "AVG_SELLING_PRICE"]
    },
    {
      id: "farm-performance",
      name: "FARM_PERFORMANCE",
      description: "Farm performance metrics and profitability analysis",
      icon: "🏡",
      color: "green",
      sql: `SELECT 
  fm.farm_id,
  fm.farm_name,
  f.name AS farmer_name,
  fm.area,
  fm.soil_type,
  COUNT(DISTINCT c.crop_id) AS crops_count,
  SUM(c.expected_yield) AS expected_total_yield,
  SUM(c.actual_yield) AS actual_total_yield,
  ROUND((SUM(c.actual_yield) / NULLIF(SUM(c.expected_yield), 0)) * 100, 2) 
    AS yield_efficiency,
  SUM(s.total_amount) AS total_revenue,
  SUM(fer.total_cost) AS fertilizer_cost,
  SUM(lw.total_cost) AS labour_cost
FROM FARM fm
JOIN FARMER f ON fm.farmer_id = f.farmer_id
LEFT JOIN CROP c ON fm.farm_id = c.farm_id
LEFT JOIN SALES s ON fm.farm_id = s.farm_id
LEFT JOIN FERTILIZER fer ON fm.farm_id = fer.farm_id
LEFT JOIN LABOURWORK lw ON fm.farm_id = lw.farm_id
WHERE f.farmer_id = :farmer_id
GROUP BY fm.farm_id, fm.farm_name, f.name, fm.area, fm.soil_type`,
      columns: ["FARM_ID", "FARM_NAME", "FARMER_NAME", "AREA", "SOIL_TYPE", "CROPS_COUNT", "EXPECTED_TOTAL_YIELD", "ACTUAL_TOTAL_YIELD", "YIELD_EFFICIENCY", "TOTAL_REVENUE", "FERTILIZER_COST", "LABOUR_COST"]
    },
    {
      id: "crop-analytics",
      name: "CROP_ANALYTICS",
      description: "Detailed crop analysis and yield tracking",
      icon: "🌾",
      color: "yellow",
      sql: `SELECT 
  c.crop_name,
  COUNT(*) AS total_crops,
  AVG(c.actual_yield) AS avg_yield,
  MIN(c.actual_yield) AS min_yield,
  MAX(c.actual_yield) AS max_yield,
  AVG(s.price_per_unit) AS avg_price,
  SUM(s.total_amount) AS total_revenue,
  AVG(c.actual_harvest_date - c.sowing_date) AS avg_growth_days
FROM CROP c
JOIN FARM fm ON c.farm_id = fm.farm_id
LEFT JOIN SALES s ON c.crop_id = s.crop_id
WHERE c.crop_status = 'HARVESTED' AND fm.farmer_id = :farmer_id
GROUP BY c.crop_name`,
      columns: ["CROP_NAME", "TOTAL_CROPS", "AVG_YIELD", "MIN_YIELD", "MAX_YIELD", "AVG_PRICE", "TOTAL_REVENUE", "AVG_GROWTH_DAYS"]
    },
    {
      id: "monthly-revenue",
      name: "MONTHLY_REVENUE",
      description: "Monthly revenue trends and sales patterns",
      icon: "💰",
      color: "purple",
      sql: `SELECT 
  TO_CHAR(s.sale_date, 'YYYY-MM') as month,
  f.name as farmer_name,
  SUM(s.total_amount) as monthly_revenue,
  COUNT(s.sale_id) as sales_count,
  AVG(s.price_per_unit) as avg_price
FROM SALES s
JOIN FARM fm ON s.farm_id = fm.farm_id
JOIN FARMER f ON fm.farmer_id = f.farmer_id
WHERE f.farmer_id = :farmer_id
GROUP BY TO_CHAR(s.sale_date, 'YYYY-MM'), f.name
ORDER BY month DESC`,
      columns: ["MONTH", "FARMER_NAME", "MONTHLY_REVENUE", "SALES_COUNT", "AVG_PRICE"]
    }
  ];

  const selectView = async (view) => {
    setSelectedView(view);
    setViewData([]);
    setError("");
    
    // Fetch data for the selected view
    setLoading(true);
    try {
      const response = await axios.get(`/views/${view.id}`);
      console.log(`📊 ${view.name} data:`, response.data);
      setViewData(response.data);
    } catch (err) {
      console.error(`Error fetching ${view.name}:`, err);
      setError(err.response?.data?.message || "Failed to load view data");
    } finally {
      setLoading(false);
    }
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">📊 Database Views Analytics</h1>
              <p className="text-lg mt-1 opacity-90">Execute and visualize complex database views</p>
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - View Selection */}
          <div className="space-y-4">
            {views.map((view) => (
              <div
                key={view.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                  selectedView?.id === view.id 
                    ? 'ring-2 ring-green-500' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => selectView(view)}
              >
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
                  <div className={`w-10 h-10 ${getColorClass(view.color)} rounded-lg flex items-center justify-center text-white text-xl`}>
                    {view.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{view.name}</h3>
                    <p className="text-sm text-gray-600">{view.description}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">SQL Query:</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{view.sql}
                    </pre>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    <strong>Columns returned:</strong> {view.columns.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Selected View Details */}
          <div className="sticky top-4 h-fit">
            {selectedView ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${getColorClass(selectedView.color)} rounded-lg flex items-center justify-center text-white text-2xl`}>
                    {selectedView.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedView.name}</h3>
                    <p className="text-sm text-gray-600">{selectedView.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">DBMS Concepts Used:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-gray-700">Complex JOIN operations (INNER, LEFT)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-gray-700">Aggregate functions (COUNT, SUM, AVG)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-gray-700">GROUP BY clause</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-sm text-gray-700">WHERE clause filtering</span>
                      </div>
                      {selectedView.id === 'farmer-dashboard' && (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-gray-700">CASE statements</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-gray-700">Multiple table joins</span>
                          </div>
                        </>
                      )}
                      {selectedView.id === 'farm-performance' && (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-gray-700">NULLIF for safe division</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-gray-700">ROUND function</span>
                          </div>
                        </>
                      )}
                      {selectedView.id === 'monthly-revenue' && (
                        <>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-gray-700">TO_CHAR date formatting</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm text-gray-700">ORDER BY clause</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">View Purpose:</h4>
                    <p className="text-sm text-blue-800">{selectedView.description}</p>
                  </div>

                  {/* Data Table */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">📊 View Data:</h4>
                    
                    {loading && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Loading data...</p>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}
                    
                    {!loading && !error && viewData.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              {selectedView.columns.map((col) => (
                                <th
                                  key={col}
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r"
                                >
                                  {col.replace(/_/g, ' ')}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {viewData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50">
                                {selectedView.columns.map((col) => {
                                  const value = row[col] ?? row[col.toLowerCase()] ?? '-';
                                  return (
                                    <td key={col} className="px-4 py-3 text-sm text-gray-900 border-r">
                                      {typeof value === 'number' 
                                        ? value.toLocaleString('en-IN', { 
                                            maximumFractionDigits: 2,
                                            minimumFractionDigits: col.includes('PRICE') || col.includes('COST') || col.includes('REVENUE') ? 2 : 0
                                          })
                                        : value}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="mt-2 text-sm text-gray-600">
                          Total records: <strong>{viewData.length}</strong>
                        </p>
                      </div>
                    )}
                    
                    {!loading && !error && viewData.length === 0 && selectedView && (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No data available for this view</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-gray-600">Select a view to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* DBMS Concepts */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 DBMS Concepts Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Views:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Complex JOIN operations (INNER, LEFT)</li>
                <li>• Aggregation functions (COUNT, SUM, AVG)</li>
                <li>• Conditional grouping with CASE</li>
                <li>• Date extraction and formatting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced SQL:</h4>
              <ul className="space-y-1 text-sm">
                <li>• NVL for null handling</li>
                <li>• NULLIF for division safety</li>
                <li>• Mathematical calculations</li>
                <li>• GROUP BY with multiple columns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
