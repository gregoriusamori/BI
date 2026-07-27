import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useTheme } from '../context/ThemeContext';
import StatCard from '../components/Common/StatCard';
import Card from '../components/Common/Card';
import { SkeletonDashboard } from '../components/Common/Skeleton';
import ErrorMessage from '../components/Common/ErrorMessage';
import { Music, Users, Disc, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, BarChart, Bar } from 'recharts';
import { getChartColors, CHART_PALETTE } from '../utils/chartTheme';

function InsightBox({ text }) {
  if (!text) return null;
  return (
    <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
      <p className="text-xs text-blue-700 dark:text-blue-300 italic leading-relaxed">{text}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getChartColors(isDark);
  const [showAllArtists, setShowAllArtists] = useState(false);
  const { data: overview, loading: l1, error: e1, refetch: r1 } = useFetch('/bi/overview');
  const { data: genreRes, loading: l2, error: e2, refetch: r2 } = useFetch('/bi/genre-distribution');
  const { data: yearRes, loading: l3, error: e3, refetch: r3 } = useFetch('/bi/year-trend');
  const { data: topArtistsRes, loading: l4, error: e4, refetch: r4 } = useFetch('/bi/top-artists?limit=8');
  const { data: allArtists, loading: l5, error: e5 } = useFetch('/bi/all-artists');

  const loading = l1 || l2 || l3 || l4 || l5;
  const error = e1 || e2 || e3 || e4 || e5;

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); r4(); }} />;

  const genres = genreRes?.data || genreRes || [];
  const yearData = yearRes?.data || yearRes || [];
  const topArtists = topArtistsRes?.data || topArtistsRes || [];
  const artists = allArtists || [];
  const chartYearData = yearData.slice(-30).map((d) => ({
    year: d.year,
    track_count: Number(d.track_count),
  })) || [];

  const getPopBadge = (avgPop) => {
    const pop = Number(avgPop);
    if (pop >= 70) return <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">Populer</span>;
    if (pop >= 40) return <span className="px-1.5 py-0.5 text-[10px] font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">Sedang</span>;
    return <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">Rendah</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Tracks" value={overview?.totalTracks || '-'} icon={Music} color="blue" />
        <StatCard label="Total Artists" value={overview?.totalArtists || '-'} icon={Users} color="green" />
        <StatCard label="Total Genres" value={overview?.totalGenres || '-'} icon={Disc} color="purple" />
        <StatCard label="Avg Popularity" value={overview?.avgPopularity || '-'} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tracks by Year">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartYearData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.axis }} tickLine={false} />
              <YAxis
                allowDecimals={false}
                domain={[0, (dataMax) => Math.ceil(dataMax * 1.1)]}
                tick={{ fontSize: 11, fill: colors.axis }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [value, 'Tracks']}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }}
              />
              <Line
                type="monotone"
                dataKey="track_count"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#3B82F6', cursor: 'pointer' }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                onClick={(data) => navigate(`/drilldown?type=year&value=${data.year}`)}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
          <InsightBox text={yearRes?.insight} />
        </Card>

        <Card title="Genre Share">
          {genres && genres.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genres.slice(0, 8).map((g) => ({ ...g, count: Number(g.track_count) }))}
                    dataKey="count"
                    nameKey="genre_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    cursor="pointer"
                    onClick={(data) => navigate(`/drilldown?type=genre&value=${encodeURIComponent(data.genre_name)}`)}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {genres.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tracks']} contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
                </PieChart>
              </ResponsiveContainer>
              <InsightBox text={genreRes?.insight} />
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400 dark:text-gray-500 text-sm">
              No genre data available
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Artists">
          <div className="space-y-3">
            {topArtists?.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(`/drilldown?type=artist&value=${encodeURIComponent(a.artist_name)}`)}
                className="w-full flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg p-1 -m-1 transition-all duration-200 hover:scale-[1.01] hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-left">{a.artist_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{a.track_count} tracks</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">avg {Number(a.avg_popularity).toFixed(1)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Average Popularity by Artist">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={topArtists?.map(a => ({ name: a.artist_name, avg_popularity: Number(a.avg_popularity) })) || []}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: colors.axis }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: colors.axis }}
              />
              <Tooltip
                formatter={(value) => [value, 'Avg Popularity']}
                labelStyle={{ fontWeight: 'bold' }}
                contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }}
              />
              <Bar
                dataKey="avg_popularity"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => navigate(`/drilldown?type=artist&value=${encodeURIComponent(data.name)}`)}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {topArtists?.map((_, i) => (
                  <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <InsightBox text={topArtistsRes?.insight} />
        </Card>
      </div>

      <Card title={`All Artists (${artists.length})`}>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Daftar seluruh artist dalam dataset beserta deskripsi otomatis berdasarkan data.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400 w-8">#</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Artist</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Tracks</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Avg Pop</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Periode</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Genre</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {(showAllArtists ? artists : artists.slice(0, 10)).map((a, i) => (
                <tr
                  key={a.artist_id}
                  className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/drilldown?type=artist&value=${encodeURIComponent(a.artist_name)}`)}
                >
                  <td className="py-2 px-3 text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-100">{a.artist_name}</td>
                  <td className="py-2 px-3 text-right font-semibold text-gray-700 dark:text-gray-200">{a.track_count}</td>
                  <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-300">{a.avg_popularity}</td>
                  <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                    {a.first_year && a.last_year
                      ? a.first_year === a.last_year ? a.first_year : `${a.first_year}-${a.last_year}`
                      : '-'}
                  </td>
                  <td className="py-2 px-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{a.genres || '-'}</td>
                  <td className="py-2 px-3">{getPopBadge(a.avg_popularity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {artists.length > 10 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllArtists(!showAllArtists)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-105"
            >
              {showAllArtists ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Tampilkan lebih sedikit
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Tampilkan semua {artists.length} artist
                </>
              )}
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
