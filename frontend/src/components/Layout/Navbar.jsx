import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, LogIn, UserPlus, Menu } from 'lucide-react';
import SearchBar from '../Common/SearchBar';
import ThemeToggle from '../Common/ThemeToggle';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initials = user?.username
    ? user.username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-3 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link to="/" className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold text-lg">
          <BarChart3 className="w-6 h-6" />
          <span className="hidden sm:inline">BI Dashboard</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {user && <SearchBar />}
        <ThemeToggle />
        {user ? (
          <>
            <Link to="/settings" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg px-2 py-1 transition">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:inline">{user.username}</span>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-gray-700 dark:text-gray-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="flex items-center gap-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1 px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Register</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
