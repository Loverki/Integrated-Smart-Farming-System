import React, { useState } from "react";
import { addFarmer } from "../api";

const AddFarmer = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addFarmer({ name, phone, address });
      setName(""); setPhone(""); setAddress("");
      onSuccess();
    } catch (err) {
      console.error("Error adding farmer:", err);
      alert("Failed to add farmer!");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300">
      <h2 className="text-2xl font-semibold mb-5 text-green-700">Add New Farmer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-green-400"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition"
        >
          {loading ? "Adding..." : "Add Farmer"}
        </button>
      </form>
    </div>
  );
};

export default AddFarmer;
