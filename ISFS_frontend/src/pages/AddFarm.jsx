import { useState } from "react";
import axios from "axios";

export default function AddFarm() {
  const [formData, setFormData] = useState({
    farmer_id: "",
    location: "",
    area: "",
    soil_type: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/farms", formData);
      alert("✅ Farm added successfully!");
      setFormData({ farmer_id: "", location: "", area: "", soil_type: "" });
    } catch (err) {
      console.error("Error adding farm:", err);
      alert("❌ Failed to add farm");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg max-w-lg mx-auto mt-8">
      <h2 className="text-2xl font-semibold text-green-600 mb-4">Add Farm</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="input" name="farmer_id" placeholder="Farmer ID" onChange={handleChange} value={formData.farmer_id} required />
        <input className="input" name="location" placeholder="Location" onChange={handleChange} value={formData.location} required />
        <input className="input" name="area" placeholder="Area" onChange={handleChange} value={formData.area} required />
        <input className="input" name="soil_type" placeholder="Soil Type" onChange={handleChange} value={formData.soil_type} />
        <button type="submit" className="btn">Add Farm</button>
      </form>
    </div>
  );
}
