import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import StatCard from '../components/Common/StatCard';
import Card from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { Music, Users, Disc, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: overview, loading: l1, error: e1, refetch: r1 } = useFetch('/bi/overview');
  const { data: genres, loading: l2, error: e2, refetch: r2 } = useFetch('/bi/genre-distribution');
  const { data: yearTrend, loading: l3, error: e3, refetch: r3 } = useFetch('/bi/year-trend');
  const { data: topArtists, loading: l4, error: e4, refetch: r4 } = useFetch('/bi/top-artists?limit=8');

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); r4(); }} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Tracks" value={overview?.totalTracks || '-'} icon={Music} color="blue" />
        <StatCard label="Total Artists" value={overview?.totalArtists || '-'} icon={Users} color="green" />
        <StatCard label="Total Genres" value={overview?.totalGenres || '-'} icon={Disc} color="purple" />
        <StatCard label="Avg Popularity" value={overview?.avgPopularity || '-'} icon={TrendingUp} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Genre Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genres}>
              <XAxis dataKey="genre_name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => navigate(`/drilldown?type=genre&value=${encodeURIComponent(data.genre_name)}`)}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Tracks by Year">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={yearTrend?.slice(-30)}>
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="track_count"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, cursor: 'pointer' }}
                onClick={(data) => navigate(`/drilldown?type=year&value=${data.year}`)}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Artists">
          <div className="space-y-3">
            {topArtists?.map((a, i) => (
              <button
                key={i}
                onClick={() => navigate(`/drilldown?type=artist&value=${encodeURIComponent(a.artist_name)}`)}
                className="w-full flex items-center justify-between hover:bg-gray-50 rounded-lg p-1 -m-1 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-left">{a.artist_name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-800">{a.track_count} tracks</span>
                  <span className="text-xs text-gray-400 ml-2">avg {Number(a.avg_popularity).toFixed(1)}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title="Genre Share">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genres?.slice(0, 8)}
                dataKey="count"
                nameKey="genre_name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ genre_name, percent }) => `${genre_name} ${(percent * 100).toFixed(0)}%`}
                cursor="pointer"
                onClick={(data) => navigate(`/drilldown?type=genre&value=${encodeURIComponent(data.genre_name)}`)}
              >
                {genres?.slice(0, 8).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
