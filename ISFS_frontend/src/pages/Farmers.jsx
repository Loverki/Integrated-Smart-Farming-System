import { useEffect, useState } from "react";
import axios from "axios";

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  const fetchFarmers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/farmers");
      setFarmers(res.data);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    }
  };

  const addFarmer = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/farmers", formData);
      setFormData({ name: "", phone: "", address: "" });
      fetchFarmers();
    } catch (err) {
      console.error("Error adding farmer:", err);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-4">👨‍🌾 Farmers</h2>

      {/* Add Farmer Form */}
      <form
        onSubmit={addFarmer}
        className="flex flex-wrap gap-4 items-end mb-6 border-b pb-4"
      >
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ➕ Add Farmer
        </button>
      </form>

      {/* Farmers Table */}
      <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Address</th>
            <th className="p-3 border">Reg Date</th>
          </tr>
        </thead>
        <tbody>
          {farmers.map((f, i) => (
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
