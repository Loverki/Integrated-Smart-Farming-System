import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Functions() {
  const navigate = useNavigate();

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const functionDef = {
    name: 'GET_FARMER_STATS',
    description: 'Retrieve comprehensive farmer statistics as formatted string',
    icon: '📊',
    signature: `CREATE OR REPLACE FUNCTION GET_FARMER_STATS(
  p_farmer_id IN NUMBER
) RETURN VARCHAR2 AS
  v_stats VARCHAR2(1000);
  v_farms NUMBER;
  v_crops NUMBER;
  v_revenue NUMBER;
BEGIN
  -- Count total farms
  SELECT COUNT(*) INTO v_farms 
  FROM FARM 
  WHERE farmer_id = p_farmer_id;
  
  -- Count total crops across all farms
  SELECT COUNT(*) INTO v_crops 
  FROM CROP c 
  JOIN FARM f ON c.farm_id = f.farm_id 
  WHERE f.farmer_id = p_farmer_id;
  
  -- Calculate total revenue
  SELECT NVL(SUM(s.total_amount), 0) INTO v_revenue
  FROM SALES s
  JOIN FARM f ON s.farm_id = f.farm_id
  WHERE f.farmer_id = p_farmer_id;
  
  -- Format and return result string
  v_stats := 'Farms: ' || v_farms || 
             ', Crops: ' || v_crops || 
             ', Revenue: $' || v_revenue;
  
  RETURN v_stats;
END;`,
    usage: `-- Using function in SQL SELECT
SELECT GET_FARMER_STATS(1) as farmer_stats 
FROM DUAL;

-- Using function in PL/SQL
DECLARE
  v_result VARCHAR2(1000);
BEGIN
  v_result := GET_FARMER_STATS(p_farmer_id => 1);
  DBMS_OUTPUT.PUT_LINE(v_result);
  -- Output: Farms: 3, Crops: 12, Revenue: ₹45200
END;`,
    concepts: [
      'RETURN clause (required)',
      'IN parameters',
      'Local variables (v_stats, v_farms, etc.)',
      'SELECT INTO statements',
      'JOIN operations',
      'NVL for null handling',
      'String concatenation (||)',
      'Can be used in SELECT statements'
    ],
    output: 'Farms: 3, Crops: 12, Revenue: ₹45200'
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🔧 Database Functions</h1>
              <p className="text-lg mt-1 opacity-90">Reusable code modules that return values</p>
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
          {/* Left Column - Function Definition */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-2xl">
                  {functionDef.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{functionDef.name}</h3>
                  <p className="text-sm text-gray-600">{functionDef.description}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Function Definition:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{functionDef.signature}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How to Use:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{functionDef.usage}
                  </pre>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Sample Output:</h4>
                  <div className="font-mono text-sm text-green-800 bg-white p-3 rounded">
                    {functionDef.output}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Concepts Used */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">DBMS Concepts Used</h3>
              <div className="space-y-2">
                {functionDef.concepts.map((concept, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    <span className="text-sm text-gray-700">{concept}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Key Features of Functions:</h3>
              <div className="space-y-2 text-sm text-purple-800">
                <div>• <strong>RETURN value</strong> - Must return a single value</div>
                <div>• <strong>Use in SELECT</strong> - Can be used in SELECT statements</div>
                <div>• <strong>Deterministic</strong> - Same input = same output</div>
                <div>• <strong>Reusable</strong> - Call from anywhere in SQL</div>
                <div>• <strong>Performance</strong> - Reduces redundant calculations</div>
              </div>
            </div>

            {/* Function vs Procedure */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Function vs Stored Procedure</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-semibold border">Feature</th>
                      <th className="p-3 text-left font-semibold border">Function</th>
                      <th className="p-3 text-left font-semibold border">Procedure</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 border font-medium">Return Value</td>
                      <td className="p-3 border text-green-700">✓ Must return</td>
                      <td className="p-3 border text-gray-500">Optional (OUT)</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 border font-medium">Use in SELECT</td>
                      <td className="p-3 border text-green-700">✓ Yes</td>
                      <td className="p-3 border text-gray-500">✗ No</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 border font-medium">Transaction Control</td>
                      <td className="p-3 border text-gray-500">✗ Limited</td>
                      <td className="p-3 border text-green-700">✓ Full support</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 border font-medium">DML Operations</td>
                      <td className="p-3 border text-gray-500">Limited</td>
                      <td className="p-3 border text-green-700">✓ Full support</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="p-3 border font-medium">Best For</td>
                      <td className="p-3 border">Calculations, lookups</td>
                      <td className="p-3 border">Data manipulation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* DBMS Concepts */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">💡 DBMS Concepts Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-purple-800">
            <div>
              <h4 className="font-semibold mb-2">Database Functions:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Return values to calling programs</li>
                <li>• Can be used in SELECT statements</li>
                <li>• Encapsulate complex logic</li>
                <li>• Improve code reusability</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advanced Features:</h4>
              <ul className="space-y-1 text-sm">
                <li>• RETURN clause required</li>
                <li>• Local variable declarations</li>
                <li>• Exception handling support</li>
                <li>• Deterministic optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
