import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddCrop() {
  const navigate = useNavigate();
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
      await axios.post("/crops", form);
      setSuccess("✅ Crop added successfully!");
      setForm({
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
      setTimeout(() => navigate("/crops"), 2000);
    } catch (err) {
      console.error("Error adding crop:", err);
      const errorMessage = err.response?.data?.message || "Failed to add crop. Please try again.";
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
            <h2 className="text-3xl font-bold text-green-600 mb-2">🌾 Add New Crop</h2>
            <p className="text-gray-600">Record a new crop planting in your farm</p>
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
                  Crop Name *
                </label>
                <input
                  type="text"
                  name="crop_name"
                  placeholder="Enter crop name"
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
                  placeholder="Enter crop variety"
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
                  Seed Quantity (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="seed_quantity"
                  placeholder="Enter seed quantity"
                  value={form.seed_quantity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planting Density
                </label>
                <input
                  type="number"
                  name="planting_density"
                  placeholder="Enter planting density"
                  value={form.planting_density}
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
                  <option value="PLANTED">Planted</option>
                  <option value="GROWING">Growing</option>
                  <option value="MATURE">Mature</option>
                  <option value="HARVESTED">Harvested</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  placeholder="Enter any additional notes about the crop"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/crops")}
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
                    Adding Crop...
                  </span>
                ) : (
                  "Add Crop"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
