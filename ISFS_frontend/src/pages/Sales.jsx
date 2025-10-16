import { useEffect, useState } from "react";
import axios from "axios";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    farm_id: "",
    crop_id: "",
    quantity_sold: "",
    price_per_unit: "",
    sale_date: "",
  });

  const fetchSales = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/sales");
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
    }
  };

  const addSale = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/sales", formData);
      setFormData({ farm_id: "", crop_id: "", quantity_sold: "", price_per_unit: "", sale_date: "" });
      fetchSales();
    } catch (err) {
      console.error("Error adding sale:", err);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-700 mb-4">💰 Sales</h2>

      {/* Add Sale Form */}
      <form onSubmit={addSale} className="flex flex-wrap gap-4 items-end mb-6 border-b pb-4">
        <input
          type="number"
          placeholder="Farm ID"
          value={formData.farm_id}
          onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="number"
          placeholder="Crop ID"
          value={formData.crop_id}
          onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="number"
          placeholder="Quantity Sold"
          value={formData.quantity_sold}
          onChange={(e) => setFormData({ ...formData, quantity_sold: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="number"
          placeholder="Price per Unit"
          value={formData.price_per_unit}
          onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <input
          type="date"
          placeholder="Sale Date"
          value={formData.sale_date}
          onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
          className="border rounded-lg px-4 py-2 flex-1"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          ➕ Add Sale
        </button>
      </form>

      {/* Sales Table */}
      <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
        <thead className="bg-green-100 text-green-800">
          <tr>
            <th className="p-3 border">ID</th>
            <th className="p-3 border">Farm ID</th>
            <th className="p-3 border">Crop ID</th>
            <th className="p-3 border">Quantity Sold</th>
            <th className="p-3 border">Price/Unit</th>
            <th className="p-3 border">Sale Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s, i) => (
            <tr key={i} className="hover:bg-green-50">
              <td className="p-3 border">{s[0]}</td>
              <td className="p-3 border">{s[1]}</td>
              <td className="p-3 border">{s[2]}</td>
              <td className="p-3 border">{s[3]}</td>
              <td className="p-3 border">{s[4]}</td>
              <td className="p-3 border">{new Date(s[5]).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
