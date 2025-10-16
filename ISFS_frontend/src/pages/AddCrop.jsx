import React, { useState } from "react";
import axios from "axios";

export default function AddCrop() {
  const [form, setForm] = useState({
    farm_id: "",
    crop_name: "",
    sowing_date: "",
    harvesting_date: "",
    expected_yield: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/crops", form);
      setForm({
        farm_id: "",
        crop_name: "",
        sowing_date: "",
        harvesting_date: "",
        expected_yield: ""
      });
      setMessage("✅ Crop added successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add crop.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Add New Crop</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          name="farm_id"
          placeholder="Farm ID"
          value={form.farm_id}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="text"
          name="crop_name"
          placeholder="Crop Name"
          value={form.crop_name}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="date"
          name="sowing_date"
          value={form.sowing_date}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="date"
          name="harvesting_date"
          value={form.harvesting_date}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="number"
          name="expected_yield"
          placeholder="Expected Yield"
          value={form.expected_yield}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Adding..." : "Add Crop"}
        </button>
      </form>
      {message && (
        <p className={`mt-4 font-semibold ${message.includes("✅") ? "text-green-700" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
