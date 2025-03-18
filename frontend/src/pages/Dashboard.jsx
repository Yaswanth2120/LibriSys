import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Users, ClipboardCheck, FileText, LayoutDashboard, LogOut } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // ✅ Store user role

  // Simulating user authentication (Replace with real authentication logic)
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "student"; // Default to student
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole"); // Clear user role
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg p-4 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-blue-500" />
          <span className="text-xl font-bold">LibriSys</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col space-y-4">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-500">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>

          {role === "admin" && (
            <>
              <Link to="/manage-users" className="flex items-center gap-2 hover:text-blue-500">
                <Users className="h-5 w-5" />
                Manage Users
              </Link>
              <Link to="/manage-books" className="flex items-center gap-2 hover:text-blue-500">
                <ClipboardCheck className="h-5 w-5" />
                Manage Books
              </Link>
              <Link to="/reports" className="flex items-center gap-2 hover:text-blue-500">
                <FileText className="h-5 w-5" />
                Reports
              </Link>
            </>
          )}

          {role === "librarian" && (
            <>
              <Link to="/approve-requests" className="flex items-center gap-2 hover:text-blue-500">
                <ClipboardCheck className="h-5 w-5" />
                Approve Requests
              </Link>
              <Link to="/manage-books" className="flex items-center gap-2 hover:text-blue-500">
                <ClipboardCheck className="h-5 w-5" />
                Manage Books
              </Link>
            </>
          )}

          {role === "student" && (
            <>
              <Link to="/borrow-books" className="flex items-center gap-2 hover:text-blue-500">
                <ClipboardCheck className="h-5 w-5" />
                Borrow Books
              </Link>
              <Link to="/borrowed-books" className="flex items-center gap-2 hover:text-blue-500">
                <FileText className="h-5 w-5" />
                My Borrowed Books
              </Link>
            </>
          )}

          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700 mt-auto">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Theme Toggle in Top Right */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold">
            Welcome, {role.charAt(0).toUpperCase() + role.slice(1)} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {role === "admin" && "You can manage users, books, and generate reports."}
            {role === "librarian" && "You can manage book requests and oversee library records."}
            {role === "student" && "Browse books, borrow and return them before due dates."}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
