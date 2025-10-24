import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AddFarmer from "./pages/AddFarmer";
import Farmers from "./pages/Farmers";
import AddCrop from "./pages/AddCrop";
import Crops from "./pages/Crops";
import CropsOverview from "./pages/CropsOverview";
import AddLabours from "./pages/AddLabours";
import Labours from "./pages/Labours";
import LabourWork from "./pages/LabourWork";
import AddLabourWork from "./pages/AddLabourWork";
import AddFertilizers from "./pages/AddFertilizers";
import Fertilizers from "./pages/Fertilizers";
import AddEquipment from "./pages/AddEquipment";
import Equipment from "./pages/Equipment";
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
import StoredProcedures from "./pages/StoredProcedures";
import Functions from "./pages/Functions";
import FinancialAnalytics from "./pages/FinancialAnalytics";
import FarmComparison from "./pages/FarmComparison";
import EditFarm from "./pages/EditFarm";
import FarmCrops from "./pages/FarmCrops";
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
          path="/crops-overview"
          element={
            <ProtectedRoute>
              <CropsOverview />
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
          path="/crops/:id/edit"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md border-2 border-green-200">
                  <div className="text-8xl mb-6">🌾</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Crop Editing</h1>
                  <p className="text-gray-600 mb-2 text-lg">Edit functionality for crops is coming soon!</p>
                  <p className="text-gray-500 text-sm mb-8">Crop records are being tracked. Edit features will be available in the next update.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Crops
                  </button>
                </div>
              </div>
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
          path="/add-labours"
          element={
            <ProtectedRoute>
              <AddLabours />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labour-work"
          element={
            <ProtectedRoute>
              <LabourWork />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-labour-work"
          element={
            <ProtectedRoute>
              <AddLabourWork />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labours/:id/edit"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md border-2 border-green-200">
                  <div className="text-8xl mb-6">👥</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Labour Editing</h1>
                  <p className="text-gray-600 mb-2 text-lg">Edit functionality for labour is coming soon!</p>
                  <p className="text-gray-500 text-sm mb-8">Labour records are being tracked. Edit features will be available in the next update.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Labour
                  </button>
                </div>
              </div>
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
          path="/add-fertilizers"
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
          path="/add-sales"
          element={
            <ProtectedRoute>
              <AddSale />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/:id/edit"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md border-2 border-green-200">
                  <div className="text-8xl mb-6">💰</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Sales Editing</h1>
                  <p className="text-gray-600 mb-2 text-lg">Edit functionality for sales is coming soon!</p>
                  <p className="text-gray-500 text-sm mb-8">Sales records are being tracked. Edit features will be available in the next update.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Sales
                  </button>
                </div>
              </div>
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
          path="/stored-procedures"
          element={
            <ProtectedRoute>
              <StoredProcedures />
            </ProtectedRoute>
          }
        />
        <Route
          path="/functions"
          element={
            <ProtectedRoute>
              <Functions />
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
              <Equipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-equipment"
          element={
            <ProtectedRoute>
              <AddEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment/:id/edit"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md border-2 border-green-200">
                  <div className="text-8xl mb-6">🚜</div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">Equipment Editing</h1>
                  <p className="text-gray-600 mb-2 text-lg">Edit functionality for equipment is coming soon!</p>
                  <p className="text-gray-500 text-sm mb-8">Equipment records are being tracked. Edit features will be available in the next update.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Equipment
                  </button>
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
              <FarmCrops />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farms/:farm_id/edit"
          element={
            <ProtectedRoute>
              <EditFarm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/financial-analytics"
          element={
            <ProtectedRoute>
              <FinancialAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farm-comparison"
          element={
            <ProtectedRoute>
              <FarmComparison />
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
