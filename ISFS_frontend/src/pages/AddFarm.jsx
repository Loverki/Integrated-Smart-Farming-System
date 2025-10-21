import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddFarm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    farm_name: "",
    location: "",
    area: "",
    soil_type: "",
    soil_ph: "",
    irrigation_type: "",
    farm_type: "CONVENTIONAL"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queries, setQueries] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Show preview query when form changes
    if (formData.farm_name || formData.location || formData.area) {
      const previewQuery = {
        type: 'PREVIEW',
        sql: `INSERT INTO FARM(
  farm_id, farmer_id, farm_name, location, area,
  soil_type, soil_ph, irrigation_type, farm_type,
  created_date, status
) VALUES(
  FARM_SEQ.NEXTVAL,
  :farmer_id,
  '${e.target.name === 'farm_name' ? e.target.value : formData.farm_name || '...'}',
  '${e.target.name === 'location' ? e.target.value : formData.location || '...'}',
  ${e.target.name === 'area' ? e.target.value || '0' : formData.area || '0'},
  '${e.target.name === 'soil_type' ? e.target.value : formData.soil_type || 'Unknown'}',
  ${e.target.name === 'soil_ph' ? e.target.value || 'NULL' : formData.soil_ph || 'NULL'},
  '${e.target.name === 'irrigation_type' ? e.target.value : formData.irrigation_type || 'MANUAL'}',
  '${e.target.name === 'farm_type' ? e.target.value : formData.farm_type}',
  SYSDATE,
  'ACTIVE'
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
    setLoading(true);
    setQueries([]);
    
    const startTime = Date.now();
    
    try {
      // Simulated query execution steps
      const querySteps = [
        {
          type: 'VALIDATION',
          sql: `SELECT farmer_id FROM FARMER WHERE farmer_id = :farmer_id`,
          status: 'executing',
          description: 'Validating farmer credentials'
        },
        {
          type: 'SEQUENCE',
          sql: `SELECT FARM_SEQ.NEXTVAL FROM DUAL`,
          status: 'pending',
          description: 'Generating unique farm ID'
        },
        {
          type: 'INSERT',
          sql: `INSERT INTO FARM(
  farm_id, farmer_id, farm_name, location, area,
  soil_type, soil_ph, irrigation_type, farm_type,
  created_date, status
) VALUES(
  FARM_SEQ.NEXTVAL,
  :farmer_id,
  '${formData.farm_name}',
  '${formData.location}',
  ${formData.area},
  '${formData.soil_type || 'Unknown'}',
  ${formData.soil_ph || 'NULL'},
  '${formData.irrigation_type || 'MANUAL'}',
  '${formData.farm_type}',
  SYSDATE,
  'ACTIVE'
)`,
          status: 'pending',
          description: 'Inserting farm record'
        },
        {
          type: 'COMMIT',
          sql: `COMMIT`,
          status: 'pending',
          description: 'Committing transaction'
        }
      ];

      // Simulate step-by-step execution
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

      const response = await axios.post("/farms", formData);
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      // Add success summary
      setQueries(prev => [...prev, {
        type: 'SUCCESS',
        sql: '✅ All operations completed successfully',
        status: 'success',
        description: `Farm "${formData.farm_name}" added successfully`
      }]);
      
      setShowSuccess(true);
      
    } catch (err) {
      console.error("Error adding farm:", err);
      const errorMessage = err.response?.data?.message || "Failed to add farm. Please try again.";
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
              <h2 className="text-3xl font-bold text-green-600 mb-2">Add New Farm</h2>
              <p className="text-gray-600">Register a new farm in your portfolio</p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    name="farm_name"
                    placeholder="Enter farm name"
                    value={formData.farm_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (acres) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="area"
                    placeholder="Enter area in acres"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil Type
                  </label>
                  <select
                    name="soil_type"
                    value={formData.soil_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option value="">Select soil type</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Clay">Clay</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Sandy Loam">Sandy Loam</option>
                    <option value="Clay Loam">Clay Loam</option>
                    <option value="Red Soil">Red Soil</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soil pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    name="soil_ph"
                    placeholder="Enter soil pH (0-14)"
                    value={formData.soil_ph}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Irrigation Type
                  </label>
                  <select
                    name="irrigation_type"
                    value={formData.irrigation_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option value="">Select irrigation type</option>
                    <option value="DRIP">Drip Irrigation</option>
                    <option value="SPRINKLER">Sprinkler</option>
                    <option value="FLOOD">Flood Irrigation</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm Type
                  </label>
                  <select
                    name="farm_type"
                    value={formData.farm_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option value="CONVENTIONAL">Conventional</option>
                    <option value="ORGANIC">Organic</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>
              
              {showSuccess ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Farm Added Successfully!</h3>
                  <p className="text-gray-600 mb-6">Review the SQL queries on the right →</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuccess(false);
                        setQueries([]);
                        setExecutionTime(null);
                        setFormData({
                          farm_name: "",
                          location: "",
                          area: "",
                          soil_type: "",
                          soil_ph: "",
                          irrigation_type: "",
                          farm_type: "CONVENTIONAL"
                        });
                      }}
                      className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                    >
                      ➕ Add Another Farm
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/farms")}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      View All Farms →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/farms")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding Farm...
                      </span>
                    ) : (
                      "Add Farm"
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
                  <p className="text-xs mt-2">Click "Add Farm" to execute</p>
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

            {/* Legend */}
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
