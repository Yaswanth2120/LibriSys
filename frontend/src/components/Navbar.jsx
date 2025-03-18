import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import ThemeToggle from "./ThemeToggle"; // ✅ Import the Theme Toggle component

const Navbar = () => {
  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md p-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-xl font-bold flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-500" />
        LibriSys
      </Link>

      {/* Navigation + Theme Toggle */}
      <div className="flex items-center gap-6">
        <Link to="/login" className="hover:underline">Login</Link>
        <Link to="/register" className="hover:underline">Register</Link>
        <ThemeToggle /> {/* ✅ Dark/Light Mode Button */}
      </div>
    </nav>
  );
};

export default Navbar;
