import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

export default function DatabaseQueryTool() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const prebuiltQueries = [
    { name: "All Farmers", query: "SELECT FARMER_ID, NAME, PHONE, EMAIL, ADDRESS, REG_DATE, STATUS, TOTAL_FARMS, TOTAL_AREA FROM FARMER ORDER BY REG_DATE DESC FETCH FIRST 50 ROWS ONLY" },
    { name: "All Farms", query: "SELECT FARM_ID, FARMER_ID, FARM_NAME, LOCATION, AREA, SOIL_TYPE, SOIL_PH, IRRIGATION_TYPE, FARM_TYPE, STATUS, CREATED_DATE FROM FARM ORDER BY FARM_ID DESC FETCH FIRST 50 ROWS ONLY" },
    { name: "Recent Sales", query: "SELECT s.SALE_ID, s.SALE_DATE, s.BUYER_NAME, s.QUANTITY_SOLD, s.UNIT, s.PRICE_PER_UNIT, s.TOTAL_AMOUNT, s.PAYMENT_STATUS, c.CROP_NAME, f.FARM_NAME FROM SALES s JOIN CROP c ON s.CROP_ID = c.CROP_ID JOIN FARM f ON s.FARM_ID = f.FARM_ID ORDER BY s.SALE_DATE DESC FETCH FIRST 20 ROWS ONLY" },
    { name: "All Crops", query: "SELECT CROP_ID, FARM_ID, CROP_NAME, VARIETY, SOWING_DATE, EXPECTED_HARVEST_DATE, ACTUAL_HARVEST_DATE, EXPECTED_YIELD, ACTUAL_YIELD, CROP_STATUS, GROWTH_STAGE FROM CROP ORDER BY SOWING_DATE DESC FETCH FIRST 50 ROWS ONLY" },
    { name: "Crop Performance", query: "SELECT CROP_NAME, COUNT(*) as TOTAL_COUNT, ROUND(AVG(EXPECTED_YIELD), 2) as AVG_EXPECTED, ROUND(AVG(ACTUAL_YIELD), 2) as AVG_ACTUAL FROM CROP GROUP BY CROP_NAME ORDER BY TOTAL_COUNT DESC" },
    { name: "Revenue by Farm", query: "SELECT f.FARM_NAME, f.LOCATION, ROUND(SUM(s.TOTAL_AMOUNT), 2) as TOTAL_REVENUE FROM FARM f LEFT JOIN SALES s ON f.FARM_ID = s.FARM_ID GROUP BY f.FARM_NAME, f.LOCATION ORDER BY TOTAL_REVENUE DESC NULLS LAST" },
    { name: "Active Farmers with Farms", query: "SELECT fa.NAME, fa.PHONE, fa.TOTAL_FARMS, fa.TOTAL_AREA, COUNT(f.FARM_ID) as ACTIVE_FARMS FROM FARMER fa LEFT JOIN FARM f ON fa.FARMER_ID = f.FARMER_ID WHERE fa.STATUS = 'ACTIVE' GROUP BY fa.NAME, fa.PHONE, fa.TOTAL_FARMS, fa.TOTAL_AREA ORDER BY ACTIVE_FARMS DESC" },
    { name: "Farmers Summary", query: "SELECT FARMER_ID, NAME, PHONE, TOTAL_FARMS, TOTAL_AREA, STATUS FROM FARMER ORDER BY TOTAL_FARMS DESC, TOTAL_AREA DESC" }
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a query");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await axios.post("/admin/query/execute", { query });
      setResults(response.data);
    } catch (err) {
      console.error("Query execution error:", err);
      setError(err.response?.data?.message || err.response?.data?.error || "Query execution failed");
    } finally {
      setLoading(false);
    }
  };

  const loadPrebuiltQuery = (prebuiltQuery) => {
    setQuery(prebuiltQuery);
    setResults(null);
    setError("");
  };

  const clearQuery = () => {
    setQuery("");
    setResults(null);
    setError("");
  };

  const exportToCSV = () => {
    if (!results || !results.rows || results.rows.length === 0) return;

    const headers = results.columns.join(',');
    const rows = results.rows.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🗄️ Database Query Tool</h1>
              <p className="text-lg mt-1 opacity-90">Execute SQL queries safely</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Query Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pre-built Queries */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pre-built Queries</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {prebuiltQueries.map((pq, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadPrebuiltQuery(pq.query)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    {pq.name}
                  </button>
                ))}
              </div>
            </div>

            {/* SQL Editor */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">SQL Query</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearQuery}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={executeQuery}
                    disabled={loading || !query.trim()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Executing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Execute Query
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here... (SELECT queries only)"
                className="w-full h-48 border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
              />
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Only SELECT queries are allowed for security</span>
                </div>
                <span>{query.length} characters</span>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold">Error executing query</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Query Results</h2>
                    <p className="text-sm text-gray-600">{results.rowCount} rows returned</p>
                  </div>
                  {results.rowCount > 0 && (
                    <button
                      onClick={exportToCSV}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export CSV
                    </button>
                  )}
                </div>

                {results.rowCount === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Query returned no results</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {results.columns.map((col, idx) => (
                            <th
                              key={idx}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.rows.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            {Object.values(row).map((value, colIdx) => (
                              <td
                                key={colIdx}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                {value !== null && value !== undefined ? String(value) : <span className="text-gray-400">NULL</span>}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help & Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3">💡 Query Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Only SELECT queries are allowed for security</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Use FETCH FIRST n ROWS ONLY to limit results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Table names are case-sensitive (use uppercase)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Use NVL() for handling NULL values</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-bold text-green-900 mb-3">📋 Available Tables</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• FARMER</li>
                <li>• FARM</li>
                <li>• CROP</li>
                <li>• LABOUR</li>
                <li>• LABOUR_WORK</li>
                <li>• EQUIPMENT</li>
                <li>• FERTILIZER</li>
                <li>• SALES</li>
                <li>• ADMIN</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-yellow-900 mb-3">⚠️ Security Notice</h3>
              <p className="text-sm text-yellow-800">
                Queries are restricted to SELECT operations only. Any attempt to modify data (INSERT, UPDATE, DELETE) will be rejected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

