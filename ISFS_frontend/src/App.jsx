import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddFarmer from "./pages/AddFarmer";
import Farmers from "./pages/Farmers";
import AddCrop from "./pages/AddCrop";
import Crops from "./pages/Crops";
import AddLabours from "./pages/AddLabours";
import Labours from "./pages/Labours";
import AddFertilizers from "./pages/AddFertilizers";
import Fertilizers from "./pages/Fertilizers";
import AddSale from "./pages/AddSales";
import Sales from "./pages/Sales";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/login";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import Farms from "./pages/Farms";
import AddFarm from "./pages/AddFarm";
import DatabaseViews from "./pages/DatabaseViews";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes (require login) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmers"
          element={
            <ProtectedRoute>
              <Farmers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-farmer"
          element={
            <ProtectedRoute>
              <AddFarmer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crops"
          element={
            <ProtectedRoute>
              <Crops />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-crop"
          element={
            <ProtectedRoute>
              <AddCrop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labours"
          element={
            <ProtectedRoute>
              <Labours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-labour"
          element={
            <ProtectedRoute>
              <AddLabours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fertilizers"
          element={
            <ProtectedRoute>
              <Fertilizers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-fertilizer"
          element={
            <ProtectedRoute>
              <AddFertilizers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-sale"
          element={
            <ProtectedRoute>
              <AddSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms"
          element={
            <ProtectedRoute>
              <Farms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-farm"
          element={
            <ProtectedRoute>
              <AddFarm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/database-views"
          element={
            <ProtectedRoute>
              <DatabaseViews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pest-disease"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Pest & Disease Control</h1>
                  <p className="text-gray-600">This feature is coming soon!</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Equipment Management</h1>
                  <p className="text-gray-600">This feature is coming soon!</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/irrigation"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Irrigation System</h1>
                  <p className="text-gray-600">This feature is coming soon!</p>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms/:farmId/crops"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">🌾 Farm Crops</h1>
                  <p className="text-gray-600">Crop management for this farm is coming soon!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ← Back to Farms
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms/:farmId/edit"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">✏️ Edit Farm</h1>
                  <p className="text-gray-600">Farm editing functionality is coming soon!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ← Back to Farms
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-pest-disease"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">🐛 Pest & Disease Control</h1>
                  <p className="text-gray-600">Pest and disease management is coming soon!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-equipment"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">🚜 Equipment Management</h1>
                  <p className="text-gray-600">Equipment management is coming soon!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-irrigation"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">💧 Irrigation System</h1>
                  <p className="text-gray-600">Irrigation management is coming soon!</p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
