import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BarChart3, Upload, Database, GitBranch, FileText, Table2 } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/bi', label: 'BI Analysis', icon: BarChart3 },
  { path: '/integration', label: 'Integration', icon: Upload, admin: true },
  { path: '/mining', label: 'Data Mining', icon: Database },
  { path: '/clusters', label: 'Clustering', icon: GitBranch },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/dynamic', label: 'Dynamic Tables', icon: Table2 },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const filtered = navItems.filter(item => !item.admin || user?.role === 'admin');

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Menu</h2>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {filtered.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        BI Dashboard v1.0
      </div>
    </aside>
  );
}
