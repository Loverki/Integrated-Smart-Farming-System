import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Labours() {
  const navigate = useNavigate();
  const [labours, setLabours] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    skill: "",
  });

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchLabours();
  }, [navigate]);

  const fetchLabours = async () => {
    try {
      const res = await axios.get("/labours");
      setLabours(res.data);
    } catch (err) {
      console.error("Error fetching labours:", err);
      // Handle 401 errors by redirecting to login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };

  const addLabour = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/labours", formData);
      setFormData({ name: "", phone: "", skill: "" });
      fetchLabours();
    } catch (err) {
      console.error("Error adding labour:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
  };


  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🧑‍🌾 Labour Management</h1>
              <p className="text-lg mt-1 opacity-90">Manage farm labour and track work hours</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
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
      </div>
    </div>
  );
}
