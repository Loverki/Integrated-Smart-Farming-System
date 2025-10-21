import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Equipment() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/equipment");
      setEquipment(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching equipment:", err);
      setError("Failed to load equipment. Please try again.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPERATIONAL': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'REPAIR': return 'bg-orange-100 text-orange-800';
      case 'RETIRED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const isMaintenanceDue = (nextDate) => {
    if (!nextDate) return false;
    const today = new Date();
    const maintenanceDate = new Date(nextDate);
    const daysUntil = Math.ceil((maintenanceDate - today) / (1000 * 60 * 60 * 24));
    return daysUntil <= 7 && daysUntil >= 0;
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">🚜 Equipment Management</h1>
              <p className="text-lg mt-1 opacity-90">Manage farm machinery and equipment</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-equipment")}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                ➕ Add Equipment
              </button>
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

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Equipment & Machinery</h2>
            <button
              onClick={fetchEquipment}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              disabled={loading}
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading && equipment.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading equipment...</p>
            </div>
          ) : equipment.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No equipment registered yet.</p>
              <button
                onClick={() => navigate("/add-equipment")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add First Equipment
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border">ID</th>
                    <th className="p-3 border">Equipment Name</th>
                    <th className="p-3 border">Type</th>
                    <th className="p-3 border">Brand/Model</th>
                    <th className="p-3 border">Purchase Date</th>
                    <th className="p-3 border">Purchase Cost</th>
                    <th className="p-3 border">Current Value</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Next Maintenance</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((eq, index) => {
                    // Handle both object and array formats
                    const id = eq.EQUIPMENT_ID || eq.equipment_id || eq[0];
                    const name = eq.EQUIPMENT_NAME || eq.equipment_name || eq[1];
                    const type = eq.EQUIPMENT_TYPE || eq.equipment_type || eq[2];
                    const brand = eq.BRAND || eq.brand || eq[3];
                    const model = eq.MODEL || eq.model || eq[4];
                    const purchaseDate = eq.PURCHASE_DATE || eq.purchase_date || eq[5];
                    const purchaseCost = eq.PURCHASE_COST || eq.purchase_cost || eq[6];
                    const currentValue = eq.CURRENT_VALUE || eq.current_value || eq[7];
                    const status = eq.STATUS || eq.status || eq[8];
                    const nextMaintenance = eq.NEXT_MAINTENANCE_DATE || eq.next_maintenance_date || eq[10];

                    const maintenanceDue = isMaintenanceDue(nextMaintenance);

                    return (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{id}</td>
                        <td className="p-3 border font-semibold">{name}</td>
                        <td className="p-3 border">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {type}
                          </span>
                        </td>
                        <td className="p-3 border text-sm">
                          {brand && model ? `${brand} ${model}` : brand || model || '-'}
                        </td>
                        <td className="p-3 border text-sm">
                          {purchaseDate ? new Date(purchaseDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border font-semibold text-green-700">
                          {purchaseCost ? `₹${parseFloat(purchaseCost).toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 border font-semibold text-blue-700">
                          {currentValue ? `₹${parseFloat(currentValue).toLocaleString()}` : '-'}
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(status)}`}>
                            {status || 'OPERATIONAL'}
                          </span>
                        </td>
                        <td className="p-3 border text-sm">
                          {nextMaintenance ? (
                            <div className="flex items-center">
                              <span className={maintenanceDue ? 'text-orange-600 font-semibold' : ''}>
                                {new Date(nextMaintenance).toLocaleDateString()}
                              </span>
                              {maintenanceDue && (
                                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs">
                                  Due Soon!
                                </span>
                              )}
                            </div>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>
                  Total Equipment: <span className="font-semibold">{equipment.length}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Operational: {equipment.filter(e => (e.STATUS || e.status || e[8]) === 'OPERATIONAL').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Maintenance: {equipment.filter(e => (e.STATUS || e.status || e[8]) === 'MAINTENANCE').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Repair: {equipment.filter(e => (e.STATUS || e.status || e[8]) === 'REPAIR').length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

