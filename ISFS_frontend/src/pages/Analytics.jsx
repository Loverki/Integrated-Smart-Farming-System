import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Analytics() {
  const navigate = useNavigate();

  // Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">📊 Analytics Dashboard</h1>
              <p className="text-lg mt-1 opacity-90">Advanced farm analytics and insights</p>
            </div>
            <div className="flex items-center space-x-4">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">Yield Analysis</h3>
              <p className="text-gray-600">Track crop yields over time and compare performance</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Revenue Tracking</h3>
              <p className="text-gray-600">Monitor sales performance and profit margins</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold mb-2">Growth Metrics</h3>
              <p className="text-gray-600">Analyze crop growth patterns and seasonal trends</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">This feature is under development and will include:</p>
            <ul className="text-left max-w-2xl mx-auto space-y-2">
              <li>• Interactive charts and graphs</li>
              <li>• Predictive analytics for crop yields</li>
              <li>• Cost-benefit analysis</li>
              <li>• Weather correlation analysis</li>
              <li>• Performance benchmarking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
