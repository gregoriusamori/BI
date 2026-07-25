import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Database, GitBranch, FileText, Upload, PieChart, ArrowRight, Users, Music, Disc, Calendar, ChevronRight, Layers, Zap, Target } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'BI Analysis', desc: 'Interactive charts and real-time analytics for deep data understanding.' },
  { icon: Upload, title: 'Data Integration', desc: 'Import CSV datasets directly into PostgreSQL with one click.' },
  { icon: Database, title: 'Data Mining', desc: 'Extract patterns, correlations, and insights from your data.' },
  { icon: GitBranch, title: 'Clustering', desc: 'Group data using K-Means algorithm with configurable K value.' },
  { icon: FileText, title: 'Reporting', desc: 'Generate reports and export to PDF or CSV format.' },
  { icon: Layers, title: 'Dynamic Tables', desc: 'Create and manage custom tables directly from the dashboard.' },
];

const stats = [
  { icon: Music, value: '15,150+', label: 'Total Tracks' },
  { icon: Users, value: '3,083', label: 'Artists' },
  { icon: Disc, value: '19', label: 'Genres' },
  { icon: Calendar, value: '1899–2024', label: 'Year Range' },
];

const steps = [
  { num: '01', title: 'Upload Dataset', desc: 'Import your CSV file into the system with drag & drop.' },
  { num: '02', title: 'Analyze & Explore', desc: 'Run BI analysis, data mining, and clustering on your data.' },
  { num: '03', title: 'Get Insights', desc: 'Visualize results on interactive dashboards and export reports.' },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <BarChart3 className="w-7 h-7" />
          BI Dashboard
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition text-sm">
                Login
              </Link>
              <Link to="/register" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">Powered by Node.js, React & PostgreSQL</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Business Intelligence<br />Dashboard
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Analyze, visualize, and discover insights from your data. Built for the Spotify Classic Hits dataset with 15,000+ records.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg shadow-lg shadow-blue-600/25"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 transition font-medium text-lg"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Full-stack BI platform with analysis, mining, clustering, and reporting — all in one dashboard.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="group bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Three simple steps to get insights from your data.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative text-center md:text-left">
                <div className="text-5xl font-bold text-blue-500/20 mb-4">{s.num}</div>
                <h3 className="text-white font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-4 w-8 h-8 text-white/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Built With Modern Stack</h2>
          <p className="text-gray-400">Industry-standard tools for reliability and performance.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Node.js', desc: 'Backend API' },
            { name: 'React', desc: 'Frontend UI' },
            { name: 'PostgreSQL', desc: 'Database' },
            { name: 'TailwindCSS', desc: 'Styling' },
          ].map((t, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center hover:border-blue-500/30 transition">
              <p className="text-white font-semibold">{t.name}</p>
              <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore Your Data?</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Sign up for free and start analyzing your datasets with powerful BI tools.
          </p>
          <Link
            to={user ? '/dashboard' : '/register'}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg shadow-lg shadow-blue-600/25"
          >
            {user ? 'Go to Dashboard' : 'Start Free'} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black/20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <BarChart3 className="w-5 h-5" />
              BI Dashboard
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition">Documentation</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
            <p className="text-sm text-gray-500">&copy; 2026 BI Dashboard. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
