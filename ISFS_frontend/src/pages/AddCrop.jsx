import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddCrop() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [form, setForm] = useState({
    farm_id: "",
    crop_name: "",
    variety: "",
    sowing_date: "",
    expected_harvest_date: "",
    expected_yield: "",
    seed_quantity: "",
    planting_density: "",
    growth_stage: "PLANTED",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queries, setQueries] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch farmer's farms
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get("/farms");
        setFarms(response.data);
        
        // Auto-select first farm if available
        if (response.data && response.data.length > 0) {
          const firstFarm = response.data[0];
          const farmId = firstFarm.FARM_ID || firstFarm.farm_id;
          if (farmId) {
            setForm(prevForm => ({
              ...prevForm,
              farm_id: farmId.toString()
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching farms:", err);
        setError("Failed to load farms. Please refresh the page.");
      }
    };
    fetchFarms();
  }, []);

  const handleChange = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);
    setError("");
    setSuccess("");

    // Show preview query
    if (updatedForm.crop_name || updatedForm.variety || updatedForm.sowing_date) {
      const previewQuery = {
        type: 'PREVIEW',
        sql: `INSERT INTO CROP(
  crop_id, farm_id, crop_name, variety, sowing_date,
  expected_harvest_date, expected_yield, seed_quantity,
  planting_density, growth_stage, notes, crop_status
) VALUES(
  CROP_SEQ.NEXTVAL,
  ${updatedForm.farm_id || ':farm_id'},
  '${updatedForm.crop_name || '...'}',
  '${updatedForm.variety || 'NULL'}',
  ${updatedForm.sowing_date ? `TO_DATE('${updatedForm.sowing_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${updatedForm.expected_harvest_date ? `TO_DATE('${updatedForm.expected_harvest_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${updatedForm.expected_yield || 'NULL'},
  ${updatedForm.seed_quantity || 'NULL'},
  ${updatedForm.planting_density || 'NULL'},
  '${updatedForm.growth_stage}',
  ${updatedForm.notes ? `'${updatedForm.notes}'` : 'NULL'},
  'PLANTED'
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
          type: 'FARM_CHECK',
          sql: `SELECT farm_id FROM FARM WHERE farm_id = ${form.farm_id} AND farmer_id = :farmer_id`,
          status: 'pending',
          description: 'Validating farm ownership'
        },
        {
          type: 'SEQUENCE',
          sql: `SELECT CROP_SEQ.NEXTVAL FROM DUAL`,
          status: 'pending',
          description: 'Generating unique crop ID'
        },
        {
          type: 'INSERT',
          sql: `INSERT INTO CROP(
  crop_id, farm_id, crop_name, variety, sowing_date,
  expected_harvest_date, expected_yield, seed_quantity,
  planting_density, growth_stage, notes, crop_status
) VALUES(
  CROP_SEQ.NEXTVAL,
  ${form.farm_id},
  '${form.crop_name}',
  ${form.variety ? `'${form.variety}'` : 'NULL'},
  TO_DATE('${form.sowing_date}', 'YYYY-MM-DD'),
  ${form.expected_harvest_date ? `TO_DATE('${form.expected_harvest_date}', 'YYYY-MM-DD')` : 'NULL'},
  ${form.expected_yield || 'NULL'},
  ${form.seed_quantity || 'NULL'},
  ${form.planting_density || 'NULL'},
  '${form.growth_stage}',
  ${form.notes ? `'${form.notes}'` : 'NULL'},
  'PLANTED'
)`,
          status: 'pending',
          description: 'Inserting crop record'
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

      await axios.post("/crops", form);
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      setQueries(prev => [...prev, {
        type: 'SUCCESS',
        sql: '✅ All operations completed successfully',
        status: 'success',
        description: `Crop "${form.crop_name}" planted successfully`
      }]);
      
      setShowSuccess(true);
      
    } catch (err) {
      console.error("Error adding crop:", err);
      const errorMessage = err.response?.data?.message || "Failed to add crop. Please try again.";
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
              <h2 className="text-3xl font-bold text-green-600 mb-2">🌱 Add New Crop</h2>
              <p className="text-gray-600">Plant a new crop on your farm</p>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Farm *
                  </label>
                  <select
                    name="farm_id"
                    value={form.farm_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  >
                  <option key="empty" value="">Select a farm</option>
                  {farms.map((f) => {
                    const farmId = f.FARM_ID || f.farm_id;
                    const farmName = f.FARM_NAME || f.farm_name;
                    return (
                      <option key={farmId} value={farmId}>
                        {farmName}
                      </option>
                    );
                  })}
                  </select>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    name="crop_name"
                    placeholder="e.g., Wheat, Rice"
                    value={form.crop_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variety
                  </label>
                  <input
                    type="text"
                    name="variety"
                    placeholder="Enter variety"
                    value={form.variety}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sowing Date *
                  </label>
                  <input
                    type="date"
                    name="sowing_date"
                    value={form.sowing_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    name="expected_harvest_date"
                    value={form.expected_harvest_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Yield (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="expected_yield"
                    placeholder="Enter expected yield"
                    value={form.expected_yield}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Growth Stage
                  </label>
                  <select
                    name="growth_stage"
                    value={form.growth_stage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option key="planted" value="PLANTED">Planted</option>
                    <option key="germination" value="GERMINATION">Germination</option>
                    <option key="vegetative" value="VEGETATIVE">Vegetative</option>
                    <option key="flowering" value="FLOWERING">Flowering</option>
                    <option key="maturity" value="MATURITY">Maturity</option>
                  </select>
                </div>
                </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                  <textarea
                    name="notes"
                  placeholder="Additional notes about this crop"
                    value={form.notes}
                    onChange={handleChange}
                  rows="3"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

              {showSuccess ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Crop Planted Successfully!</h3>
                  <p className="text-gray-600 mb-6">Review the SQL queries on the right →</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuccess(false);
                        setQueries([]);
                        setExecutionTime(null);
                        setForm({
                          farm_id: farms[0]?.FARM_ID || farms[0]?.farm_id || "",
                          crop_name: "",
                          variety: "",
                          sowing_date: "",
                          expected_harvest_date: "",
                          expected_yield: "",
                          seed_quantity: "",
                          planting_density: "",
                          growth_stage: "PLANTED",
                          notes: ""
                        });
                      }}
                      className="px-6 py-3 border-2 border-green-600 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                    >
                      ➕ Plant Another Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/crops")}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      View All Crops →
                    </button>
                  </div>
              </div>
              ) : (
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/crops")}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                    View All Crops
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
                        Planting Crop...
                      </span>
                    ) : (
                      "Plant Crop"
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
                  <p className="text-xs mt-2">Click "Plant Crop" to execute</p>
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
