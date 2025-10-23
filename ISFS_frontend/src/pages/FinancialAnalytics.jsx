import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import SQLQueryVisualizer from "../components/SQLQueryVisualizer";

export default function FinancialAnalytics() {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    const startTime = Date.now();
    
    // Initialize query visualization
    setQueries([
      { query: "Fetching revenue data...", status: "executing", description: "Calculating total revenue from sales" },
      { query: "Fetching cost data...", status: "pending", description: "Calculating fertilizer and labour costs" },
      { query: "Fetching equipment investment...", status: "pending", description: "Calculating equipment investment" },
      { query: "Calculating profit metrics...", status: "pending", description: "Computing profit, margin, and ROI" }
    ]);
    setShowSQL(true);

    try {
      // Step 1: Revenue query
      await new Promise(resolve => setTimeout(resolve, 500));
      setQueries(prev => prev.map((q, i) => 
        i === 0 ? { ...q, status: "success" } : q
      ));

      // Step 2: Cost query
      setQueries(prev => prev.map((q, i) => 
        i === 1 ? { ...q, status: "executing" } : q
      ));
      await new Promise(resolve => setTimeout(resolve, 500));
      setQueries(prev => prev.map((q, i) => 
        i === 1 ? { ...q, status: "success" } : q
      ));

      // Step 3: Equipment investment
      setQueries(prev => prev.map((q, i) => 
        i === 2 ? { ...q, status: "executing" } : q
      ));
      await new Promise(resolve => setTimeout(resolve, 500));
      setQueries(prev => prev.map((q, i) => 
        i === 2 ? { ...q, status: "success" } : q
      ));

      // Step 4: Final calculations
      setQueries(prev => prev.map((q, i) => 
        i === 3 ? { ...q, status: "executing" } : q
      ));

      const response = await axios.get("/analytics/financial");
      const endTime = Date.now();

      setQueries(prev => prev.map((q, i) => 
        i === 3 ? { ...q, status: "success", executionTime: endTime - startTime } : q
      ));

      // Update with actual SQL queries
      setQueries([
        {
          query: `SELECT NVL(SUM(s.total_amount), 0) as total_revenue
FROM SALES s
JOIN FARM f ON s.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id`,
          status: "success",
          description: "Total Revenue from Sales",
          result: `Revenue: $${response.data.total_revenue || 0}`
        },
        {
          query: `-- Fertilizer Costs
SELECT NVL(SUM(fer.total_cost), 0) as fertilizer_cost
FROM FERTILIZER fer
JOIN FARM f ON fer.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id

-- Labour Costs
SELECT NVL(SUM(lw.total_cost), 0) as labour_cost
FROM LABOURWORK lw
JOIN FARM f ON lw.farm_id = f.farm_id
WHERE f.farmer_id = :farmer_id`,
          status: "success",
          description: "Total Operating Costs",
          result: `Fertilizer: $${response.data.fertilizer_cost || 0}, Labour: $${response.data.labour_cost || 0}`
        },
        {
          query: `SELECT 
  NVL(SUM(e.purchase_cost), 0) as equipment_investment,
  NVL(SUM(e.current_value), 0) as equipment_current_value
FROM EQUIPMENT e
WHERE e.farmer_id = :farmer_id`,
          status: "success",
          description: "Equipment Investment",
          result: `Investment: $${response.data.equipment_investment || 0}, Current Value: $${response.data.equipment_current_value || 0}`
        },
        {
          query: `-- Calculated in backend:
-- profit = revenue - (fertilizer_cost + labour_cost)
-- profit_margin = (profit / revenue) * 100
-- roi = (profit / equipment_investment) * 100`,
          status: "success",
          description: "Profit Metrics Calculation",
          result: `Profit: $${response.data.profit || 0}, Margin: ${response.data.profit_margin || 0}%, ROI: ${response.data.roi || 0}%`,
          executionTime: endTime - startTime
        }
      ]);

      setFinancialData(response.data);
    } catch (err) {
      console.error("Error fetching financial data:", err);
      setError("Failed to load financial analytics");
      setQueries(prev => prev.map(q => ({ ...q, status: "error" })));
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4`} style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-3xl">{icon}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const CostBreakdownChart = ({ data }) => {
    if (!data) return null;

    const totalCosts = data.fertilizer_cost + data.labour_cost;
    const fertilizerPercent = totalCosts > 0 ? (data.fertilizer_cost / totalCosts * 100).toFixed(1) : 0;
    const labourPercent = totalCosts > 0 ? (data.labour_cost / totalCosts * 100).toFixed(1) : 0;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Breakdown</h3>
        
        {/* Visual Bar */}
        <div className="mb-6">
          <div className="h-8 flex rounded-lg overflow-hidden">
            <div 
              className="bg-purple-500 flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${fertilizerPercent}%` }}
            >
              {fertilizerPercent > 10 && `${fertilizerPercent}%`}
            </div>
            <div 
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
              style={{ width: `${labourPercent}%` }}
            >
              {labourPercent > 10 && `${labourPercent}%`}
            </div>
          </div>
        </div>

        {/* Cost Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <div>
                <div className="font-semibold text-gray-900">Fertilizer</div>
                <div className="text-xs text-gray-600">{fertilizerPercent}% of total costs</div>
              </div>
            </div>
            <div className="text-lg font-bold text-purple-600">${data.fertilizer_cost || 0}</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <div>
                <div className="font-semibold text-gray-900">Labour</div>
                <div className="text-xs text-gray-600">{labourPercent}% of total costs</div>
              </div>
            </div>
            <div className="text-lg font-bold text-blue-600">${data.labour_cost || 0}</div>
          </div>

          <div className="border-t-2 border-gray-200 pt-3 mt-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-gray-900">Total Operating Costs</div>
              <div className="text-xl font-bold text-gray-900">${totalCosts.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfitOverview = ({ data }) => {
    if (!data) return null;

    const isProfitable = data.profit > 0;

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profit Analysis</h3>
        
        {/* Main Profit Display */}
        <div className={`p-6 rounded-xl mb-4 ${isProfitable ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Net Profit</div>
            <div className={`text-4xl font-bold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(data.profit || 0).toFixed(2)}
            </div>
            <div className={`text-sm mt-2 ${isProfitable ? 'text-green-700' : 'text-red-700'}`}>
              {isProfitable ? '✓ Profitable' : '⚠ Loss'}
            </div>
          </div>
        </div>

        {/* Calculation Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center p-2 bg-green-50 rounded">
            <span className="text-gray-700">Revenue</span>
            <span className="font-semibold text-green-700">+${data.total_revenue || 0}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-red-50 rounded">
            <span className="text-gray-700">Operating Costs</span>
            <span className="font-semibold text-red-700">-${(data.fertilizer_cost + data.labour_cost).toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-gray-200 my-2"></div>
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded font-bold">
            <span className="text-gray-900">Net Profit</span>
            <span className={isProfitable ? 'text-green-700' : 'text-red-700'}>
              ${data.profit || 0}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 p-3 rounded text-center">
            <div className="text-xs text-gray-600">Profit Margin</div>
            <div className="text-2xl font-bold text-blue-600">{data.profit_margin || 0}%</div>
          </div>
          <div className="bg-indigo-50 p-3 rounded text-center">
            <div className="text-xs text-gray-600">ROI</div>
            <div className="text-2xl font-bold text-indigo-600">{data.roi || 0}%</div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold">💰 Financial Analytics</h1>
                <p className="text-sm opacity-90 mt-1">Complete overview of your farm finances</p>
              </div>
            </div>
            <button
              onClick={() => setShowSQL(!showSQL)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              {showSQL ? 'Hide' : 'Show'} SQL Queries
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
              executionTime={queries[queries.length - 1]?.executionTime}
            />
          </div>
        )}

        {/* Key Metrics */}
        {financialData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Total Revenue"
                value={`$${financialData.total_revenue || 0}`}
                subtitle="From crop sales"
                icon="💵"
                color="#10B981"
              />
              <MetricCard
                title="Operating Costs"
                value={`$${(financialData.fertilizer_cost + financialData.labour_cost).toFixed(2)}`}
                subtitle="Fertilizer + Labour"
                icon="💸"
                color="#EF4444"
              />
              <MetricCard
                title="Net Profit"
                value={`$${financialData.profit || 0}`}
                subtitle={financialData.profit > 0 ? 'Profitable' : 'Loss'}
                icon={financialData.profit > 0 ? "✅" : "⚠️"}
                color={financialData.profit > 0 ? "#10B981" : "#EF4444"}
              />
              <MetricCard
                title="Equipment Investment"
                value={`$${financialData.equipment_investment || 0}`}
                subtitle={`Current value: $${financialData.equipment_current_value || 0}`}
                icon="🔧"
                color="#8B5CF6"
              />
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <CostBreakdownChart data={financialData} />
              <ProfitOverview data={financialData} />
            </div>

            {/* Investment Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Investment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🧪</div>
                  <div className="text-sm text-gray-600">Fertilizer Investment</div>
                  <div className="text-xl font-bold text-purple-600">${financialData.fertilizer_cost || 0}</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-sm text-gray-600">Labour Investment</div>
                  <div className="text-xl font-bold text-blue-600">${financialData.labour_cost || 0}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-2xl mb-2">🔧</div>
                  <div className="text-sm text-gray-600">Equipment Investment</div>
                  <div className="text-xl font-bold text-gray-600">${financialData.equipment_investment || 0}</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Total Investment</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${(financialData.fertilizer_cost + financialData.labour_cost + financialData.equipment_investment).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Return on Investment</div>
                    <div className={`text-2xl font-bold ${financialData.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {financialData.roi || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Health Indicators */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Health Indicators</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Profitability Score</span>
                    <span className="text-sm font-bold text-gray-900">
                      {financialData.profit > 0 ? 'Excellent' : 'Needs Improvement'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${financialData.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(financialData.profit_margin), 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Cost Efficiency</span>
                    <span className="text-sm font-bold text-gray-900">
                      {financialData.total_revenue > 0 
                        ? `${(((financialData.fertilizer_cost + financialData.labour_cost) / financialData.total_revenue) * 100).toFixed(1)}% of revenue`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: financialData.total_revenue > 0 
                          ? `${Math.min(((financialData.fertilizer_cost + financialData.labour_cost) / financialData.total_revenue) * 100, 100)}%`
                          : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

