import { useTheme } from "../../context/ThemeContext";

export default function ThemeTogglerTwo() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-all hover:bg-gray-100 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700"
    >
      {/* Sun Icon */}
      <svg
        className="hidden dark:block"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2V4M12 20V22M4 12H2M22 12H20M19.78 4.22L18.36 5.64M5.64 18.36L4.22 19.78M19.78 19.78L18.36 18.36M5.64 5.64L4.22 4.22"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle
          cx="12"
          cy="12"
          r="5"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      {/* Moon Icon */}
      <svg
        className="dark:hidden"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M21 12.79A9 9 0 1111.21 3c0 .25 0 .5.03.74A7 7 0 0021 12.79Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}