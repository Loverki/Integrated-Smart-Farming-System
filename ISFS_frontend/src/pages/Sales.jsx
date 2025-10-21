import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/sales");
      setSales(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to load sales. Please try again.");
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PARTIAL': return 'bg-orange-100 text-orange-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">💰 Sales Management</h1>
              <p className="text-lg mt-1 opacity-90">Track crop sales and revenue</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/add-sales")}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                ➕ Add Sale
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
            <h2 className="text-2xl font-bold text-gray-800">All Sales Records</h2>
            <button
              onClick={fetchSales}
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

          {loading && sales.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sales...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No sales recorded yet.</p>
              <button
                onClick={() => navigate("/add-sales")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Record First Sale
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border">ID</th>
                    <th className="p-3 border">Farm</th>
                    <th className="p-3 border">Crop</th>
                    <th className="p-3 border">Buyer Name</th>
                    <th className="p-3 border">Buyer Contact</th>
                    <th className="p-3 border">Quantity</th>
                    <th className="p-3 border">Price/Unit</th>
                    <th className="p-3 border">Total Amount</th>
                    <th className="p-3 border">Sale Date</th>
                    <th className="p-3 border">Payment Method</th>
                    <th className="p-3 border">Payment Status</th>
                    <th className="p-3 border">Invoice #</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => {
                    // Handle both object and array formats
                    const id = sale.SALE_ID || sale.sale_id || sale[0];
                    const farmId = sale.FARM_ID || sale.farm_id || sale[1];
                    const cropId = sale.CROP_ID || sale.crop_id || sale[2];
                    const buyerName = sale.BUYER_NAME || sale.buyer_name || sale[3];
                    const buyerContact = sale.BUYER_CONTACT || sale.buyer_contact || sale[4];
                    const quantity = sale.QUANTITY_SOLD || sale.quantity_sold || sale[5];
                    const unit = sale.UNIT || sale.unit || sale[6];
                    const pricePerUnit = sale.PRICE_PER_UNIT || sale.price_per_unit || sale[7];
                    const totalAmount = sale.TOTAL_AMOUNT || sale.total_amount || sale[8];
                    const saleDate = sale.SALE_DATE || sale.sale_date || sale[9];
                    const paymentMethod = sale.PAYMENT_METHOD || sale.payment_method || sale[10];
                    const paymentStatus = sale.PAYMENT_STATUS || sale.payment_status || sale[11];
                    const invoiceNumber = sale.INVOICE_NUMBER || sale.invoice_number || sale[12];
                    const farmName = sale.FARM_NAME || sale.farm_name || sale[14];
                    const cropName = sale.CROP_NAME || sale.crop_name || sale[15];

                    return (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{id}</td>
                        <td className="p-3 border">{farmName || `Farm #${farmId}` || '-'}</td>
                        <td className="p-3 border font-semibold">{cropName || `Crop #${cropId}` || '-'}</td>
                        <td className="p-3 border">{buyerName || '-'}</td>
                        <td className="p-3 border text-sm">{buyerContact || '-'}</td>
                        <td className="p-3 border">
                          {quantity} {unit || 'KG'}
                        </td>
                        <td className="p-3 border font-semibold text-green-700">
                          ₹{pricePerUnit ? parseFloat(pricePerUnit).toFixed(2) : '-'}
                        </td>
                        <td className="p-3 border font-bold text-green-800">
                          ₹{totalAmount ? parseFloat(totalAmount).toLocaleString() : '-'}
                        </td>
                        <td className="p-3 border text-sm">
                          {saleDate ? new Date(saleDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(paymentStatus)}`}>
                            {paymentStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3 border text-sm font-mono">{invoiceNumber || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <div>
                  Total Sales: <span className="font-semibold">{sales.length}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Paid: {sales.filter(s => (s.PAYMENT_STATUS || s.payment_status || s[11]) === 'PAID').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    Pending: {sales.filter(s => (s.PAYMENT_STATUS || s.payment_status || s[11]) === 'PENDING').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Partial: {sales.filter(s => (s.PAYMENT_STATUS || s.payment_status || s[11]) === 'PARTIAL').length}
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Overdue: {sales.filter(s => (s.PAYMENT_STATUS || s.payment_status || s[11]) === 'OVERDUE').length}
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
