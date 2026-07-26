import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import api from '../api/axios';
import Card from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

export default function ClusterPage() {
  const { data: stats, loading, error, refetch } = useFetch('/clusters/stats');
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [tracksError, setTracksError] = useState(null);
  const [running, setRunning] = useState(false);
  const [kValue, setKValue] = useState(5);
  const [clusterError, setClusterError] = useState(null);

  const runClustering = async () => {
    setRunning(true);
    setClusterError(null);
    try {
      await api.post('/clusters/run', { k: kValue });
      refetch();
    } catch (err) {
      setClusterError('Clustering failed. Please try again.');
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

  if (loading) return <LoadingSpinner text="Loading clusters..." />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Clustering Analysis</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">K value:</label>
            <input
              type="number"
              min={2}
              max={20}
              value={kValue}
              onChange={(e) => setKValue(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center"
            />
          </div>
          <button
            onClick={runClustering}
            disabled={running}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm font-medium"
          >
            {running ? 'Running...' : `Run K-Means (K=${kValue})`}
          </button>
        </div>
      </div>

      {clusterError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {clusterError}
        </div>
      )}

      {(!stats || stats.length === 0) ? (
        <Card>
          <div className="text-center py-12 text-gray-400">
            <p className="mb-3">No clustering data available</p>
            <p className="text-sm text-gray-500 mb-3">Set K value and run clustering to group your tracks</p>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.map((s, i) => (
              <div
                key={s.cluster_id}
                onClick={() => selectCluster(s.cluster_id)}
                className={`cursor-pointer rounded-xl p-4 border-2 transition ${
                  selectedCluster === s.cluster_id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % 5] }} />
                  <span className="text-xs font-semibold text-gray-500">Cluster {s.cluster_id}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-1">{s.cluster_label}</p>
                <p className="text-lg font-bold text-gray-900">{s.track_count} tracks</p>
                <p className="text-xs text-gray-400 mt-1">Avg Pop: {Number(s.avg_popularity || 0).toFixed(1)}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Cluster Size Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <XAxis dataKey="cluster_label" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="track_count" radius={[4, 4, 0, 0]}>
                    {stats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Average Popularity by Cluster">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats}>
                  <XAxis dataKey="cluster_label" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg_popularity" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {selectedCluster !== null && (
            <Card title={`Top Tracks - Cluster ${selectedCluster}`}>
              {tracksLoading ? (
                <LoadingSpinner text="Loading tracks..." />
              ) : tracksError ? (
                <ErrorMessage message={tracksError} />
              ) : tracks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3">Track</th>
                        <th className="text-left py-2 px-3">Artist</th>
                        <th className="text-left py-2 px-3">Genre</th>
                        <th className="text-right py-2 px-3">Energy</th>
                        <th className="text-right py-2 px-3">Dance</th>
                        <th className="text-right py-2 px-3">Popularity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tracks.map((t, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-2 px-3 font-medium">{t.track_name}</td>
                          <td className="py-2 px-3">{t.artist_name}</td>
                          <td className="py-2 px-3">{t.genre_name}</td>
                          <td className="py-2 px-3 text-right">{Number(t.energy || 0).toFixed(3)}</td>
                          <td className="py-2 px-3 text-right">{Number(t.danceability || 0).toFixed(3)}</td>
                          <td className="py-2 px-3 text-right">{t.popularity_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No tracks in this cluster</p>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
