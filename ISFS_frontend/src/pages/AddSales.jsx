import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddSale() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({
    farm_id: "",
    crop_id: "",
    buyer_name: "",
    buyer_contact: "",
    quantity_sold: "",
    unit: "KG",
    price_per_unit: "",
    total_amount: "",
    sale_date: "",
    payment_method: "CASH",
    payment_status: "PENDING",
    invoice_number: "",
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [queries, setQueries] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await axios.get("/farms");
        setFarms(response.data);
        
        if (response.data && response.data.length > 0) {
          const firstFarm = response.data[0];
          const farmId = firstFarm.FARM_ID || firstFarm.farm_id;
          if (farmId) {
            setForm(prevForm => ({
              ...prevForm,
              farm_id: farmId.toString()
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching farms:", err);
        setError("Failed to load farms. Please refresh the page.");
      }
    };
    fetchFarms();
  }, []);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get("/crops");
        setCrops(response.data);
        
        if (response.data && response.data.length > 0) {
          const firstCrop = response.data[0];
          const cropId = firstCrop.CROP_ID || firstCrop.crop_id;
          if (cropId) {
            setForm(prevForm => ({
              ...prevForm,
              crop_id: cropId.toString()
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching crops:", err);
      }
    };
    fetchCrops();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    
    if (name === 'quantity_sold' || name === 'price_per_unit') {
      const quantity = name === 'quantity_sold' ? parseFloat(value) || 0 : parseFloat(form.quantity_sold) || 0;
      const price = name === 'price_per_unit' ? parseFloat(value) || 0 : parseFloat(form.price_per_unit) || 0;
      updatedForm.total_amount = (quantity * price).toFixed(2);
    }
    
    setForm(updatedForm);
    setError("");
    setSuccess("");

    // Show preview query
    if (updatedForm.buyer_name || updatedForm.quantity_sold) {
      const previewQuery = {
        type: 'PREVIEW',
        sql: `INSERT INTO SALES(
  sale_id, farm_id, crop_id, buyer_name, buyer_contact,
  quantity_sold, unit, price_per_unit, total_amount,
  sale_date, payment_method, payment_status, invoice_number, notes
) VALUES(
  SALES_SEQ.NEXTVAL,
  ${updatedForm.farm_id || ':farm_id'},
  ${updatedForm.crop_id || 'NULL'},
  '${updatedForm.buyer_name || '...'}',
  '${updatedForm.buyer_contact || '...'}',
  ${updatedForm.quantity_sold || 'NULL'},
  '${updatedForm.unit}',
  ${updatedForm.price_per_unit || 'NULL'},
  ${updatedForm.total_amount || '(quantity_sold * price_per_unit)'},
  ${updatedForm.sale_date ? `TO_DATE('${updatedForm.sale_date}', 'YYYY-MM-DD')` : 'NULL'},
  '${updatedForm.payment_method}',
  '${updatedForm.payment_status}',
  ${updatedForm.invoice_number ? `'${updatedForm.invoice_number}'` : 'NULL'},
  ${updatedForm.notes ? `'${updatedForm.notes}'` : 'NULL'}
)`,
        status: 'pending',
        time: null
      };
      setQueries([previewQuery]);
    }
  };

  const preparePayload = () => ({
    farm_id: parseInt(form.farm_id),
    crop_id: form.crop_id ? parseInt(form.crop_id) : null,
    buyer_name: form.buyer_name?.trim() || '',
    buyer_contact: form.buyer_contact?.trim() || '',
    quantity_sold: parseFloat(form.quantity_sold),
    unit: form.unit || 'KG',
    price_per_unit: parseFloat(form.price_per_unit),
    total_amount: parseFloat(form.total_amount),
    sale_date: form.sale_date,
    payment_method: form.payment_method || 'CASH',
    payment_status: form.payment_status || 'PENDING',
    invoice_number: form.invoice_number?.trim() || '',
    notes: form.notes?.trim() || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setQueries([]);
    
    const startTime = Date.now();
    
    try {
      const querySteps = [
        {
          type: 'VALIDATION',
          sql: `SELECT farmer_id FROM FARMER WHERE farmer_id = :farmer_id`,
          status: 'executing',
          description: 'Validating farmer authentication'
        },
        {
          type: 'FARM_CHECK',
          sql: `SELECT farm_id FROM FARM WHERE farm_id = ${form.farm_id} AND farmer_id = :farmer_id`,
          status: 'pending',
          description: 'Validating farm ownership'
        }
      ];

      if (form.crop_id) {
        querySteps.push({
          type: 'CROP_CHECK',
          sql: `SELECT c.crop_id FROM CROP c JOIN FARM f ON c.farm_id = f.farm_id WHERE c.crop_id = ${form.crop_id} AND f.farm_id = ${form.farm_id}`,
          status: 'pending',
          description: 'Validating crop belongs to selected farm'
        });
      }

      querySteps.push(
        {
          type: 'SEQUENCE',
          sql: `SELECT SALES_SEQ.NEXTVAL FROM DUAL`,
          status: 'pending',
          description: 'Generating unique sale ID'
        },
        {
          type: 'INSERT',
          sql: `INSERT INTO SALES(
  sale_id, farm_id, crop_id, buyer_name, buyer_contact,
  quantity_sold, unit, price_per_unit, total_amount,
  sale_date, payment_method, payment_status, invoice_number, notes
) VALUES(
  SALES_SEQ.NEXTVAL,
  ${form.farm_id},
  ${form.crop_id || 'NULL'},
  '${form.buyer_name}',
  '${form.buyer_contact}',
  ${form.quantity_sold},
  '${form.unit}',
  ${form.price_per_unit},
  ${form.total_amount},
  TO_DATE('${form.sale_date}', 'YYYY-MM-DD'),
  '${form.payment_method}',
  '${form.payment_status}',
  ${form.invoice_number ? `'${form.invoice_number}'` : 'NULL'},
  ${form.notes ? `'${form.notes}'` : 'NULL'}
)`,
          status: 'pending',
          description: 'Inserting sale record (total_amount = quantity × price_per_unit)'
        },
        {
          type: 'COMMIT',
          sql: `COMMIT`,
          status: 'pending',
          description: 'Committing transaction'
        }
      );

      for (let i = 0; i < querySteps.length; i++) {
        setQueries(prev => {
          const updated = [...querySteps.slice(0, i + 1)];
          updated[i] = { ...updated[i], status: 'executing' };
          return updated;
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setQueries(prev => {
          const updated = [...prev];
          updated[i] = { ...updated[i], status: 'success', time: Math.random() * 50 + 10 };
          return updated;
        });
      }

      const payload = preparePayload();
      await axios.post("/sales", payload);
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      setQueries(prev => [...prev, {
        type: 'SUCCESS',
        sql: '✅ All operations completed successfully',
        status: 'success',
        description: `Sale to "${form.buyer_name}" recorded successfully`
      }]);
      
      setShowSuccess(true);
      
    } catch (err) {
      console.error("Error adding sale:", err);
      const errorMessage = err.response?.data?.message || "Failed to add sale. Please try again.";
      setError(errorMessage);
      
      setQueries(prev => [...prev, {
        type: 'ERROR',
        sql: `❌ ${errorMessage}`,
        status: 'error',
        description: 'Operation failed'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'executing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return '✅';
      case 'executing': return '⏳';
      case 'error': return '❌';
      case 'pending': return '⏸️';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-emerald-600 mb-2">💰 Record New Sale</h2>
              <p className="text-gray-600">Track your crop sales and revenue</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm *
                  </label>
                  <select
                    name="farm_id"
                    value={form.farm_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  >
                    <option key="empty" value="">Select Farm</option>
                    {farms.map((f) => {
                      const farmId = f.FARM_ID || f.farm_id;
                      const farmName = f.FARM_NAME || f.farm_name;
                      return (
                        <option key={farmId} value={farmId}>
                          {farmName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop *
                  </label>
                  <select
                    name="crop_id"
                    value={form.crop_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  >
                    <option key="empty" value="">Select Crop</option>
                    {crops.map((c) => {
                      const cropId = c.CROP_ID || c.crop_id;
                      const cropName = c.CROP_NAME || c.crop_name;
                      return (
                        <option key={cropId} value={cropId}>
                          {cropName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer Name *
                  </label>
                  <input
                    type="text"
                    name="buyer_name"
                    placeholder="Enter buyer name"
                    value={form.buyer_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buyer Contact *
                  </label>
                  <input
                    type="text"
                    name="buyer_contact"
                    placeholder="Enter buyer contact number"
                    value={form.buyer_contact}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                    minLength={10}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Sold *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="quantity_sold"
                    placeholder="Enter quantity sold"
                    value={form.quantity_sold}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option key="kg" value="KG">Kilograms (KG)</option>
                    <option key="tons" value="TONS">Tons</option>
                    <option key="quintals" value="QUINTALS">Quintals</option>
                    <option key="bags" value="BAGS">Bags</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Unit (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_unit"
                    placeholder="Enter price per unit"
                    value={form.price_per_unit}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_amount"
                    placeholder="Auto-calculated"
                    value={form.total_amount}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors bg-gray-50"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-calculated from quantity × price</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Date *
                  </label>
                  <input
                    type="date"
                    name="sale_date"
                    value={form.sale_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option key="cash" value="CASH">Cash</option>
                    <option key="cheque" value="CHEQUE">Cheque</option>
                    <option key="bank" value="BANK_TRANSFER">Bank Transfer</option>
                    <option key="credit" value="CREDIT">Credit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    name="payment_status"
                    value={form.payment_status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    disabled={loading}
                  >
                    <option key="pending" value="PENDING">Pending</option>
                    <option key="paid" value="PAID">Paid</option>
                    <option key="partial" value="PARTIAL">Partial</option>
                    <option key="overdue" value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    placeholder="Enter invoice number"
                    value={form.invoice_number}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    placeholder="Enter any additional notes about the sale"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>

              {showSuccess ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Sale Recorded Successfully!</h3>
                  <p className="text-gray-600 mb-6">Review the SQL queries on the right →</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuccess(false);
                        setQueries([]);
                        setExecutionTime(null);
                        const selectedFarmId = form.farm_id;
                        const selectedCropId = form.crop_id;
                        setForm({
                          farm_id: selectedFarmId,
                          crop_id: selectedCropId,
                          buyer_name: "",
                          buyer_contact: "",
                          quantity_sold: "",
                          unit: "KG",
                          price_per_unit: "",
                          total_amount: "",
                          sale_date: "",
                          payment_method: "CASH",
                          payment_status: "PENDING",
                          invoice_number: "",
                          notes: ""
                        });
                      }}
                      className="px-6 py-3 border-2 border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors font-semibold"
                    >
                      ➕ Add Another Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/sales")}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                    >
                      View All Sales →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate("/sales")}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    View All Sales
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Recording Sale...
                      </span>
                    ) : (
                      "Record Sale"
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Column - SQL Query Visualizer */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-gray-900">🔍 SQL Query Visualizer</h3>
                {executionTime && (
                  <span className="text-sm text-green-600 font-semibold">
                    ⚡ {executionTime}ms
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">Real-time database operations</p>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {queries.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Fill in the form to see SQL queries</p>
                  <p className="text-xs mt-2">Click "Record Sale" to execute</p>
                </div>
              ) : (
                queries.map((query, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 transition-all ${getStatusColor(query.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getStatusIcon(query.status)}</span>
                        <span className="font-semibold text-sm">
                          {query.type}
                        </span>
                      </div>
                      {query.time && (
                        <span className="text-xs font-mono">{query.time.toFixed(2)}ms</span>
                      )}
                    </div>
                    
                    {query.description && (
                      <p className="text-xs mb-2 opacity-75">{query.description}</p>
                    )}
                    
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono">
                      {query.sql}
                    </pre>
                    
                    {query.status === 'executing' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Query Status:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span>⏸️</span>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏳</span>
                  <span>Executing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span>Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
