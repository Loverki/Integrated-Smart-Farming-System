import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  // ✅ If farmer is already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="font-sans bg-green-50">
      {/* Hero Section */}
      <section className="bg-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">🌱 Integrated Smart Farming System</h1>
          <p className="text-xl md:text-2xl mb-6">
            Revolutionizing agriculture with modern techniques, efficient management, and data-driven insights.
          </p>

          {/* 👇 Auth Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="bg-yellow-300 text-green-800 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-green-800 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-100 transition"
            >
              Register
            </button>
          </div>
        </div>
      </section>

      {/* About Agriculture */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-green-800 mb-6">About Agriculture in India</h2>
        <p className="text-green-700 text-lg leading-relaxed">
          Agriculture is the backbone of India's economy. It provides employment to over 50% of the population
          and contributes significantly to the GDP. Modern farming systems integrate technology, sustainability,
          and efficient resource management to increase productivity and ensure food security.
        </p>
      </section>

      {/* Machinery Section */}
      <section id="machinery" className="py-20 bg-green-100 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-green-800 mb-6">Farm Machinery</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Tractors</h3>
            <p>Used for plowing, sowing, and transportation. Essential for modern mechanized farming.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Harvesters</h3>
            <p>Combine harvesting machines reduce manual labor and increase efficiency during crop collection.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Sprayers & Irrigation</h3>
            <p>Modern sprayers and irrigation systems improve crop health and water efficiency.</p>
          </div>
        </div>
      </section>

      {/* Techniques Section */}
      <section id="techniques" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-green-800 mb-6">Farming Techniques</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Traditional Farming</h3>
            <p>Methods like crop rotation, natural fertilizers, and manual irrigation are widely used in rural India.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="font-semibold text-xl mb-2">Modern Farming</h3>
            <p>Technology-driven practices including precision agriculture, drones, and automated machinery optimize yields.</p>
          </div>
        </div>
      </section>

      {/* Sales Section */}
      <section id="sales" className="py-20 bg-green-100 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-green-800 mb-6">Crop Sales & Market</h2>
        <p className="text-green-700 text-lg leading-relaxed">
          Farmers sell crops through local markets, cooperatives, or digital platforms. Accurate tracking of yield,
          fertilizer usage, and labor helps maximize profit and reduce waste.
        </p>
      </section>

      {/* Growth in India */}
      <section id="growth" className="py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-green-800 mb-6">Agricultural Growth in India</h2>
        <p className="text-green-700 text-lg leading-relaxed mb-6">
          India has seen remarkable growth in agriculture due to mechanization, modern techniques, and government support.
          Crop yields, efficiency, and sustainability continue to improve each year.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-yellow-100 p-6 rounded-lg text-center shadow">
            <h3 className="text-2xl font-bold">35%</h3>
            <p>Increase in crop yield (2015-2025)</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg text-center shadow">
            <h3 className="text-2xl font-bold">50%</h3>
            <p>Population employed in agriculture</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg text-center shadow">
            <h3 className="text-2xl font-bold">70M ha</h3>
            <p>Total cultivated land area</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-700 text-white text-center">
        <h2 className="text-3xl font-bold mb-6">Manage Your Farm Efficiently</h2>
        <p className="mb-6">
          Use our Integrated Smart Farming System to track crops, labor, sales, and fertilizer usage in one platform.
        </p>

        {/* 👇 Auth Buttons at bottom too */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-300 text-green-800 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-400 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-green-800 font-semibold px-8 py-3 rounded-lg hover:bg-yellow-100 transition"
          >
            Register
          </button>
        </div>
      </section>
    </div>
  );
}
