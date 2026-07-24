import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Database, GitBranch, FileText, Upload, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    { icon: BarChart3, title: 'BI Analysis', desc: 'Analisis data mendalam dengan visual interaktif' },
    { icon: Upload, title: 'Integration', desc: 'Import dataset dari CSV ke PostgreSQL' },
    { icon: Database, title: 'Data Mining', desc: 'Ekstraksi pola dan insight dari data' },
    { icon: GitBranch, title: 'Clustering', desc: 'Pengelompokan data dengan K-Means' },
    { icon: FileText, title: 'Reporting', desc: 'Generate laporan dalam berbagai format' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <BarChart3 className="w-7 h-7" />
          BI Dashboard
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-5 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition text-sm"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Business Intelligence Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Analisis data musik Spotify dengan 15,000+ records. Visualisasikan, analisis, dan temukan insight dari dataset klasik hits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
                <Icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link
            to={user ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
