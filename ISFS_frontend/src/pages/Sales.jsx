import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import SQLQueryVisualizer from "../components/SQLQueryVisualizer";

export default function Sales() {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateModal, setUpdateModal] = useState({ show: false, sale: null });
  const [updating, setUpdating] = useState(false);
  const [updateQueries, setUpdateQueries] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");

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

  const handleUpdateClick = (sale) => {
    const currentStatus = sale.PAYMENT_STATUS || sale.payment_status || sale[11] || 'PENDING';
    setUpdateModal({ show: true, sale });
    setNewStatus(currentStatus);
    setUpdateQueries([]);
    setSuccessMessage("");
  };

  const confirmUpdate = async () => {
    if (!updateModal.sale) return;

    const saleId = updateModal.sale.SALE_ID || updateModal.sale.sale_id || updateModal.sale[0];
    const buyerName = updateModal.sale.BUYER_NAME || updateModal.sale.buyer_name || updateModal.sale[3];
    const oldStatus = updateModal.sale.PAYMENT_STATUS || updateModal.sale.payment_status || updateModal.sale[11] || 'PENDING';

    if (newStatus === oldStatus) {
      setError("New status must be different from current status");
      return;
    }

    setUpdating(true);
    setUpdateQueries([
      {
        query: "Validating sale ownership...",
        status: "executing",
        description: "Checking if sale belongs to farmer"
      },
      {
        query: "Updating payment status...",
        status: "pending",
        description: "Changing payment status"
      }
    ]);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUpdateQueries([
        {
          query: `SELECT s.sale_id, s.payment_status as old_status, s.buyer_name
FROM SALES s
JOIN FARM f ON s.farm_id = f.farm_id
WHERE s.sale_id = ${saleId} AND f.farmer_id = :farmer_id`,
          status: "success",
          description: "Sale ownership verified"
        },
        {
          query: "Updating payment status...",
          status: "executing",
          description: "Changing payment status"
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 500));

      await axios.put(`/sales/${saleId}/payment-status`, { payment_status: newStatus });

      setUpdateQueries([
        {
          query: `SELECT s.sale_id, s.payment_status as old_status, s.buyer_name
FROM SALES s
JOIN FARM f ON s.farm_id = f.farm_id
WHERE s.sale_id = ${saleId} AND f.farmer_id = :farmer_id`,
          status: "success",
          description: "Sale ownership verified"
        },
        {
          query: `UPDATE SALES
SET payment_status = '${newStatus}'
WHERE sale_id = ${saleId}`,
          status: "success",
          description: `Payment status updated from "${oldStatus}" to "${newStatus}" for buyer "${buyerName}"`
        }
      ]);

      setSuccessMessage(`Payment status updated successfully!`);
      
      // Refresh the sales list
      await fetchSales();
      
      // Close modal after short delay
      setTimeout(() => {
        setUpdateModal({ show: false, sale: null });
        setSuccessMessage("");
      }, 2000);

    } catch (err) {
      console.error("Error updating payment status:", err);
      setError(err.response?.data?.message || "Failed to update payment status");
      setUpdateQueries(prev => prev.map(q => ({ ...q, status: "error" })));
    } finally {
      setUpdating(false);
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
                className="group bg-green-800 hover:bg-green-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Sale
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-green-800 hover:bg-green-900 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
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
                    <th className="p-3 border">Buyer Name</th>
                    <th className="p-3 border">Crop</th>
                    <th className="p-3 border">Quantity</th>
                    <th className="p-3 border">Total Amount</th>
                    <th className="p-3 border">Sale Date</th>
                    <th className="p-3 border">Payment Status</th>
                    <th className="p-3 border">Actions</th>
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
                        <td className="p-3 border">
                          <div className="font-semibold">{buyerName || '-'}</div>
                          <div className="text-xs text-gray-600">{buyerContact || '-'}</div>
                        </td>
                        <td className="p-3 border">
                          <div className="font-semibold">{cropName || `Crop #${cropId}` || '-'}</div>
                          <div className="text-xs text-gray-600">{farmName || `Farm #${farmId}` || '-'}</div>
                        </td>
                        <td className="p-3 border">
                          <div className="font-semibold">{quantity} {unit || 'KG'}</div>
                          <div className="text-xs text-gray-600">₹{pricePerUnit ? parseFloat(pricePerUnit).toFixed(2) : '-'}/unit</div>
                        </td>
                        <td className="p-3 border font-bold text-green-800">
                          ₹{totalAmount ? parseFloat(totalAmount).toLocaleString() : '-'}
                        </td>
                        <td className="p-3 border text-sm">
                          {saleDate ? new Date(saleDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(paymentStatus)}`}>
                            {paymentStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/sales/${id}/edit`)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleUpdateClick(sale)}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors text-sm font-semibold flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Update Status
                            </button>
                          </div>
                        </td>
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

      {/* Update Payment Status Modal */}
      {updateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !updating && setUpdateModal({ show: false, sale: null })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <h3 className="text-2xl font-bold">Update Payment Status</h3>
                  <p className="text-sm opacity-90 mt-1">Change the payment status for this sale</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {successMessage ? (
                <div className="bg-green-50 border-2 border-green-500 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3 mb-4">
                  <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">{successMessage}</span>
                </div>
              ) : (
                <>
                  {/* Sale Details */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Sale Details</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Buyer:</span>
                        <div className="font-semibold">{updateModal.sale?.BUYER_NAME || updateModal.sale?.buyer_name || updateModal.sale?.[3]}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Crop:</span>
                        <div className="font-semibold">{updateModal.sale?.CROP_NAME || updateModal.sale?.crop_name || updateModal.sale?.[15] || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <div className="font-semibold text-green-700">
                          ₹{(updateModal.sale?.TOTAL_AMOUNT || updateModal.sale?.total_amount || updateModal.sale?.[8] || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Current Status:</span>
                        <div>
                          <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusColor(updateModal.sale?.PAYMENT_STATUS || updateModal.sale?.payment_status || updateModal.sale?.[11])}`}>
                            {updateModal.sale?.PAYMENT_STATUS || updateModal.sale?.payment_status || updateModal.sale?.[11] || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Payment Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={updating}
                    >
                      <option value="PENDING">PENDING - Payment not yet received</option>
                      <option value="PARTIAL">PARTIAL - Partial payment received</option>
                      <option value="PAID">PAID - Full payment received</option>
                      <option value="OVERDUE">OVERDUE - Payment overdue</option>
                    </select>
                  </div>

                  {/* SQL Visualization */}
                  {updateQueries.length > 0 && (
                    <div className="mb-4">
                      <SQLQueryVisualizer 
                        queries={updateQueries}
                      />
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Note
                    </h4>
                    <p className="text-sm text-blue-800">
                      This will update the payment status in the database. The change will be reflected immediately in your sales records.
                    </p>
                  </div>
                </>
              )}
            </div>

            {!successMessage && (
              <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                <button
                  onClick={() => setUpdateModal({ show: false, sale: null })}
                  disabled={updating}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdate}
                  disabled={updating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Status
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
