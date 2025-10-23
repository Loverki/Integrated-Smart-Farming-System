import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StoredProcedures() {
  const navigate = useNavigate();
  const [selectedProcedure, setSelectedProcedure] = useState(null);

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const procedures = [
    {
      id: 'calculate-profitability',
      name: 'CALCULATE_FARM_PROFITABILITY',
      description: 'Calculate revenue, costs, and profit for a specific farm',
      icon: '💰',
      color: 'orange',
      signature: `CREATE OR REPLACE PROCEDURE CALCULATE_FARM_PROFITABILITY(
  p_farm_id IN NUMBER,
  p_profit OUT NUMBER,
  p_revenue OUT NUMBER,
  p_cost OUT NUMBER
) AS
BEGIN
  -- Calculate total revenue
  SELECT NVL(SUM(total_amount), 0) 
  INTO p_revenue
  FROM SALES
  WHERE farm_id = p_farm_id;
  
  -- Calculate total costs
  SELECT NVL(SUM(total_cost), 0)
  INTO p_cost
  FROM (
    SELECT total_cost FROM FERTILIZER WHERE farm_id = p_farm_id
    UNION ALL
    SELECT total_cost FROM LABOURWORK WHERE farm_id = p_farm_id
  );
  
  -- Calculate profit
  p_profit := p_revenue - p_cost;
END;`,
      concepts: [
        'IN and OUT parameters',
        'Local variables',
        'Aggregate functions (SUM)',
        'NVL for null handling',
        'UNION ALL for combining results',
        'Subqueries',
        'Arithmetic operations'
      ],
      usage: `DECLARE
  v_profit NUMBER;
  v_revenue NUMBER;
  v_cost NUMBER;
BEGIN
  CALCULATE_FARM_PROFITABILITY(
    p_farm_id => 1,
    p_profit => v_profit,
    p_revenue => v_revenue,
    p_cost => v_cost
  );
  
  DBMS_OUTPUT.PUT_LINE('Revenue: $' || v_revenue);
  DBMS_OUTPUT.PUT_LINE('Cost: $' || v_cost);
  DBMS_OUTPUT.PUT_LINE('Profit: $' || v_profit);
END;`
    },
    {
      id: 'update-crop-status',
      name: 'UPDATE_CROP_STATUS',
      description: 'Update crop status, yield, and harvest date with validation',
      icon: '🌾',
      color: 'green',
      signature: `CREATE OR REPLACE PROCEDURE UPDATE_CROP_STATUS(
  p_crop_id IN NUMBER,
  p_new_status IN VARCHAR2,
  p_actual_yield IN NUMBER DEFAULT NULL,
  p_actual_harvest_date IN DATE DEFAULT NULL
) AS
BEGIN
  UPDATE CROP
  SET crop_status = p_new_status,
      actual_yield = NVL(p_actual_yield, actual_yield),
      actual_harvest_date = NVL(p_actual_harvest_date, actual_harvest_date)
  WHERE crop_id = p_crop_id;
  
  COMMIT;
END;`,
      concepts: [
        'IN parameters',
        'DEFAULT parameter values',
        'UPDATE statements',
        'NVL for conditional updates',
        'COMMIT transaction control',
        'WHERE clause filtering'
      ],
      usage: `BEGIN
  -- Update crop to HARVESTED status
  UPDATE_CROP_STATUS(
    p_crop_id => 1,
    p_new_status => 'HARVESTED',
    p_actual_yield => 2500,
    p_actual_harvest_date => SYSDATE
  );
  
  DBMS_OUTPUT.PUT_LINE('Crop status updated successfully');
END;`
    }
  ];

  const getColorClass = (color) => {
    const colors = {
      orange: 'bg-orange-500',
      green: 'bg-green-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">⚙️ Stored Procedures</h1>
              <p className="text-lg mt-1 opacity-90">Encapsulated business logic in the database</p>
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
          {/* Left Column - Procedure Cards */}
          <div className="space-y-6">
            {procedures.map((proc) => (
              <div
                key={proc.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                  selectedProcedure?.id === proc.id 
                    ? 'ring-2 ring-orange-500' 
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedProcedure(proc)}
              >
                <div className="bg-gray-50 px-6 py-4 border-b flex items-center gap-3">
                  <div className={`w-12 h-12 ${getColorClass(proc.color)} rounded-lg flex items-center justify-center text-white text-2xl`}>
                    {proc.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{proc.name}</h3>
                    <p className="text-sm text-gray-600">{proc.description}</p>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Procedure Definition:</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{proc.signature}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Selected Procedure Details */}
          <div className="sticky top-4 h-fit">
            {selectedProcedure ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${getColorClass(selectedProcedure.color)} rounded-lg flex items-center justify-center text-white text-2xl`}>
                    {selectedProcedure.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedProcedure.name}</h3>
                    <p className="text-sm text-gray-600">{selectedProcedure.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Usage Example */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How to Call:</h4>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
{selectedProcedure.usage}
                    </pre>
                  </div>

                  {/* Concepts */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">DBMS Concepts Used:</h4>
                    <div className="space-y-2">
                      {selectedProcedure.concepts.map((concept, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-orange-600">✓</span>
                          <span className="text-sm text-gray-700">{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Benefits:</h4>
                    <div className="space-y-1 text-sm text-orange-800">
                      <div>• Improved performance (executed on database server)</div>
                      <div>• Code reusability across applications</div>
                      <div>• Enhanced security (controlled access)</div>
                      <div>• Reduced network traffic</div>
                      <div>• Transaction management built-in</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-600">Select a procedure to see details</p>
              </div>
            )}
          </div>
        </div>

        {/* DBMS Concepts Section */}
        <div className="mt-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-2">💡 DBMS Concepts Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-orange-800">
            <div>
              <h4 className="font-semibold mb-2">Stored Procedures:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Encapsulated business logic</li>
                <li>• Input/Output parameters</li>
                <li>• Complex calculations</li>
                <li>• Transaction management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Improved performance</li>
                <li>• Code reusability</li>
                <li>• Enhanced security</li>
                <li>• Reduced network traffic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
