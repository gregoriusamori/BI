import { useState, useEffect } from 'react';
import useFetch from '../hooks/useFetch';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { SkeletonDashboard } from '../components/Common/Skeleton';
import ErrorMessage from '../components/Common/ErrorMessage';
import CorrelationHeatmap from '../components/Common/CorrelationHeatmap';

function InsightBox({ text }) {
  if (!text) return null;
  return (
    <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-r-lg">
      <p className="text-xs text-blue-700 dark:text-blue-300 italic leading-relaxed">{text}</p>
    </div>
  );
}

export default function MiningPage() {
  const { data: corrRes, loading: l1, error: e1, refetch: r1 } = useFetch('/mining/correlation');
  const { data: featRes, loading: l2, error: e2, refetch: r2 } = useFetch('/mining/feature-stats');
  const { data: patterns, loading: l3, error: e3, refetch: r3 } = useFetch('/mining/patterns');

  const [selectedCol, setSelectedCol] = useState('danceability');
  const [outliers, setOutliers] = useState([]);
  const [outlierLoading, setOutlierLoading] = useState(false);
  const [outlierError, setOutlierError] = useState(null);

  useEffect(() => {
    setOutlierLoading(true);
    setOutlierError(null);
      api.get(`/mining/outlier-records/${selectedCol}`)
      .then(r => setOutliers(r.data))
      .catch(() => setOutlierError('Failed to load outliers'))
      .finally(() => setOutlierLoading(false));
  }, [selectedCol]);

  const loading = l1 || l2 || l3;
  const error = e1 || e2 || e3;

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); }} />;

  const correlation = corrRes?.data || corrRes || null;
  const featureStats = featRes?.data || featRes || null;

  const outlierColumns = [
    { header: 'Track', accessor: 'track_name' },
    { header: 'Artist', accessor: 'artist_name' },
    { header: 'Value', accessor: selectedCol },
  ];

  const featureNames = ['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data Mining</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Feature Statistics">
          <InsightBox text={featRes?.insight} />
          {featureStats && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Feature</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Min</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Max</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {featureNames.map(f => (
                    <tr key={f} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-2 px-3 capitalize text-gray-800 dark:text-gray-200">{f}</td>
                      <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(featureStats[`min_${f}`] || 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(featureStats[`max_${f}`] || 0).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(featureStats[`avg_${f}`] || 0).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Correlation Matrix">
          <InsightBox text={corrRes?.insight} />
          <CorrelationHeatmap data={correlation} />
        </Card>
      </div>

      <Card title="Genre Patterns">
        {patterns?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Genre</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Tracks</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Energy</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Dance</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Valence</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Acoustic</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-600 dark:text-gray-400">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {patterns.map((p, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-2 px-3 font-medium text-gray-800 dark:text-gray-200">{p.genre_name}</td>
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{p.track_count}</td>
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(p.avg_energy || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(p.avg_danceability || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(p.avg_valence || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(p.avg_acousticness || 0).toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-gray-700 dark:text-gray-300">{Number(p.avg_popularity || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No patterns found. Import data first.</p>
        )}
      </Card>

      <Card title="Outlier Records (per feature)">
        <div className="mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">Feature:</label>
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
          >
            {featureNames.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        {outlierLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : outlierError ? (
          <ErrorMessage message={outlierError} />
        ) : (
          <DataTable columns={outlierColumns} data={outliers} />
        )}
      </Card>
    </div>
  );
}
