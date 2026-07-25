import { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import CorrelationHeatmap from '../components/Common/CorrelationHeatmap';

export default function MiningPage() {
  const { data: correlation, loading: l1, error: e1, refetch: r1 } = useFetch('/mining/correlation');
  const { data: featureStats, loading: l2, error: e2, refetch: r2 } = useFetch('/mining/feature-stats');
  const { data: patterns, loading: l3, error: e3, refetch: r3 } = useFetch('/mining/patterns');

  const [selectedCol, setSelectedCol] = useState('danceability');
  const [outliers, setOutliers] = useState([]);
  const [outlierLoading, setOutlierLoading] = useState(false);
  const [outlierError, setOutlierError] = useState(null);

  useEffect(() => {
    setOutlierLoading(true);
    setOutlierError(null);
    api.get(`/mining/outliers/${selectedCol}`)
      .then(r => setOutliers(r.data))
      .catch(() => setOutlierError('Failed to load outliers'))
      .finally(() => setOutlierLoading(false));
  }, [selectedCol]);

  const loading = l1 || l2 || l3;
  const error = e1 || e2 || e3;

  if (loading) return <LoadingSpinner text="Loading data mining..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); }} />;

  const outlierColumns = [
    { header: 'Track', accessor: 'track_name' },
    { header: 'Artist', accessor: 'artist_name' },
    { header: 'Value', accessor: selectedCol },
  ];

  const featureNames = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Data Mining</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Feature Statistics">
          {featureStats && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-600">Feature</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600">Min</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600">Max</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {featureNames.map(f => (
                    <tr key={f} className="border-b border-gray-100">
                      <td className="py-2 px-3 capitalize">{f}</td>
                      <td className="py-2 px-3 text-right">{Number(featureStats[`min_${f}`] || 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right">{Number(featureStats[`max_${f}`] || 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right">{Number(featureStats[`avg_${f}`] || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Correlation Matrix">
          <CorrelationHeatmap data={correlation} />
        </Card>
      </div>

      <Card title="Genre Patterns">
        {patterns?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600">Genre</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Tracks</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Energy</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Dance</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Valence</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Acoustic</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium">{p.genre_name}</td>
                    <td className="py-2 px-3 text-right">{p.track_count}</td>
                    <td className="py-2 px-3 text-right">{Number(p.avg_energy || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right">{Number(p.avg_danceability || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right">{Number(p.avg_valence || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right">{Number(p.avg_acousticness || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right">{Number(p.avg_popularity || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No patterns found. Import data first.</p>
        )}
      </Card>

      <Card title="Outlier Detection">
        <div className="mb-4">
          <label className="text-sm text-gray-600 mr-2">Feature:</label>
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
          >
            {featureNames.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        {outlierLoading ? (
          <LoadingSpinner text="Loading outliers..." />
        ) : outlierError ? (
          <ErrorMessage message={outlierError} />
        ) : (
          <DataTable columns={outlierColumns} data={outliers} />
        )}
      </Card>
    </div>
  );
}
