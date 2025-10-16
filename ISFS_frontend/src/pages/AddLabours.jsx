import React, { useState } from "react";
import axios from "axios";

export default function AddLabours() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    skill: ""
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
      await axios.post("http://localhost:5000/api/labours", form);
      setForm({ name: "", phone: "", skill: "" });
      setMessage("✅ Labour added successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add labour.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Add New Labour</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          name="skill"
          placeholder="Skill"
          value={form.skill}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Adding..." : "Add Labour"}
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
