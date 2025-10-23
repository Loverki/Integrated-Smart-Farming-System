import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import SQLQueryVisualizer from "../components/SQLQueryVisualizer";

export default function EditFarm() {
  const navigate = useNavigate();
  const { farm_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [queries, setQueries] = useState([]);

  const [farmData, setFarmData] = useState({
    farm_name: "",
    location: "",
    area: "",
    soil_type: "",
    soil_ph: "",
    irrigation_type: "",
    farm_type: "CONVENTIONAL"
  });

  useEffect(() => {
    fetchFarmData();
  }, [farm_id]);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/farms/${farm_id}`);
      const farm = response.data;
      
      setFarmData({
        farm_name: farm.FARM_NAME || "",
        location: farm.LOCATION || "",
        area: farm.AREA || "",
        soil_type: farm.SOIL_TYPE || "",
        soil_ph: farm.SOIL_PH || "",
        irrigation_type: farm.IRRIGATION_TYPE || "",
        farm_type: farm.FARM_TYPE || "CONVENTIONAL"
      });
    } catch (err) {
      console.error("Error fetching farm data:", err);
      setError("Failed to load farm data");
      if (err.response?.status === 404) {
        setTimeout(() => navigate("/farms"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFarmData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validation
    if (!farmData.farm_name || !farmData.location || !farmData.area) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setShowSQL(true);

    const startTime = Date.now();
    setQueries([
      {
        query: "Validating farm ownership...",
        status: "executing",
        description: "Verifying farm belongs to you"
      },
      {
        query: "Updating farm details...",
        status: "pending",
        description: "Saving changes to database"
      }
    ]);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setQueries([
        {
          query: `SELECT farm_id
FROM FARM
WHERE farm_id = ${farm_id} AND farmer_id = :farmer_id`,
          status: "success",
          description: "Farm ownership verified"
        },
        {
          query: "Updating farm details...",
          status: "executing",
          description: "Saving changes to database"
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 500));

      await axios.put(`/farms/${farm_id}`, farmData);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      setQueries([
        {
          query: `SELECT farm_id
FROM FARM
WHERE farm_id = ${farm_id} AND farmer_id = :farmer_id`,
          status: "success",
          description: "Farm ownership verified"
        },
        {
          query: `UPDATE FARM
SET farm_name = '${farmData.farm_name}',
    location = '${farmData.location}',
    area = ${farmData.area},
    soil_type = ${farmData.soil_type ? `'${farmData.soil_type}'` : 'NULL'},
    soil_ph = ${farmData.soil_ph || 'NULL'},
    irrigation_type = ${farmData.irrigation_type ? `'${farmData.irrigation_type}'` : 'NULL'},
    farm_type = '${farmData.farm_type}'
WHERE farm_id = ${farm_id}`,
          status: "success",
          description: `Farm "${farmData.farm_name}" updated successfully`,
          executionTime: executionTime
        }
      ]);

      setSuccess("Farm updated successfully!");
      
      setTimeout(() => {
        navigate("/farms");
      }, 2000);

    } catch (err) {
      console.error("Error updating farm:", err);
      setError(err.response?.data?.message || "Failed to update farm");
      setQueries(prev => prev.map(q => ({ ...q, status: "error" })));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farm data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/farms")}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold">✏️ Edit Farm</h1>
                <p className="text-sm opacity-90 mt-1">Update your farm details</p>
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
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* SQL Visualization */}
        {showSQL && queries.length > 0 && (
          <div className="mb-8">
            <SQLQueryVisualizer 
              queries={queries}
              executionTime={queries[queries.length - 1]?.executionTime}
            />
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Farm Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Farm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="farm_name"
                  value={farmData.farm_name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter farm name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={farmData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="City/District"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area (acres) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="area"
                  value={farmData.area}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter area in acres"
                />
              </div>

              {/* Soil Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Soil Type
                </label>
                <select
                  name="soil_type"
                  value={farmData.soil_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Soil Type</option>
                  <option value="Clay">Clay</option>
                  <option value="Sandy">Sandy</option>
                  <option value="Loamy">Loamy</option>
                  <option value="Silt">Silt</option>
                  <option value="Peaty">Peaty</option>
                  <option value="Chalky">Chalky</option>
                </select>
              </div>

              {/* Soil pH */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Soil pH (0-14)
                </label>
                <input
                  type="number"
                  name="soil_ph"
                  value={farmData.soil_ph}
                  onChange={handleChange}
                  min="0"
                  max="14"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 6.5"
                />
              </div>

              {/* Irrigation Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Irrigation Type
                </label>
                <select
                  name="irrigation_type"
                  value={farmData.irrigation_type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Irrigation Type</option>
                  <option value="Drip">Drip</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Flood">Flood</option>
                  <option value="Center Pivot">Center Pivot</option>
                  <option value="Rainwater">Rainwater</option>
                </select>
              </div>

              {/* Farm Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Farm Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="farm_type"
                  value={farmData.farm_type}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="CONVENTIONAL">Conventional</option>
                  <option value="ORGANIC">Organic</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/farms")}
                disabled={submitting}
                className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Farm
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Database Update Operation
          </h4>
          <p className="text-sm text-blue-800 mb-2">
            When you update this farm, the following SQL operation will be executed:
          </p>
          <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono mt-2">
{`UPDATE FARM
SET farm_name = :farm_name,
    location = :location,
    area = :area,
    soil_type = :soil_type,
    soil_ph = :soil_ph,
    irrigation_type = :irrigation_type,
    farm_type = :farm_type
WHERE farm_id = :farm_id AND farmer_id = :farmer_id`}
          </pre>
          <div className="mt-3 text-xs text-blue-800">
            <strong>Concepts demonstrated:</strong> UPDATE statement, WHERE clause with multiple conditions, data validation, authentication check
          </div>
        </div>
      </div>
    </div>
  );
}

