import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddFertilizers() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    farm_id: "",
    fertilizer_name: "",
    fertilizer_type: "INORGANIC",
    quantity_used: "",
    unit: "KG",
    applied_date: "",
    cost_per_unit: "",
    total_cost: "",
    applied_by: "",
    crop_id: "",
    application_method: "",
    effectiveness_rating: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      await axios.post("/fertilizers", form);
      setSuccess("✅ Fertilizer added successfully!");
      setForm({
        farm_id: "",
        fertilizer_name: "",
        fertilizer_type: "INORGANIC",
        quantity_used: "",
        unit: "KG",
        applied_date: "",
        cost_per_unit: "",
        total_cost: "",
        applied_by: "",
        crop_id: "",
        application_method: "",
        effectiveness_rating: ""
      });
      setTimeout(() => navigate("/fertilizers"), 2000);
    } catch (err) {
      console.error("Error adding fertilizer:", err);
      const errorMessage = err.response?.data?.message || "Failed to add fertilizer. Please try again.";
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
            <h2 className="text-3xl font-bold text-green-600 mb-2">🧪 Add New Fertilizer</h2>
            <p className="text-gray-600">Record fertilizer application in your farm</p>
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
                  Farm ID *
                </label>
                <input
                  type="number"
                  name="farm_id"
                  placeholder="Enter farm ID"
                  value={form.farm_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fertilizer Name *
                </label>
                <input
                  type="text"
                  name="fertilizer_name"
                  placeholder="Enter fertilizer name"
                  value={form.fertilizer_name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fertilizer Type
                </label>
                <select
                  name="fertilizer_type"
                  value={form.fertilizer_type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="INORGANIC">Inorganic</option>
                  <option value="ORGANIC">Organic</option>
                  <option value="BIO_FERTILIZER">Bio Fertilizer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Used *
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="quantity_used"
                  placeholder="Enter quantity used"
                  value={form.quantity_used}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="KG">Kilograms (KG)</option>
                  <option value="LITERS">Liters</option>
                  <option value="BAGS">Bags</option>
                  <option value="TONS">Tons</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applied Date *
                </label>
                <input
                  type="date"
                  name="applied_date"
                  value={form.applied_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Per Unit (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="cost_per_unit"
                  placeholder="Enter cost per unit"
                  value={form.cost_per_unit}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="total_cost"
                  placeholder="Enter total cost"
                  value={form.total_cost}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Applied By
                </label>
                <input
                  type="text"
                  name="applied_by"
                  placeholder="Enter name of person who applied"
                  value={form.applied_by}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop ID
                </label>
                <input
                  type="number"
                  name="crop_id"
                  placeholder="Enter crop ID (optional)"
                  value={form.crop_id}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Method
                </label>
                <select
                  name="application_method"
                  value={form.application_method}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="">Select method</option>
                  <option value="Broadcast">Broadcast</option>
                  <option value="Side Dressing">Side Dressing</option>
                  <option value="Foliar Spray">Foliar Spray</option>
                  <option value="Fertigation">Fertigation</option>
                  <option value="Band Application">Band Application</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effectiveness Rating (1-5)
                </label>
                <select
                  name="effectiveness_rating"
                  value={form.effectiveness_rating}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                >
                  <option value="">Select rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/fertilizers")}
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
                    Adding Fertilizer...
                  </span>
                ) : (
                  "Add Fertilizer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
