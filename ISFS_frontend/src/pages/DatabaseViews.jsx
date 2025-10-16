import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function DatabaseViews() {
  const navigate = useNavigate();

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
      name: "FARMER_DASHBOARD_VIEW",
      description: "Comprehensive farmer dashboard with key metrics",
      sql: `CREATE OR REPLACE VIEW FARMER_DASHBOARD_VIEW AS
SELECT 
    f.FARMER_ID,
    f.NAME as FARMER_NAME,
    COUNT(fm.FARM_ID) as TOTAL_FARMS,
    NVL(SUM(fm.AREA), 0) as TOTAL_AREA,
    COUNT(c.CROP_ID) as TOTAL_CROPS,
    NVL(AVG(c.ACTUAL_YIELD), 0) as AVG_YIELD,
    NVL(SUM(s.TOTAL_AMOUNT), 0) as TOTAL_REVENUE,
    COUNT(CASE WHEN c.CROP_STATUS = 'ACTIVE' THEN 1 END) as ACTIVE_CROPS
FROM FARMER f
LEFT JOIN FARM fm ON f.FARMER_ID = fm.FARMER_ID
LEFT JOIN CROP c ON fm.FARM_ID = c.FARM_ID
LEFT JOIN SALES s ON fm.FARM_ID = s.FARM_ID
GROUP BY f.FARMER_ID, f.NAME`
    },
    {
      name: "FARM_PERFORMANCE_VIEW",
      description: "Farm performance metrics and analysis",
      sql: `CREATE OR REPLACE VIEW FARM_PERFORMANCE_VIEW AS
SELECT 
    fm.FARM_ID,
    fm.FARM_NAME,
    fm.LOCATION,
    fm.AREA,
    f.NAME as FARMER_NAME,
    COUNT(c.CROP_ID) as CROP_COUNT,
    NVL(AVG(c.ACTUAL_YIELD), 0) as AVG_YIELD,
    NVL(SUM(s.TOTAL_AMOUNT), 0) as TOTAL_REVENUE,
    ROUND(NVL(SUM(s.TOTAL_AMOUNT), 0) / fm.AREA, 2) as REVENUE_PER_ACRE
FROM FARM fm
JOIN FARMER f ON fm.FARMER_ID = f.FARMER_ID
LEFT JOIN CROP c ON fm.FARM_ID = c.FARM_ID
LEFT JOIN SALES s ON fm.FARM_ID = s.FARM_ID
GROUP BY fm.FARM_ID, fm.FARM_NAME, fm.LOCATION, fm.AREA, f.NAME`
    },
    {
      name: "CROP_ANALYSIS_VIEW",
      description: "Detailed crop analysis and yield tracking",
      sql: `CREATE OR REPLACE VIEW CROP_ANALYSIS_VIEW AS
SELECT 
    c.CROP_ID,
    c.CROP_NAME,
    fm.FARM_NAME,
    f.NAME as FARMER_NAME,
    c.SOWING_DATE,
    c.HARVESTING_DATE,
    c.EXPECTED_YIELD,
    c.ACTUAL_YIELD,
    ROUND((c.ACTUAL_YIELD - c.EXPECTED_YIELD) / c.EXPECTED_YIELD * 100, 2) as YIELD_VARIANCE_PERCENT,
    c.CROP_STATUS,
    s.TOTAL_AMOUNT as SALE_AMOUNT
FROM CROP c
JOIN FARM fm ON c.FARM_ID = fm.FARM_ID
JOIN FARMER f ON fm.FARMER_ID = f.FARMER_ID
LEFT JOIN SALES s ON c.CROP_ID = s.CROP_ID`
    },
    {
      name: "LABOUR_EFFICIENCY_VIEW",
      description: "Labour efficiency and productivity metrics",
      sql: `CREATE OR REPLACE VIEW LABOUR_EFFICIENCY_VIEW AS
SELECT 
    l.LABOUR_ID,
    l.NAME as LABOUR_NAME,
    l.SKILL,
    COUNT(lw.WORK_ID) as TOTAL_WORK_DAYS,
    SUM(lw.HOURS_WORKED) as TOTAL_HOURS,
    NVL(AVG(lw.HOURS_WORKED), 0) as AVG_HOURS_PER_DAY,
    fm.FARM_NAME,
    f.NAME as FARMER_NAME
FROM LABOUR l
LEFT JOIN LABOUR_WORK lw ON l.LABOUR_ID = lw.LABOUR_ID
LEFT JOIN FARM fm ON lw.FARM_ID = fm.FARM_ID
LEFT JOIN FARMER f ON fm.FARMER_ID = f.FARMER_ID
GROUP BY l.LABOUR_ID, l.NAME, l.SKILL, fm.FARM_NAME, f.NAME`
    },
    {
      name: "REVENUE_ANALYSIS_VIEW",
      description: "Revenue analysis by farmer, farm, and crop",
      sql: `CREATE OR REPLACE VIEW REVENUE_ANALYSIS_VIEW AS
SELECT 
    s.SALE_ID,
    f.NAME as FARMER_NAME,
    fm.FARM_NAME,
    c.CROP_NAME,
    s.QUANTITY_SOLD,
    s.PRICE_PER_UNIT,
    s.TOTAL_AMOUNT,
    s.SALE_DATE,
    EXTRACT(YEAR FROM s.SALE_DATE) as SALE_YEAR,
    EXTRACT(MONTH FROM s.SALE_DATE) as SALE_MONTH
FROM SALES s
JOIN FARM fm ON s.FARM_ID = fm.FARM_ID
JOIN FARMER f ON fm.FARMER_ID = f.FARMER_ID
LEFT JOIN CROP c ON s.CROP_ID = c.CROP_ID`
    }
  ];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">📊 Database Views</h1>
              <p className="text-lg mt-1 opacity-90">Advanced database views for analytics and reporting</p>
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
        <div className="space-y-6">
          {views.map((view, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900">{view.name}</h3>
                <p className="text-gray-600 mt-1">{view.description}</p>
              </div>
              <div className="p-6">
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{view.sql}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 DBMS Concepts Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Views:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Complex JOIN operations</li>
                <li>• Aggregation functions (COUNT, SUM, AVG)</li>
                <li>• Conditional grouping</li>
                <li>• Date extraction functions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced SQL:</h4>
              <ul className="space-y-1 text-sm">
                <li>• NVL for null handling</li>
                <li>• CASE statements</li>
                <li>• Mathematical calculations</li>
                <li>• Performance optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
