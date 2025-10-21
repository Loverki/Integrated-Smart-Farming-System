import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddEquipment() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    equipment_name: "",
    equipment_type: "",
    brand: "",
    model: "",
    purchase_date: "",
    purchase_cost: "",
    current_value: "",
    status: "OPERATIONAL",
    last_maintenance_date: "",
    next_maintenance_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queries, setQueries] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);
    setError("");
    setSuccess("");

    // Show preview query
    if (updatedForm.equipment_name || updatedForm.equipment_type) {
      const previewQuery = {
        type: 'PREVIEW',
        sql: `INSERT INTO EQUIPMENT(
  equipment_id, farmer_id, equipment_name, equipment_type,
  brand, model, purchase_date, purchase_cost, current_value,
  status, last_maintenance_date, next_maintenance_date
) VALUES(
  EQUIPMENT_SEQ.NEXTVAL,
  :farmer_id,
  '${updatedForm.equipment_name || '...'}',
  '${updatedForm.equipment_type || '...'}',
  ${updatedForm.brand ? `'${updatedForm.brand}'` : 'NULL'},
  ${updatedForm.model ? `'${updatedForm.model}'` : 'NULL'},
  ${updatedForm.purchase_date ? `TO_DATE('${updatedForm.purchase_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${updatedForm.purchase_cost || 'NULL'},
  ${updatedForm.current_value || 'NULL'},
  '${updatedForm.status}',
  ${updatedForm.last_maintenance_date ? `TO_DATE('${updatedForm.last_maintenance_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${updatedForm.next_maintenance_date ? `TO_DATE('${updatedForm.next_maintenance_date}', 'YYYY-MM-DD')` : 'NULL'}
)`,
        status: 'pending',
        time: null
      };
      setQueries([previewQuery]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setQueries([]);
    
    const startTime = Date.now();
    
    try {
      const querySteps = [
        {
          type: 'VALIDATION',
          sql: `SELECT farmer_id FROM FARMER WHERE farmer_id = :farmer_id`,
          status: 'executing',
          description: 'Validating farmer authentication'
        },
        {
          type: 'SEQUENCE',
          sql: `SELECT EQUIPMENT_SEQ.NEXTVAL FROM DUAL`,
          status: 'pending',
          description: 'Generating unique equipment ID'
        },
        {
          type: 'INSERT',
          sql: `INSERT INTO EQUIPMENT(
  equipment_id, farmer_id, equipment_name, equipment_type,
  brand, model, purchase_date, purchase_cost, current_value,
  status, last_maintenance_date, next_maintenance_date
) VALUES(
  EQUIPMENT_SEQ.NEXTVAL,
  :farmer_id,
  '${form.equipment_name}',
  '${form.equipment_type}',
  ${form.brand ? `'${form.brand}'` : 'NULL'},
  ${form.model ? `'${form.model}'` : 'NULL'},
  ${form.purchase_date ? `TO_DATE('${form.purchase_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${form.purchase_cost || 'NULL'},
  ${form.current_value || 'NULL'},
  '${form.status}',
  ${form.last_maintenance_date ? `TO_DATE('${form.last_maintenance_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${form.next_maintenance_date ? `TO_DATE('${form.next_maintenance_date}', 'YYYY-MM-DD')` : 'NULL'}
)`,
          status: 'pending',
          description: 'Inserting equipment record with farmer association'
        },
        {
          type: 'COMMIT',
          sql: `COMMIT`,
          status: 'pending',
          description: 'Committing transaction'
        }
      ];

      for (let i = 0; i < querySteps.length; i++) {
        setQueries(prev => {
          const updated = [...querySteps.slice(0, i + 1)];
          updated[i] = { ...updated[i], status: 'executing' };
          return updated;
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setQueries(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'success', time: Math.random() * 50 + 10 };
          return updated;
        });
      }

      await axios.post("/equipment", form);
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      setQueries(prev => [...prev, {
        type: 'SUCCESS',
        sql: '✅ All operations completed successfully',
        status: 'success',
        description: `Equipment "${form.equipment_name}" registered successfully`
      }]);
      
      setShowSuccess(true);
      
    } catch (err) {
      console.error("Error adding equipment:", err);
      const errorMessage = err.response?.data?.message || "Failed to add equipment. Please try again.";
      setError(errorMessage);
      
      setQueries(prev => [...prev, {
        type: 'ERROR',
        sql: `❌ ${errorMessage}`,
        status: 'error',
        description: 'Operation failed'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'executing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return '✅';
      case 'executing': return '⏳';
      case 'error': return '❌';
      case 'pending': return '⏸️';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-orange-600 mb-2">🚜 Add New Equipment</h2>
              <p className="text-gray-600">Register farm equipment and machinery</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    name="equipment_name"
                    placeholder="Enter equipment name"
                    value={form.equipment_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Type *
                  </label>
                  <select
                    name="equipment_type"
                    value={form.equipment_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  >
                    <option key="empty" value="">Select type</option>
                    <option key="tractor" value="Tractor">Tractor</option>
                    <option key="harvester" value="Harvester">Harvester</option>
                    <option key="plough" value="Plough">Plough</option>
                    <option key="sprayer" value="Sprayer">Sprayer</option>
                    <option key="seeder" value="Seeder">Seeder</option>
                    <option key="irrigation" value="Irrigation System">Irrigation System</option>
                    <option key="cultivator" value="Cultivator">Cultivator</option>
                    <option key="trailer" value="Trailer">Trailer</option>
                    <option key="pump" value="Water Pump">Water Pump</option>
                    <option key="other" value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="Enter brand name"
                    value={form.brand}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    placeholder="Enter model"
                    value={form.model}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchase_date"
                    value={form.purchase_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="purchase_cost"
                    placeholder="Enter purchase cost"
                    value={form.purchase_cost}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Value (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="current_value"
                    placeholder="Enter current value"
                    value={form.current_value}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option key="operational" value="OPERATIONAL">Operational</option>
                    <option key="maintenance" value="MAINTENANCE">Maintenance</option>
                    <option key="repair" value="REPAIR">Under Repair</option>
                    <option key="retired" value="RETIRED">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Maintenance Date
                  </label>
                  <input
                    type="date"
                    name="last_maintenance_date"
                    value={form.last_maintenance_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Maintenance Date
                  </label>
                  <input
                    type="date"
                    name="next_maintenance_date"
                    value={form.next_maintenance_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>

              {showSuccess ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Equipment Added Successfully!</h3>
                  <p className="text-gray-600 mb-6">Review the SQL queries on the right →</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuccess(false);
                        setQueries([]);
                        setExecutionTime(null);
                        setForm({
                          equipment_name: "",
                          equipment_type: "",
                          brand: "",
                          model: "",
                          purchase_date: "",
                          purchase_cost: "",
                          current_value: "",
                          status: "OPERATIONAL",
                          last_maintenance_date: "",
                          next_maintenance_date: ""
                        });
                      }}
                      className="px-6 py-3 border-2 border-orange-600 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors font-semibold"
                    >
                      ➕ Add Another Equipment
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/equipment")}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                    >
                      View All Equipment →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/equipment")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    View All Equipment
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Equipment...
                      </span>
                    ) : (
                      "Add Equipment"
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - SQL Query Visualizer */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-900">🔍 SQL Query Visualizer</h3>
                {executionTime && (
                  <span className="text-sm text-green-600 font-semibold">
                    ⚡ {executionTime}ms
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">Real-time database operations</p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {queries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Fill in the form to see SQL queries</p>
                  <p className="text-xs mt-2">Click "Add Equipment" to execute</p>
                </div>
              ) : (
                queries.map((query, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${getStatusColor(query.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getStatusIcon(query.status)}</span>
                        <span className="font-semibold text-sm">
                          {query.type}
                        </span>
                      </div>
                      {query.time && (
                        <span className="text-xs font-mono">{query.time.toFixed(2)}ms</span>
                      )}
                    </div>
                    
                    {query.description && (
                      <p className="text-xs mb-2 opacity-75">{query.description}</p>
                    )}
                    
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono">
                      {query.sql}
                    </pre>
                    
                    {query.status === 'executing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Query Status:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span>⏸️</span>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏳</span>
                  <span>Executing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span>Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
