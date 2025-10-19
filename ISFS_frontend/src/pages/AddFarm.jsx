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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await axios.post("/farms", formData);
      alert("✅ Farm added successfully!");
      setFormData({ 
        farm_name: "", 
        location: "", 
        area: "", 
        soil_type: "",
        soil_ph: "",
        irrigation_type: "",
        farm_type: "CONVENTIONAL"
      });
      navigate("/farms");
    } catch (err) {
      console.error("Error adding farm:", err);
      const errorMessage = err.response?.data?.message || "Failed to add farm. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
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
      </form>
        </div>
      </div>
    </div>
  );
}
