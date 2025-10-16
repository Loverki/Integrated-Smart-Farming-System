import { useEffect, useState } from "react";
import axios from "axios";

export default function Crops() {
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    farm_id: "",
    crop_name: "",
    sowing_date: "",
    harvesting_date: "",
    expected_yield: "",
  });

  const fetchCrops = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/crops");
      setCrops(res.data);
    } catch (err) {
      console.error("Error fetching crops:", err);
    }
  };

  const addCrop = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/crops", formData);
      setFormData({
        farm_id: "",
        crop_name: "",
        sowing_date: "",
        harvesting_date: "",
        expected_yield: "",
      });
      fetchCrops();
    } catch (err) {
      console.error("Error adding crop:", err);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🌾 Crops</h2>

      {/* Add Crop Form */}
      <form onSubmit={addCrop} className="flex flex-wrap gap-4 items-end mb-6 border-b pb-4">
        <input
          type="number"
          placeholder="Farm ID"
          value={formData.farm_id}
          onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="text"
          placeholder="Crop Name"
          value={formData.crop_name}
          onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="date"
          placeholder="Sowing Date"
          value={formData.sowing_date}
          onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="date"
          placeholder="Harvesting Date"
          value={formData.harvesting_date}
          onChange={(e) => setFormData({ ...formData, harvesting_date: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="number"
          placeholder="Expected Yield"
          value={formData.expected_yield}
          onChange={(e) => setFormData({ ...formData, expected_yield: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ➕ Add Crop
        </button>
      </form>

      {/* Crops Table */}
      <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Farm ID</th>
            <th className="p-3 border">Crop Name</th>
            <th className="p-3 border">Sowing Date</th>
            <th className="p-3 border">Harvesting Date</th>
            <th className="p-3 border">Expected Yield</th>
          </tr>
        </thead>
        <tbody>
          {crops.map((c, i) => (
            <tr key={i} className="hover:bg-green-50">
              <td className="p-3 border">{c[0]}</td>
              <td className="p-3 border">{c[1]}</td>
              <td className="p-3 border">{c[2]}</td>
              <td className="p-3 border">{new Date(c[3]).toLocaleDateString()}</td>
              <td className="p-3 border">{new Date(c[4]).toLocaleDateString()}</td>
              <td className="p-3 border">{c[5]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
