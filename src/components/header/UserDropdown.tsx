import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import ThemeTogglerTwo from "../common/ThemeTogglerTwo";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      {/* Profile Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <img
          src="/images/user/owner.jpg"
          alt="User"
          className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-500/20"
        />

        <div className="hidden text-left lg:block">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
            Anshu Yadav
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Administrator
          </p>
        </div>

        <svg
          className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 z-50 mt-3 w-80 rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
      >
        {/* User Card */}
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white/50 p-4 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center gap-4">
            <img
              src="/images/user/owner.jpg"
              alt="User"
              className="h-14 w-14 rounded-full border border-white/20 object-cover shadow-md"
            />

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Anshu Yadav
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Administrator
              </p>

              <p className="text-xs text-gray-400">
                withanshu@gmail.com
              </p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="space-y-2">
          {/* Profile */}
          <DropdownItem
            tag="a"
            to="/profile"
            onItemClick={closeDropdown}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/10">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
              </svg>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                My Profile
              </h4>
              <p className="text-xs text-gray-500">
                View account details
              </p>
            </div>
          </DropdownItem>

          {/* Settings */}
          <DropdownItem
            tag="a"
            to="/settings"
            onItemClick={closeDropdown}
            className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 15.5A3.5 3.5 0 1 0 12 8.5A3.5 3.5 0 0 0 12 15.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.79 16.88A2 2 0 1 1 16.96 19.71L16.9 19.65A1.65 1.65 0 0 0 15.08 19.32A1.65 1.65 0 0 0 14 20.85V21A2 2 0 1 1 10 21V20.85A1.65 1.65 0 0 0 8.92 19.32A1.65 1.65 0 0 0 7.1 19.65L7.04 19.71A2 2 0 1 1 4.21 16.88L4.27 16.82A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.07 14H3A2 2 0 1 1 3 10H3.07A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4.27 7.18L4.21 7.12A2 2 0 1 1 7.04 4.29L7.1 4.35A1.65 1.65 0 0 0 8.92 4.68A1.65 1.65 0 0 0 10 3.15V3A2 2 0 1 1 14 3V3.15A1.65 1.65 0 0 0 15.08 4.68A1.65 1.65 0 0 0 16.9 4.35L16.96 4.29A2 2 0 1 1 19.79 7.12L19.73 7.18A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 20.93 10H21A2 2 0 1 1 21 14H20.93A1.65 1.65 0 0 0 19.4 15Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                Settings
              </h4>
              <p className="text-xs text-gray-500">
                Manage preferences
              </p>
            </div>
          </DropdownItem>
        </div>

        {/* Theme */}
        <div className="my-4 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-lg"> </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </span>
          </div>

          <ThemeTogglerTwo />
        </div>

        {/* Logout */}
        <button
          onClick={closeDropdown}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-50 py-3 font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M16 17L21 12L16 7M21 12H9M13 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          Sign Out
        </button>
      </Dropdown>
    </div>
  );
}