import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { BookOpen, Clock, Users, CheckCircle } from "lucide-react";
import Footer from "../components/Footer"; // ✅ Importing Footer

const Home = () => {
  // ✅ Use State for Theme
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // ✅ Apply Theme Immediately on Change
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <span className="text-xl font-bold">LibriSys</span>
          </div>

          {/* Navigation + Theme Toggle */}
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/register" className="hover:underline">Register</Link>
            <button
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md flex items-center transition"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <>
                  🌙 Dark Mode
                </>
              ) : (
                <>
                  ☀️ Light Mode
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-400 py-20 text-white text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold md:text-5xl">Welcome to LibriSys 📚</h1>
            <p className="mt-4 text-lg md:text-xl">
              A modern library management system designed for students, librarians, and administrators.
            </p>
            <div className="mt-6 space-x-4">
              <Link to="/register">
                <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition">
                  Get Started
                </button>
              </Link>
              <Link to="/about">
                <button className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white/20 transition">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-all hover:shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Easy Book Management</h3>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Find and borrow books with our user-friendly search system and filters.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-all hover:shadow-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Role-Based Access</h3>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Tailored interfaces for students, librarians, and administrators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-all hover:shadow-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Due Date Reminders</h3>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Never miss a deadline with automatic reminders for book returns.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-200 dark:bg-gray-800 py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">What Our Users Say</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Testimonial 1 */}
              <div className="p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg">
                <p className="italic">
                  "LibriSys has completely transformed how our library operates. The interface is intuitive and our students love it!"
                </p>
                <p className="mt-4 font-semibold">- Sarah Johnson, Librarian</p>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg">
                <p className="italic">
                  "The dashboard makes it so easy to keep track of borrowed books and due dates. Great system!"
                </p>
                <p className="mt-4 font-semibold">- Michael Chen, Student</p>
              </div>

              {/* Testimonial 3 */}
              <div className="p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg">
                <p className="italic">
                  "The analytics feature helps us understand user patterns and optimize our collection accordingly."
                </p>
                <p className="mt-4 font-semibold">- Robert Parker, Administrator</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Section */}
      <Footer /> {/* ✅ Importing the Footer component */}
    </div>
  );
};

export default Home;
