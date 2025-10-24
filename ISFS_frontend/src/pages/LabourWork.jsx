import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const LabourWork = () => {
  const navigate = useNavigate();
  const [workRecords, setWorkRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    farm_id: "",
    labour_id: "",
    work_date: ""
  });

  const [farms, setFarms] = useState([]);
  const [labours, setLabours] = useState([]);

  useEffect(() => {
    fetchWorkRecords();
    fetchSummary();
    fetchFarms();
    fetchLabours();
  }, []);

  const fetchWorkRecords = async (filterParams = {}) => {
    try {
      setLoading(true);
      const params = { ...filters, ...filterParams };
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await api.get("/labour-work", { params });
      const records = Array.isArray(response.data) ? response.data : [];
      setWorkRecords(records);
      setError(null);
    } catch (err) {
      console.error("Error fetching work records:", err);
      setError(err.response?.data?.error || "Failed to fetch work records");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get("/labour-work/summary");
      setSummary(response.data || {});
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const fetchFarms = async () => {
    try {
      const response = await api.get("/farms");
      setFarms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching farms:", err);
    }
  };

  const fetchLabours = async () => {
    try {
      const response = await api.get("/labours");
      setLabours(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching labours:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    fetchWorkRecords(filters);
  };

  const clearFilters = () => {
    setFilters({ status: "", farm_id: "", labour_id: "", work_date: "" });
    fetchWorkRecords({});
  };

  const handleMarkCompleted = async (workId) => {
    try {
      await api.put(`/labour-work/${workId}`, { status: "COMPLETED" });
      fetchWorkRecords();
      fetchSummary();
    } catch (err) {
      console.error("Error marking as completed:", err);
      alert("Failed to mark as completed");
    }
  };

  const handleDelete = async (workId) => {
    if (!confirm("Are you sure you want to delete this work record?")) return;
    
    try {
      await api.delete(`/labour-work/${workId}`);
      fetchWorkRecords();
      fetchSummary();
    } catch (err) {
      console.error("Error deleting work record:", err);
      alert("Failed to delete work record");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-300";
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timestampString) => {
    if (!timestampString) return "N/A";
    return new Date(timestampString).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="group bg-green-800 hover:bg-green-900 p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-4xl">📋</span>
                  Labour Work & Attendance
                </h1>
                <p className="text-lg mt-1 opacity-90">Track work hours, attendance, and payments</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/add-labour-work")}
              className="group bg-green-800 hover:bg-green-900 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 border-2 border-green-700 hover:border-green-600"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Mark Attendance
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Total Records</div>
              <div className="text-4xl">📊</div>
            </div>
            <div className="text-4xl font-black text-blue-600">{summary.TOTAL_RECORDS || 0}</div>
            <div className="text-sm text-gray-600 mt-2 font-semibold">All work entries</div>
          </div>

          <div className="bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Pending</div>
              <div className="text-4xl">⏳</div>
            </div>
            <div className="text-4xl font-black text-yellow-600">{summary.PENDING_COUNT || 0}</div>
            <div className="text-sm text-gray-600 mt-2 font-semibold">Awaiting completion</div>
          </div>

          <div className="bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Total Hours</div>
              <div className="text-4xl">⏰</div>
            </div>
            <div className="text-4xl font-black text-emerald-600">{parseFloat(summary.TOTAL_HOURS || 0).toFixed(1)}</div>
            <div className="text-sm text-gray-600 mt-2 font-semibold">Hours worked</div>
          </div>

          <div className="bg-white backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold uppercase tracking-wider text-gray-600">Pending Payment</div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="text-3xl font-black text-purple-600">₹{parseFloat(summary.PENDING_PAYMENT || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2 font-semibold">To be paid</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              name="farm_id"
              value={filters.farm_id}
              onChange={handleFilterChange}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="">All Farms</option>
              {farms.map((farm) => (
                <option key={farm.FARM_ID} value={farm.FARM_ID}>
                  {farm.FARM_NAME}
                </option>
              ))}
            </select>

            <select
              name="labour_id"
              value={filters.labour_id}
              onChange={handleFilterChange}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            >
              <option value="">All Labours</option>
              {labours.map((labour) => {
                const labourId = labour.LABOUR_ID || labour.labour_id;
                const labourName = labour.NAME || labour.name;
                return (
                  <option key={labourId} value={labourId}>
                    {labourName}
                  </option>
                );
              })}
            </select>

            <input
              type="date"
              name="work_date"
              value={filters.work_date}
              onChange={handleFilterChange}
              className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 bg-gray-500 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-600 transition-colors shadow-md"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Work Records Table */}
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading work records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : workRecords.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Work Records Found</h2>
            <p className="text-gray-600 mb-6">Start tracking labour attendance and work hours.</p>
            <button
              onClick={() => navigate("/add-labour-work")}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Mark First Attendance
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Work Records ({workRecords.length})</h2>
              <button
                onClick={() => fetchWorkRecords()}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356-2A8.001 8.001 0 004 12c0 2.972 1.154 5.666 3.057 7.757M20 20v-5h-.581m0 0a8.003 8.003 0 01-15.357-2.125M14 12l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Labour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Farm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Work Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rate/Hr</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {workRecords.map((record, index) => {
                    const workId = record.WORK_ID || record.work_id;
                    const labourName = record.LABOUR_NAME || record.labour_name;
                    const farmName = record.FARM_NAME || record.farm_name;
                    const workType = record.WORK_TYPE || record.work_type || "General";
                    const workDate = formatDate(record.WORK_DATE || record.work_date);
                    const hoursWorked = parseFloat(record.HOURS_WORKED || record.hours_worked || 0).toFixed(1);
                    const hourlyRate = parseFloat(record.HOURLY_RATE || record.hourly_rate || 0).toFixed(2);
                    const totalCost = parseFloat(record.TOTAL_COST || record.total_cost || 0).toFixed(2);
                    const status = record.STATUS || record.status || "PENDING";

                    return (
                      <tr key={workId || index} className="hover:bg-green-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{workDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{labourName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{farmName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{workType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{hoursWorked}h</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{hourlyRate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">₹{totalCost}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)} border`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {status === "PENDING" && (
                            <button
                              onClick={() => handleMarkCompleted(workId)}
                              className="text-green-600 hover:text-green-900 mr-3 font-semibold"
                            >
                              ✓ Complete
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(workId)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Additional Summary Stats */}
        {!loading && workRecords.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Completed Work</div>
              <div className="text-4xl font-black mb-1">{summary.COMPLETED_COUNT || 0}</div>
              <div className="text-sm opacity-90">Work entries marked complete</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Total Paid</div>
              <div className="text-3xl font-black mb-1">₹{parseFloat(summary.TOTAL_PAID || 0).toLocaleString()}</div>
              <div className="text-sm opacity-90">For completed work</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-2">Active Labours</div>
              <div className="text-4xl font-black mb-1">{summary.ACTIVE_LABOURS || 0}</div>
              <div className="text-sm opacity-90">Labours with work records</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabourWork;

