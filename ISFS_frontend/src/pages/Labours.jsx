import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import SQLQueryVisualizer from "../components/SQLQueryVisualizer";

export default function Labours() {
  const navigate = useNavigate();
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, labour: null });
  const [deleting, setDeleting] = useState(false);
  const [deleteQueries, setDeleteQueries] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchLabours();
  }, []);

  const fetchLabours = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/labours");
      setLabours(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching labours:", err);
      setError("Failed to load labours. Please try again.");
      // Handle 401 errors by redirecting to login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (labour) => {
    setDeleteModal({ show: true, labour });
    setDeleteQueries([]);
    setSuccessMessage("");
  };

  const confirmDelete = async () => {
    if (!deleteModal.labour) return;

    const labourId = deleteModal.labour.LABOUR_ID || deleteModal.labour.labour_id || deleteModal.labour[0];
    const labourName = deleteModal.labour.NAME || deleteModal.labour.name || deleteModal.labour[1];

    setDeleting(true);
    setDeleteQueries([
      {
        query: "Validating labour record...",
        status: "executing",
        description: "Checking if labour exists"
      },
      {
        query: "Deleting labour...",
        status: "pending",
        description: "Removing labour record"
      }
    ]);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDeleteQueries([
        {
          query: `SELECT labour_id, name
FROM LABOUR
WHERE labour_id = ${labourId}`,
          status: "success",
          description: "Labour record verified"
        },
        {
          query: "Deleting labour...",
          status: "executing",
          description: "Removing labour record"
        }
      ]);

      await new Promise(resolve => setTimeout(resolve, 500));

      await axios.delete(`/labours/${labourId}`);

      setDeleteQueries([
        {
          query: `SELECT labour_id, name
FROM LABOUR
WHERE labour_id = ${labourId}`,
          status: "success",
          description: "Labour record verified"
        },
        {
          query: `DELETE FROM LABOUR
WHERE labour_id = ${labourId}`,
          status: "success",
          description: `Labour "${labourName}" deleted successfully`
        }
      ]);

      setSuccessMessage(`Labour "${labourName}" has been deleted successfully!`);
      
      // Refresh the labours list
      await fetchLabours();
      
      // Close modal after short delay
      setTimeout(() => {
        setDeleteModal({ show: false, labour: null });
        setSuccessMessage("");
      }, 2000);

    } catch (err) {
      console.error("Error deleting labour:", err);
      setError(err.response?.data?.message || "Failed to delete labour");
      setDeleteQueries(prev => prev.map(q => ({ ...q, status: "error" })));
    } finally {
      setDeleting(false);
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
                onClick={() => navigate("/add-labours")}
                className="bg-white text-green-700 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-md"
              >
                ➕ Add Labour
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
            <h2 className="text-2xl font-bold text-gray-800">All Labour Workers</h2>
            <button
              onClick={fetchLabours}
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

          {loading && labours.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading labours...</p>
            </div>
          ) : labours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No labour workers registered yet.</p>
              <button
                onClick={() => navigate("/add-labours")}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Add First Labour
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 text-left rounded-lg overflow-hidden">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border">ID</th>
                    <th className="p-3 border">Name</th>
                    <th className="p-3 border">Phone</th>
                    <th className="p-3 border">Email</th>
                    <th className="p-3 border">Skill</th>
                    <th className="p-3 border">Hourly Rate (₹)</th>
                    <th className="p-3 border">Status</th>
                    <th className="p-3 border">Hire Date</th>
                    <th className="p-3 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {labours.map((labour, index) => {
                    // Handle both object and array formats
                    const labourId = labour.LABOUR_ID || labour.labour_id || labour[0];
                    const name = labour.NAME || labour.name || labour[1];
                    const phone = labour.PHONE || labour.phone || labour[2];
                    const email = labour.EMAIL || labour.email || labour[3];
                    const skill = labour.SKILL || labour.skill || labour[4];
                    const hourlyRate = labour.HOURLY_RATE || labour.hourly_rate || labour[5];
                    const status = labour.STATUS || labour.status || labour[8];
                    const hireDate = labour.HIRE_DATE || labour.hire_date || labour[7];

                    return (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 border font-mono text-sm">{labourId}</td>
                        <td className="p-3 border font-semibold">{name}</td>
                        <td className="p-3 border">{phone || '-'}</td>
                        <td className="p-3 border text-sm">{email || '-'}</td>
                        <td className="p-3 border">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {skill}
                          </span>
                        </td>
                        <td className="p-3 border font-semibold text-green-700">
                          {hourlyRate ? `₹${parseFloat(hourlyRate).toFixed(2)}` : '-'}
                        </td>
                        <td className="p-3 border">
                          <span className={`px-2 py-1 rounded text-sm ${
                            status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            status === 'BUSY' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status || 'AVAILABLE'}
                          </span>
                        </td>
                        <td className="p-3 border text-sm">
                          {hireDate ? new Date(hireDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => handleDeleteClick(labour)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm font-semibold flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="mt-4 text-sm text-gray-600">
                Total Labours: <span className="font-semibold">{labours.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => !deleting && setDeleteModal({ show: false, labour: null })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-2xl font-bold">Delete Labour</h3>
                  <p className="text-sm opacity-90 mt-1">This action cannot be undone</p>
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
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 mb-2">
                      Are you sure you want to delete the following labour worker?
                    </p>
                    <div className="bg-white p-3 rounded border-l-4 border-red-500 mt-3">
                      <div className="font-bold text-lg text-gray-900">
                        {deleteModal.labour?.NAME || deleteModal.labour?.name || deleteModal.labour?.[1]}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Skill: {deleteModal.labour?.SKILL || deleteModal.labour?.skill || deleteModal.labour?.[4]}
                      </div>
                      <div className="text-sm text-gray-600">
                        Phone: {deleteModal.labour?.PHONE || deleteModal.labour?.phone || deleteModal.labour?.[2] || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* SQL Visualization */}
                  {deleteQueries.length > 0 && (
                    <div className="mb-4">
                      <SQLQueryVisualizer 
                        queries={deleteQueries}
                      />
                    </div>
                  )}

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Warning
                    </h4>
                    <p className="text-sm text-red-800">
                      This will permanently delete this labour record from the database. Any related work records may also be affected.
                    </p>
                  </div>
                </>
              )}
            </div>

            {!successMessage && (
              <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal({ show: false, labour: null })}
                  disabled={deleting}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Confirm Delete
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
