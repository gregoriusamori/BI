import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import StatCard from '../components/Common/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function ClusterPage() {
  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/clusters/stats').then(r => setStats(r.data));
  }, []);

  const runClustering = async () => {
    setLoading(true);
    try {
      await api.post('/clusters/run');
      api.get('/clusters/stats').then(r => setStats(r.data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectCluster = async (id) => {
    setSelectedCluster(id);
    const res = await api.get(`/clusters/${id}/tracks`);
    setTracks(res.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Clustering Analysis</h1>
        <button
          onClick={runClustering}
          disabled={loading}
          className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Running...' : 'Run K-Means (K=5)'}
        </button>
      </div>

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
            <p className="text-xs text-gray-400 mt-1">Avg Pop: {Number(s.avg_popularity).toFixed(1)}</p>
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

      {selectedCluster !== null && tracks.length > 0 && (
        <Card title={`Top Tracks - Cluster ${selectedCluster}`}>
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
                    <td className="py-2 px-3 text-right">{Number(t.energy).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right">{Number(t.danceability).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right">{t.popularity_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
