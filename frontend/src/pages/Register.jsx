import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Github, X } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ✅ Use React Router for navigation

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering student with:", { name, email, password });

    // ✅ Simulate successful registration and redirect
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Theme Toggle in Top Right */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Logo in Top Left */}
      <Link to="/" className="absolute left-4 top-4 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-500" />
        <span className="text-xl font-bold">LibriSys</span>
      </Link>

      {/* Register Card */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center">Create a Student Account</h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Enter your details to register as a student.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring focus:ring-blue-400"
              placeholder="John Doe"
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring focus:ring-blue-400"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring focus:ring-blue-400"
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
          >
            Register as Student
          </button>
        </form>

        {/* Social Login Buttons */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button className="w-full flex items-center justify-center border rounded-lg py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <Github className="mr-2 h-5 w-5" />
            Github
          </button>
          <button className="w-full flex items-center justify-center border rounded-lg py-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <X className="mr-2 h-5 w-5" />
            Twitter
          </button>
        </div>

        {/* Login Redirect */}
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;