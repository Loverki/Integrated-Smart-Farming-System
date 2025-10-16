import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-green-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 text-2xl font-bold text-yellow-300">
            🌱 Smart Farming India
          </div>
          <div className="hidden md:flex space-x-6 font-medium">
            <Link to="/" className="hover:text-yellow-300 transition-colors">
              Home
            </Link>
            <a href="#about" className="hover:text-yellow-300 transition-colors">
              About Agriculture
            </a>
            <a href="#machinery" className="hover:text-yellow-300 transition-colors">
              Machinery
            </a>
            <a href="#techniques" className="hover:text-yellow-300 transition-colors">
              Techniques
            </a>
            <a href="#sales" className="hover:text-yellow-300 transition-colors">
              Sales
            </a>
            <a href="#growth" className="hover:text-yellow-300 transition-colors">
              Growth in India
            </a>
          </div>
          <div className="md:hidden">
            {/* Mobile menu button placeholder */}
          </div>
        </div>
      </div>
    </nav>
  );
}
