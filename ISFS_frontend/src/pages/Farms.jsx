import { useEffect, useState } from "react";
import axios from "axios";

export default function Farms() {
  const [farms, setFarms] = useState([]);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/farms");
        setFarms(res.data);
      } catch (err) {
        console.error("Error fetching farms:", err);
      }
    };
    fetchFarms();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-green-700 mb-4">🌾 Farms</h2>
      <table className="table-auto w-full border-collapse shadow-md rounded-lg overflow-hidden">
        <thead className="bg-green-600 text-white">
          <tr>
            <th>ID</th>
            <th>Farmer ID</th>
            <th>Location</th>
            <th>Area</th>
            <th>Soil Type</th>
          </tr>
        </thead>
        <tbody>
          {farms.map((farm, i) => (
            <tr key={i} className="hover:bg-green-50 text-center border-b">
              <td>{farm[0]}</td>
              <td>{farm[1]}</td>
              <td>{farm[2]}</td>
              <td>{farm[3]}</td>
              <td>{farm[4]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
