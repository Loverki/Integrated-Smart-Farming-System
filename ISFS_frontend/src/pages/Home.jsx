import { Link } from "react-router-dom";
import React, { useEffect } from "react";

export default function Home() {
  // ✅ If farmer is already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/dashboard";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-green-600">
                  Smart Farming System
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Farmer Login
              </Link>
              <Link
                to="/admin-login"
                className="text-green-600 hover:text-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Admin Login
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">🌱 Revolutionizing</span>{' '}
                  <span className="block text-green-600 xl:inline">Agriculture</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Advanced DBMS-powered smart farming system with real-time analytics, 
                  comprehensive farm management, and data-driven insights for modern farmers.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Farmer Login
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/admin-login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Admin Login
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Smart Farming"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
              Advanced Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Complete Smart Farming Solution
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Built with advanced DBMS concepts including DDL, DML, TCL, Views, Joins, Stored Procedures, and Triggers
            </p>
          </div>

          <div className="mt-20">
            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3">
              {/* Farm Management */}
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="ml-16 text-lg leading-6 font-medium text-gray-900">Farm Management</h3>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Comprehensive farm tracking with DDL operations, crop monitoring, soil analysis, and weather data integration.
                </p>
                <ul className="mt-3 ml-16 text-sm text-gray-500 space-y-1">
                  <li>• Multi-farm management</li>
                  <li>• Crop lifecycle tracking</li>
                  <li>• Soil analysis records</li>
                  <li>• Weather monitoring</li>
                </ul>
              </div>

              {/* Financial Analytics */}
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="ml-16 text-lg leading-6 font-medium text-gray-900">Financial Analytics</h3>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Advanced financial tracking with DML operations, profit calculations, and comprehensive cost analysis.
                </p>
                <ul className="mt-3 ml-16 text-sm text-gray-500 space-y-1">
                  <li>• Revenue tracking</li>
                  <li>• Cost analysis</li>
                  <li>• Profit calculations</li>
                  <li>• Financial reports</li>
                </ul>
              </div>

              {/* Labour Management */}
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="ml-16 text-lg leading-6 font-medium text-gray-900">Labour Management</h3>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Efficient labour tracking with work logs, skill management, and automated wage calculations.
                </p>
                <ul className="mt-3 ml-16 text-sm text-gray-500 space-y-1">
                  <li>• Work hour tracking</li>
                  <li>• Skill-based assignment</li>
                  <li>• Wage calculations</li>
                  <li>• Performance monitoring</li>
                </ul>
              </div>

              {/* Equipment Tracking */}
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="ml-16 text-lg leading-6 font-medium text-gray-900">Equipment Management</h3>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Complete equipment lifecycle management with maintenance scheduling and cost tracking.
                </p>
                <ul className="mt-3 ml-16 text-sm text-gray-500 space-y-1">
                  <li>• Equipment inventory</li>
                  <li>• Maintenance scheduling</li>
                  <li>• Cost depreciation</li>
                  <li>• Performance tracking</li>
                </ul>
              </div>

              {/* Advanced Analytics */}
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="ml-16 text-lg leading-6 font-medium text-gray-900">Advanced Analytics</h3>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Powerful analytics with Views, Joins, and Stored Procedures for data-driven decision making.
                </p>
                <ul className="mt-3 ml-16 text-sm text-gray-500 space-y-1">
                  <li>• Yield predictions</li>
                  <li>• Cost optimization</li>
                  <li>• Performance metrics</li>
                  <li>• Trend analysis</li>
                </ul>
              </div>

              {/* Disease & Pest Management */}
              <div className="relative group">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-lg bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="ml-16 text-lg leading-6 font-medium text-gray-900">Disease & Pest Control</h3>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Comprehensive disease and pest tracking with treatment recommendations and effectiveness monitoring.
                </p>
                <ul className="mt-3 ml-16 text-sm text-gray-500 space-y-1">
                  <li>• Disease detection</li>
                  <li>• Pest monitoring</li>
                  <li>• Treatment tracking</li>
                  <li>• Effectiveness analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DBMS Features Section */}
      <div className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase">
              Advanced DBMS Implementation
            </h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Database Management Excellence
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Built with comprehensive database concepts for optimal performance and data integrity
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <span className="text-2xl font-bold text-green-600">DDL</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Data Definition</h3>
              <p className="mt-2 text-base text-gray-500">
                CREATE, ALTER, DROP operations for schema management
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <span className="text-2xl font-bold text-green-600">DML</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Data Manipulation</h3>
              <p className="mt-2 text-base text-gray-500">
                INSERT, UPDATE, DELETE operations for data management
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <span className="text-2xl font-bold text-green-600">TCL</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Transaction Control</h3>
              <p className="mt-2 text-base text-gray-500">
                COMMIT, ROLLBACK, SAVEPOINT for data consistency
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <span className="text-2xl font-bold text-green-600">Views</span>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Database Views</h3>
              <p className="mt-2 text-base text-gray-500">
                Complex queries and analytics through views
              </p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Complex Joins</h3>
              <p className="mt-2 text-base text-gray-500">
                INNER, OUTER, CROSS joins for relational data analysis
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Stored Procedures</h3>
              <p className="mt-2 text-base text-gray-500">
                Complex business logic with procedures and functions
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Triggers</h3>
              <p className="mt-2 text-base text-gray-500">
                Automated responses to database events and changes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to transform your farming?</span>
            <span className="block text-green-200">Start your smart farming journey today</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-green-200">
            Join the agricultural revolution with our comprehensive DBMS-powered farming management system.
            Increase productivity, reduce costs, and make data-driven decisions.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-colors"
            >
              Register as Farmer
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-600 transition-colors"
            >
              Login to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white">Smart Farming System</h3>
              <p className="mt-2 text-gray-400">
                Advanced DBMS-powered agricultural management platform for modern farmers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Features</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Farm Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Analytics Dashboard</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cost Tracking</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Labour Management</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact Support</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-center">
              &copy; 2024 Smart Farming System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}