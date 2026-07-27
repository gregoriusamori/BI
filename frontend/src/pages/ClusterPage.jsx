import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import Card from '../components/Common/Card';
import { SkeletonDashboard } from '../components/Common/Skeleton';
import ErrorMessage from '../components/Common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartColors, CHART_PALETTE } from '../utils/chartTheme';

function InsightBox({ text }) {
  if (!text) return null;
  return (
    <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
      <p className="text-xs text-blue-700 dark:text-blue-300 italic leading-relaxed">{text}</p>
    </div>
  );
}

export default function ClusterPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getChartColors(isDark);
  const { data: statsRes, loading, error, refetch } = useFetch('/clusters/stats');
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState(null);
  const [running, setRunning] = useState(false);
  const [kValue, setKValue] = useState(5);
  const [clusterError, setClusterError] = useState(null);

  const runClustering = async () => {
    if (kValue < 2 || kValue > 10) {
      setClusterError('K must be between 2 and 10');
      return;
    }
    setRunning(true);
    setClusterError(null);
    try {
      await api.post('/clusters/run', { k: kValue }, { timeout: 120000 });
      refetch();
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Clustering failed. Please try again.';
      setClusterError(msg);
    } finally {
      setRunning(false);
    }
  };

  const selectCluster = async (id) => {
    setSelectedCluster(id);
    setTracksLoading(true);
    setTracksError(null);
    try {
      const res = await api.get(`/clusters/${id}/tracks`);
      setTracks(res.data);
    } catch (err) {
      setTracksError('Failed to load cluster tracks');
    } finally {
      setTracksLoading(false);
    }
  };

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  const stats = statsRes?.data || statsRes || [];
  const clusterInsight = statsRes?.insight || '';

  const gridCols = stats.length <= 5 ? 'md:grid-cols-5' : stats.length <= 8 ? 'md:grid-cols-5 lg:grid-cols-8' : 'md:grid-cols-5 lg:grid-cols-10';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Clustering Analysis</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">K value:</label>
            <input
              type="number"
              min={2}
              max={10}
              value={kValue}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 2;
                setKValue(Math.max(2, Math.min(10, v)));
              }}
              className={`w-20 px-3 py-2 border rounded-lg text-sm text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors ${
                kValue < 2 || kValue > 10 ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">(2-10)</span>
          </div>
          <button
            onClick={runClustering}
            disabled={running || kValue < 2 || kValue > 10}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium hover:scale-105 hover:shadow-md"
          >
            {running ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Clustering...
              </span>
            ) : `Run K-Means (K=${kValue})`}
          </button>
        </div>
      </div>

      {clusterError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {clusterError}
        </div>
      )}

      {(!stats || stats.length === 0) ? (
        <Card>
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="mb-3">No clustering data available</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Set K value (2-10) and run clustering to group your tracks</p>
          </div>
        </Card>
      ) : (
        <>
          <InsightBox text={clusterInsight} />

          <div className={`grid grid-cols-2 ${gridCols} gap-4`}>
            {stats.map((s, i) => (
              <div
                key={s.cluster_id}
                onClick={() => selectCluster(s.cluster_id)}
                className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${
                  selectedCluster === s.cluster_id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cluster {s.cluster_id}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">{s.cluster_label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-50">{s.track_count} tracks</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Avg Pop: {Number(s.avg_popularity || 0).toFixed(1)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cluster Size Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <XAxis dataKey="cluster_label" tick={{ fontSize: 10, fill: colors.axis }} />
                  <YAxis allowDecimals={false} tick={{ fill: colors.axis }} />
                  <Tooltip formatter={(value) => [value, 'Tracks']} contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
                  <Bar dataKey="track_count" radius={[4, 4, 0, 0]} animationDuration={1000}>
                    {stats.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Average Popularity by Cluster">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <XAxis dataKey="cluster_label" tick={{ fontSize: 10, fill: colors.axis }} />
                  <YAxis tick={{ fill: colors.axis }} />
                  <Tooltip formatter={(value) => [Number(value).toFixed(1), 'Avg Popularity']} contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
                  <Bar dataKey="avg_popularity" radius={[4, 4, 0, 0]} animationDuration={1000}>
                    {stats.map((_, i) => (
                      <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {selectedCluster !== null && (
            <Card title={`Top Tracks - Cluster ${selectedCluster}`}>
              {tracksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                </div>
              ) : tracksError ? (
                <ErrorMessage message={tracksError} />
              ) : tracks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Track</th>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Artist</th>
                        <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Genre</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Energy</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Dance</th>
                        <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Popularity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.map((t, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{t.track_name}</td>
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{t.artist_name}</td>
                          <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{t.genre_name}</td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(t.energy || 0).toFixed(3)}</td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(t.danceability || 0).toFixed(3)}</td>
                          <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{t.popularity_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No tracks in this cluster</p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
