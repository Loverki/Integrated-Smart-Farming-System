import { useEffect, useState } from "react";
import axios from "axios";

export default function Labours() {
  const [labours, setLabours] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    skill: "",
  });

  const fetchLabours = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/labours");
      setLabours(res.data);
    } catch (err) {
      console.error("Error fetching labours:", err);
    }
  };

  const addLabour = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/labours", formData);
      setFormData({ name: "", phone: "", skill: "" });
      fetchLabours();
    } catch (err) {
      console.error("Error adding labour:", err);
    }
  };

  useEffect(() => {
    fetchLabours();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-4">🧑‍🌾 Labours</h2>

      {/* Add Labour Form */}
      <form onSubmit={addLabour} className="flex flex-wrap gap-4 items-end mb-6 border-b pb-4">
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
          required
        />
        <input
          type="text"
          placeholder="Skill"
          value={formData.skill}
          onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ➕ Add Labour
        </button>
      </form>

      {/* Labours Table */}
      <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Skill</th>
          </tr>
        </thead>
        <tbody>
          {labours.map((l, i) => (
            <tr key={i} className="hover:bg-green-50">
              <td className="p-3 border">{l[0]}</td>
              <td className="p-3 border">{l[1]}</td>
              <td className="p-3 border">{l[2]}</td>
              <td className="p-3 border">{l[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
