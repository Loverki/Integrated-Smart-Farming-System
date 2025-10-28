import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate, useParams } from "react-router-dom";

export default function EditCrop() {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const [form, setForm] = useState({
    crop_name: "",
    variety: "",
    sowing_date: "",
    expected_harvest_date: "",
    actual_harvest_date: "",
    expected_yield: "",
    actual_yield: "",
    seed_quantity: "",
    planting_density: "",
    growth_stage: "",
    crop_status: "",
    notes: ""
  });
  const [farmName, setFarmName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCrop();
  }, [cropId]);

  const fetchCrop = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/crops/${cropId}`);
      const crop = response.data;
      
      // Format dates for input fields (YYYY-MM-DD)
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setForm({
        crop_name: crop.CROP_NAME || crop.crop_name || "",
        variety: crop.VARIETY || crop.variety || "",
        sowing_date: formatDate(crop.SOWING_DATE || crop.sowing_date),
        expected_harvest_date: formatDate(crop.EXPECTED_HARVEST_DATE || crop.expected_harvest_date),
        actual_harvest_date: formatDate(crop.ACTUAL_HARVEST_DATE || crop.actual_harvest_date),
        expected_yield: crop.EXPECTED_YIELD || crop.expected_yield || "",
        actual_yield: crop.ACTUAL_YIELD || crop.actual_yield || "",
        seed_quantity: crop.SEED_QUANTITY || crop.seed_quantity || "",
        planting_density: crop.PLANTING_DENSITY || crop.planting_density || "",
        growth_stage: crop.GROWTH_STAGE || crop.growth_stage || "",
        crop_status: crop.CROP_STATUS || crop.crop_status || "",
        notes: crop.NOTES || crop.notes || ""
      });
      
      setFarmName(crop.FARM_NAME || crop.farm_name || "");
      setError("");
    } catch (err) {
      console.error("Error fetching crop:", err);
      setError("Failed to load crop details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Date validation
    if (!form.sowing_date) {
      setError("Sowing date is required");
      return;
    }
    
    const sowingDate = new Date(form.sowing_date);
    
    if (form.expected_harvest_date) {
      const expectedHarvestDate = new Date(form.expected_harvest_date);
      if (expectedHarvestDate <= sowingDate) {
        setError("Expected harvest date must be after the sowing date");
        return;
      }
    }
    
    if (form.actual_harvest_date) {
      const actualHarvestDate = new Date(form.actual_harvest_date);
      if (actualHarvestDate <= sowingDate) {
        setError("Actual harvest date must be after the sowing date");
        return;
      }
    }
    
    setSaving(true);

    try {
      await axios.put(`/crops/${cropId}`, form);
      setSuccess("Crop updated successfully!");
      setTimeout(() => {
        navigate("/crops");
      }, 1500);
    } catch (err) {
      console.error("Error updating crop:", err);
      const errorMessage = err.response?.data?.message || "Failed to update crop. Please try again.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading crop details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-green-600 mb-2">✏️ Edit Crop</h2>
            <p className="text-gray-600">Update crop information and harvest details</p>
            {farmName && (
              <p className="text-sm text-gray-500 mt-2">
                Farm: <span className="font-semibold text-blue-600">{farmName}</span>
              </p>
            )}
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
            {/* Basic Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Name *
                  </label>
                  <input
                    type="text"
                    name="crop_name"
                    value={form.crop_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variety
                  </label>
                  <input
                    type="text"
                    name="variety"
                    value={form.variety}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seed Quantity (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="seed_quantity"
                    value={form.seed_quantity}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Planting Density
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="planting_density"
                    value={form.planting_density}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Date Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    disabled={saving}
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
                    min={form.sowing_date}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be after sowing date</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Harvest Date
                  </label>
                  <input
                    type="date"
                    name="actual_harvest_date"
                    value={form.actual_harvest_date}
                    onChange={handleChange}
                    min={form.sowing_date}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-yellow-50"
                    disabled={saving}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be after sowing date</p>
                </div>
              </div>
            </div>

            {/* Yield Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Yield Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Yield (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="expected_yield"
                    value={form.expected_yield}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Yield (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="actual_yield"
                    value={form.actual_yield}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-yellow-50"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Growth Stage
                  </label>
                  <select
                    name="growth_stage"
                    value={form.growth_stage}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  >
                    <option value="">Select growth stage</option>
                    <option value="PLANTED">Planted</option>
                    <option value="GERMINATION">Germination</option>
                    <option value="VEGETATIVE">Vegetative</option>
                    <option value="FLOWERING">Flowering</option>
                    <option value="MATURITY">Maturity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Status
                  </label>
                  <select
                    name="crop_status"
                    value={form.crop_status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={saving}
                  >
                    <option value="PLANTED">Planted</option>
                    <option value="GROWING">Growing</option>
                    <option value="MATURE">Mature</option>
                    <option value="HARVESTED">Harvested</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                disabled={saving}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/crops")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Editing Crops</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Fill in <strong>Actual Harvest Date</strong> when you harvest the crop</li>
            <li>• Update <strong>Actual Yield</strong> with the final harvested amount</li>
            <li>• Change <strong>Crop Status</strong> to "HARVESTED" after harvesting</li>
            <li>• Keep <strong>Growth Stage</strong> updated as the crop develops</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

