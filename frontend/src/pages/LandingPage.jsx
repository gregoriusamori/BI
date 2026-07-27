import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, useReducedMotion } from 'framer-motion';
import { BarChart3, Database, GitBranch, FileText, Upload, ArrowRight, Users, Music, Disc, Calendar, ChevronRight, Zap } from 'lucide-react';

const features = [
  { icon: BarChart3, title: 'BI Analysis', desc: 'Interactive charts and real-time analytics for deep data understanding.' },
  { icon: Upload, title: 'Data Integration', desc: 'Import CSV datasets directly into PostgreSQL with one click.' },
  { icon: Database, title: 'Data Mining', desc: 'Extract patterns, correlations, and insights from your data.' },
  { icon: GitBranch, title: 'Clustering', desc: 'Group data using K-Means algorithm with configurable K value.' },
  { icon: FileText, title: 'Reporting', desc: 'Generate reports and export to PDF or CSV format.' },
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

const techStack = [
  { name: 'Node.js', desc: 'Backend API', color: '#68A063', glow: 'rgba(104, 160, 99, 0.4)' },
  { name: 'React', desc: 'Frontend UI', color: '#61DAFB', glow: 'rgba(97, 218, 251, 0.4)' },
  { name: 'PostgreSQL', desc: 'Database', color: '#336791', glow: 'rgba(51, 103, 145, 0.4)' },
  { name: 'TailwindCSS', desc: 'Styling', color: '#38BDF8', glow: 'rgba(56, 189, 248, 0.4)' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.12, ease: 'easeOut' },
  }),
};

export default function LandingPage() {
  const { user } = useAuth();
  const prefersReduced = useReducedMotion();

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'linear-gradient(165deg, #0a0f1a 0%, #0c1a33 30%, #0f2340 55%, #0c1a33 80%, #0a0f1a 100%)' }}>

      {/* ===== FLOATING ORBS (background decoration) ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/6 w-72 h-72 bg-blue-600/8 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl animate-float-slow-delayed" />
      </div>

      {/* ===== NAVBAR ===== */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-8 py-4 border-b border-white/10 animate-fade-in-down">
        <div className="flex items-center gap-2 text-white font-bold text-xl">
          <BarChart3 className="w-7 h-7 animate-float" />
          BI Dashboard
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="relative overflow-hidden px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium hover:scale-105 transform">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition text-sm hover:scale-105 transform">
                Login
              </Link>
              <Link to="/register" className="relative overflow-hidden px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium hover:scale-105 transform">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6"
        >
          <Zap className="w-4 h-4 text-blue-400 animate-pulse-glow" />
          <span className="text-sm text-blue-300">Powered by Node.js, React & PostgreSQL</span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
        >
          Business Intelligence<br />Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
        >
          Analyze, visualize, and discover insights from your data. Built for the Spotify Classic Hits dataset with 15,000+ records.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4"
        >
          <Link
            to={user ? '/dashboard' : '/register'}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-medium text-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 hover:scale-105 transform overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/20 text-white rounded-xl hover:bg-white/10 transition font-medium text-lg hover:scale-105 transform"
          >
            View Demo
          </Link>
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative z-10 border-y border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="text-center hover:scale-110 transform transition duration-300"
                >
                  <Icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-sm text-gray-400 mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-white mb-3">Everything You Need</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Full-stack BI platform with analysis, mining, clustering, and reporting — all in one dashboard.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={!prefersReduced ? { y: -6, transition: { duration: 0.25 } } : {}}
                className="group relative rounded-xl p-6 border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative z-10 border-y border-white/10 bg-gradient-to-b from-white/[0.02] via-white/[0.05] to-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-gray-400">Three simple steps to get insights from your data.</p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[2px]">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500/50 via-cyan-400/50 to-blue-500/50 origin-left"
              />
            </div>

            {steps.map((s, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                custom={i}
                className="relative text-center md:text-left"
              >
                <motion.div
                  initial={{ opacity: 0.15 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.2 }}
                  className="text-5xl font-bold text-blue-500/20 mb-4"
                >
                  {s.num}
                </motion.div>
                <h3 className="text-white font-semibold text-xl mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>

                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.3 }}
                    className="hidden md:flex absolute top-10 -right-4 z-10 w-8 h-8 items-center justify-center"
                  >
                    <ChevronRight className="w-6 h-6 text-blue-400/60" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECH STACK ===== */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-bold text-white mb-3">Built With Modern Stack</h2>
          <p className="text-gray-400">Industry-standard tools for reliability and performance.</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {techStack.map((t, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              custom={i}
              whileHover={!prefersReduced ? { y: -4, scale: 1.05, transition: { duration: 0.25 } } : {}}
              className="relative group rounded-xl p-5 text-center border border-white/10 backdrop-blur-sm transition-all duration-300 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              }}
            >
              {/* Colored glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                style={{ boxShadow: `inset 0 0 30px ${t.glow}, 0 0 20px ${t.glow}` }}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl border-2"
                style={{ borderColor: t.color + '60' }}
              />
              <div className="relative z-10">
                <p className="text-white font-semibold">{t.name}</p>
                <p className="text-gray-500 text-xs mt-1">{t.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 border-t border-white/10 overflow-hidden">
        {/* Background glow orbs for CTA */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-3xl animate-float-slow-delayed" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-20 text-center">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-3xl font-bold text-white mb-4"
          >
            Ready to Explore Your Data?
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            className="text-gray-400 mb-8 max-w-lg mx-auto"
          >
            Sign up for free and start analyzing your datasets with powerful BI tools.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
          >
            <Link
              to={user ? '/dashboard' : '/register'}
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-medium text-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-300 hover:scale-105 transform overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {user ? 'Go to Dashboard' : 'Start Free'} <ArrowRight className="w-5 h-5" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]" />
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2 text-white font-semibold">
              <BarChart3 className="w-5 h-5" />
              BI Dashboard
            </div>
            <div className="flex items-center gap-6 text-sm">
              {[
                { label: 'Documentation', href: '#' },
                { label: 'GitHub', href: 'https://github.com/gregoriusamori/BI', external: true },
                { label: 'Contact', href: '#' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  className="relative text-gray-400 hover:text-white transition-colors duration-200 py-1 group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-blue-400 group-hover:w-full transition-all duration-300 ease-out" />
                </a>
              ))}
            </div>
            <p className="text-sm text-gray-500">&copy; 2026 BI Dashboard. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
