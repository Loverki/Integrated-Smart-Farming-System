import { useEffect, useState } from "react";
import axios from "axios";

export default function Fertilizers() {
  const [fertilizers, setFertilizers] = useState([]);
  const [formData, setFormData] = useState({
    farm_id: "",
    fertilizer_name: "",
    quantity_used: "",
    applied_date: "",
  });

  const fetchFertilizers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/fertilizers");
      setFertilizers(res.data);
    } catch (err) {
      console.error("Error fetching fertilizers:", err);
    }
  };

  const addFertilizer = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/fertilizers", formData);
      setFormData({ farm_id: "", fertilizer_name: "", quantity_used: "", applied_date: "" });
      fetchFertilizers();
    } catch (err) {
      console.error("Error adding fertilizer:", err);
    }
  };

  useEffect(() => {
    fetchFertilizers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-4">💧 Fertilizers</h2>

      {/* Add Fertilizer Form */}
      <form onSubmit={addFertilizer} className="flex flex-wrap gap-4 items-end mb-6 border-b pb-4">
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
          placeholder="Fertilizer Name"
          value={formData.fertilizer_name}
          onChange={(e) => setFormData({ ...formData, fertilizer_name: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="number"
          placeholder="Quantity Used"
          value={formData.quantity_used}
          onChange={(e) => setFormData({ ...formData, quantity_used: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="date"
          placeholder="Applied Date"
          value={formData.applied_date}
          onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ➕ Add Fertilizer
        </button>
      </form>

      {/* Fertilizers Table */}
      <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Farm ID</th>
            <th className="p-3 border">Fertilizer Name</th>
            <th className="p-3 border">Quantity Used</th>
            <th className="p-3 border">Applied Date</th>
          </tr>
        </thead>
        <tbody>
          {fertilizers.map((f, i) => (
            <tr key={i} className="hover:bg-green-50">
              <td className="p-3 border">{f[0]}</td>
              <td className="p-3 border">{f[1]}</td>
              <td className="p-3 border">{f[2]}</td>
              <td className="p-3 border">{f[3]}</td>
              <td className="p-3 border">{new Date(f[4]).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
