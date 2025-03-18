import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md flex items-center"
    >
      {theme === "light" ? (
        <>
          <Sun className="h-5 w-5 text-yellow-500" />
          <span className="ml-2">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 text-gray-300" />
          <span className="ml-2">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
