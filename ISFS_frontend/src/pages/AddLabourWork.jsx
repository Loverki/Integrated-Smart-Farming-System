import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AddLabourWork = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState([]);
  const [labours, setLabours] = useState([]);
  const [form, setForm] = useState({
    labour_id: "",
    farm_id: "",
    work_type: "",
    work_date: new Date().toISOString().split('T')[0],
    start_time: "",
    end_time: "",
    hours_worked: "",
    hourly_rate: "",
    work_description: "",
    status: "PENDING"
  });

  const [calculatedCost, setCalculatedCost] = useState(0);
  const [autoCalculate, setAutoCalculate] = useState(false);

  useEffect(() => {
    fetchFarms();
    fetchLabours();
  }, []);

  useEffect(() => {
    // Auto-calculate hours if start_time and end_time are provided
    if (autoCalculate && form.start_time && form.end_time) {
      const start = new Date(`${form.work_date}T${form.start_time}`);
      const end = new Date(`${form.work_date}T${form.end_time}`);
      const diffMs = end - start;
      const hours = Math.max(0, diffMs / (1000 * 60 * 60));
      setForm(prev => ({ ...prev, hours_worked: hours.toFixed(2) }));
    }
  }, [form.start_time, form.end_time, form.work_date, autoCalculate]);

  useEffect(() => {
    // Calculate total cost
    if (form.hours_worked && form.hourly_rate) {
      const cost = parseFloat(form.hours_worked) * parseFloat(form.hourly_rate);
      setCalculatedCost(cost.toFixed(2));
    } else {
      setCalculatedCost(0);
    }
  }, [form.hours_worked, form.hourly_rate]);

  useEffect(() => {
    // Auto-fill hourly rate when labour is selected
    if (form.labour_id) {
      const selectedLabour = labours.find(l => 
        (l.LABOUR_ID || l.labour_id) === parseInt(form.labour_id)
      );
      if (selectedLabour) {
        const dailyWage = selectedLabour.DAILY_WAGE || selectedLabour.daily_wage || 0;
        if (dailyWage > 0) {
          // Assume 8 hours work day
          const hourlyRate = (dailyWage / 8).toFixed(2);
          setForm(prev => ({ ...prev, hourly_rate: hourlyRate }));
        }
      }
    }
  }, [form.labour_id, labours]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.labour_id || !form.farm_id || !form.work_date || !form.hours_worked || !form.hourly_rate) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        labour_id: parseInt(form.labour_id),
        farm_id: parseInt(form.farm_id),
        work_type: form.work_type || "General Work",
        work_date: form.work_date,
        hours_worked: parseFloat(form.hours_worked),
        hourly_rate: parseFloat(form.hourly_rate),
        work_description: form.work_description || null,
        status: form.status
      };

      // Add start_time and end_time if provided
      if (form.start_time) {
        submitData.start_time = `${form.work_date} ${form.start_time}:00`;
      }
      if (form.end_time) {
        submitData.end_time = `${form.work_date} ${form.end_time}:00`;
      }

      await api.post("/labour-work", submitData);
      alert("Attendance marked successfully!");
      navigate("/labour-work");
    } catch (err) {
      console.error("Error creating work record:", err);
      alert(err.response?.data?.error || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  const workTypes = [
    "Plowing",
    "Sowing/Planting",
    "Watering/Irrigation",
    "Weeding",
    "Fertilizer Application",
    "Pesticide Application",
    "Harvesting",
    "Crop Maintenance",
    "Equipment Operation",
    "General Farm Work",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/labour-work")}
                className="group bg-green-800 hover:bg-green-900 p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 border-2 border-green-700 hover:border-green-600"
              >
                <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <span className="text-4xl">✅</span>
                  Mark Labour Attendance
                </h1>
                <p className="text-lg mt-1 opacity-90">Record work hours and attendance</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Cost Preview Card */}
        {calculatedCost > 0 && (
          <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-90 mb-1">Total Cost for This Work</div>
                <div className="text-5xl font-black">₹{parseFloat(calculatedCost).toLocaleString()}</div>
              </div>
              <div className="text-6xl">💰</div>
            </div>
            <div className="mt-3 text-sm opacity-90">
              {form.hours_worked}h × ₹{form.hourly_rate}/hr = ₹{calculatedCost}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Labour Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Labour Worker <span className="text-red-500">*</span>
              </label>
              <select
                name="labour_id"
                value={form.labour_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-white"
                disabled={loading}
              >
                <option value="">Select Labour</option>
                {labours.map((labour, index) => {
                  const labourId = labour.LABOUR_ID || labour.labour_id;
                  const labourName = labour.NAME || labour.name;
                  const labourRole = labour.ROLE || labour.role;
                  const dailyWage = labour.DAILY_WAGE || labour.daily_wage;
                  return (
                    <option key={`labour-${labourId}-${index}`} value={labourId}>
                      {labourName} - {labourRole} {dailyWage ? `(₹${dailyWage}/day)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Farm Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Farm <span className="text-red-500">*</span>
              </label>
              <select
                name="farm_id"
                value={form.farm_id}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-white"
                disabled={loading}
              >
                <option value="">Select Farm</option>
                {farms.map((farm, index) => {
                  const farmId = farm.farmId || farm.FARM_ID || farm.farm_id;
                  const farmName = farm.farmName || farm.FARM_NAME || farm.farm_name;
                  const location = farm.location || farm.LOCATION;
                  return (
                    <option key={farmId || `farm-${index}`} value={farmId}>
                      {farmName} {location ? `- ${location}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Work Type <span className="text-red-500">*</span>
              </label>
              <select
                name="work_type"
                value={form.work_type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-white"
                disabled={loading}
              >
                <option value="">Select Work Type</option>
                {workTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Work Date */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Work Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="work_date"
                value={form.work_date}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Time Section with Auto-Calculate */}
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Work Time</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCalculate}
                    onChange={(e) => setAutoCalculate(e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Auto-calculate hours</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Hours Worked */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Hours Worked <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hours_worked"
                value={form.hours_worked}
                onChange={handleChange}
                required
                min="0"
                max="24"
                step="0.5"
                placeholder="Enter hours (e.g., 8.5)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {autoCalculate ? "Auto-calculated from start and end time" : "Manually enter the hours worked"}
              </p>
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Hourly Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hourly_rate"
                value={form.hourly_rate}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter rate per hour"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {form.labour_id ? "Auto-filled from labour's daily wage (÷8 hours)" : "Select labour to auto-fill"}
              </p>
            </div>

            {/* Work Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Work Description
              </label>
              <textarea
                name="work_description"
                value={form.work_description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe the work done (optional)"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                disabled={loading}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors bg-white"
                disabled={loading}
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Mark as "Completed" if payment has been made
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? "Saving..." : "✓ Mark Attendance"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/labour-work")}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Help Card */}
        <div className="mt-6 bg-blue-100 border-2 border-blue-300 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Quick Tips
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Select labour to auto-fill their hourly rate based on daily wage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Enable "Auto-calculate hours" and enter start/end time for automatic calculation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Mark as "Completed" only after payment is made to the labour</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <span>Work description helps you remember what tasks were completed</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddLabourWork;

