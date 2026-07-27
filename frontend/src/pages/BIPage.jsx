import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Common/Card';
import StatCard from '../components/Common/StatCard';
import TrackTable from '../components/Common/TrackTable';
import TrackFormModal from '../components/Common/TrackFormModal';
import DeleteConfirmModal from '../components/Common/DeleteConfirmModal';
import { SkeletonDashboard } from '../components/Common/Skeleton';
import ErrorMessage from '../components/Common/ErrorMessage';
import api from '../api/axios';
import { Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line } from 'recharts';
import { getChartColors } from '../utils/chartTheme';

function InsightBox({ text }) {
  if (!text) return null;
  return (
    <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
      <p className="text-xs text-blue-700 dark:text-blue-300 italic leading-relaxed">{text}</p>
    </div>
  );
}

export default function BIPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getChartColors(isDark);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: overview, loading: l1, error: e1, refetch: r1 } = useFetch('/bi/overview');
  const { data: genreRes, loading: l2, error: e2, refetch: r2 } = useFetch('/bi/genre-distribution');
  const { data: audioRes, loading: l3, error: e3, refetch: r3 } = useFetch('/bi/audio-features');
  const { data: popRes, loading: l4, error: e4, refetch: r4 } = useFetch('/bi/popularity-distribution');
  const { data: yearRes, loading: l5, error: e5, refetch: r5 } = useFetch('/bi/year-trend');

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTrack, setDeleteTrack] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleEdit = (e) => {
      setEditData(e.detail);
      setFormOpen(true);
    };
    const handleDelete = (e) => {
      setDeleteTrack(e.detail);
      setDeleteOpen(true);
    };
    window.addEventListener('track-edit', handleEdit);
    window.addEventListener('track-delete', handleDelete);
    return () => {
      window.removeEventListener('track-edit', handleEdit);
      window.removeEventListener('track-delete', handleDelete);
    };
  }, []);

  const loading = l1 || l2 || l3 || l4 || l5;
  const error = e1 || e2 || e3 || e4 || e5;

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); r4(); r5(); }} />;

  const audioStats = audioRes?.data || audioRes || null;
  const genres = genreRes?.data || genreRes || [];
  const popDist = popRes?.data || popRes || [];
  const yearData = yearRes?.data || yearRes || [];

  const radarData = audioStats ? [
    { feature: 'Dance', value: Number(audioStats.avg_danceability) * 100 },
    { feature: 'Energy', value: Number(audioStats.avg_energy) * 100 },
    { feature: 'Speech', value: Number(audioStats.avg_speechiness) * 100 },
    { feature: 'Acoustic', value: Number(audioStats.avg_acousticness) * 100 },
    { feature: 'Live', value: Number(audioStats.avg_liveness) * 100 },
    { feature: 'Valence', value: Number(audioStats.avg_valence) * 100 },
  ] : [];

  const chartYearData = yearData.slice(-20).map((d) => ({
    year: d.year,
    track_count: Number(d.track_count),
  })) || [];

  const refreshAll = () => {
    r1(); r2(); r3(); r4(); r5();
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tracks/${deleteTrack.track_id}`);
      setDeleteOpen(false);
      setDeleteTrack(null);
      refreshAll();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete track');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">BI Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Tracks" value={overview?.totalTracks || '-'} color="blue" />
        <StatCard label="Avg Popularity" value={overview?.avgPopularity || '-'} color="green" />
        <StatCard label="Total Genres" value={overview?.totalGenres || '-'} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Audio Features Profile">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={colors.grid} />
              <PolarAngleAxis dataKey="feature" tick={{ fontSize: 12, fill: colors.axis }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: colors.axis }} />
              <Radar name="Average" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} animationDuration={1000} />
            </RadarChart>
          </ResponsiveContainer>
          <InsightBox text={audioRes?.insight} />
        </Card>

        <Card title="Popularity Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popDist}>
              <XAxis dataKey="range" tick={{ fill: colors.axis }} />
              <YAxis tick={{ fill: colors.axis }} />
              <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
              <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
          <InsightBox text={popRes?.insight} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Genre Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genres} layout="vertical">
              <XAxis type="number" tick={{ fill: colors.axis }} />
              <YAxis dataKey="genre_name" type="category" width={100} tick={{ fontSize: 11, fill: colors.axis }} />
              <Tooltip formatter={(value) => [value, 'Tracks']} contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
              <Bar
                dataKey="track_count"
                fill="#8B5CF6"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data) => navigate(`/drilldown?type=genre&value=${encodeURIComponent(data.genre_name)}`)}
                animationDuration={1000}
              />
            </BarChart>
          </ResponsiveContainer>
          <InsightBox text={genreRes?.insight} />
        </Card>

        <Card title="Track Count by Year (Last 20)">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartYearData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: colors.axis }}
                tickLine={false}
              />
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
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 4, fill: '#F59E0B', cursor: 'pointer' }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                onClick={(data) => navigate(`/drilldown?type=year&value=${data.year}`)}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
          <InsightBox text={yearRes?.insight} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Track Data</h3>
          <button
            onClick={() => { setEditData(null); setFormOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium hover:scale-105 hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Track
          </button>
        </div>
        <TrackTable key={refreshKey} onRefresh={refreshAll} />
      </Card>

      <TrackFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditData(null); }}
        editData={editData}
        onSuccess={refreshAll}
      />

      <DeleteConfirmModal
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteTrack(null); }}
        track={deleteTrack}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </div>
  );
}
