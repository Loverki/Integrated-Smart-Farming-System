import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const cards = [
  {
    name: "Crops",
    description: "Track your crops, sowing/harvesting dates, and expected yields.",
    viewRoute: "/crops",
    addRoute: "/add-crop",
  },
  {
    name: "Labours",
    description: "Monitor your labours and their work logs.",
    viewRoute: "/labours",
    addRoute: "/add-labour",
  },
  {
    name: "Fertilizers",
    description: "Record fertilizers applied to your farms and quantities used.",
    viewRoute: "/fertilizers",
    addRoute: "/add-fertilizer",
  },
  {
    name: "Sales",
    description: "Keep track of your crop sales and revenue data.",
    viewRoute: "/sales",
    addRoute: "/add-sale",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // ✅ Check if logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first!");
      navigate("/login");
    }
  }, [navigate]);

  const farmerName = localStorage.getItem("farmerName");

  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-green-700 text-white py-6 text-center">
        <h1 className="text-3xl font-bold">🌾 Farmer Dashboard</h1>
        {farmerName && <p className="text-lg mt-2">Welcome, {farmerName}!</p>}
      </header>

      <div className="max-w-6xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <div
            key={card.name}
            className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition"
          >
            <h2 className="text-2xl font-bold text-green-800 mb-2">{card.name}</h2>
            <p className="text-green-700 mb-4">{card.description}</p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(card.viewRoute)}
                className="flex-1 bg-green-700 text-white px-4 py-2 rounded hover:bg-yellow-500 transition"
              >
                View {card.name}
              </button>
              <button
                onClick={() => navigate(card.addRoute)}
                className="flex-1 border border-green-700 text-green-700 px-4 py-2 rounded hover:bg-green-700 hover:text-white transition"
              >
                Add {card.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
