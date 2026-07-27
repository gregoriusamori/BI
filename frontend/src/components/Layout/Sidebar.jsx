import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Upload, Database, GitBranch, FileText, ShieldCheck, Settings, X } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/bi', label: 'BI Analysis', icon: BarChart3 },
  { path: '/integration', label: 'Integration', icon: Upload, admin: true },
  { path: '/mining', label: 'Data Mining', icon: Database },
  { path: '/clusters', label: 'Clustering', icon: GitBranch },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/data-quality', label: 'Data Quality', icon: ShieldCheck },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const { user } = useAuth();

  const filtered = navItems.filter(item => !item.admin || user?.role === 'admin');

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-4 border-b border-gray-700 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu</h2>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {filtered.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-700 dark:border-gray-800">
          <Link
            to="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
              location.pathname === '/settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-900 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
        <div className="px-4 pb-4 text-xs text-gray-500">
          BI Dashboard v1.0
        </div>
      </aside>
    </>
  );
}
