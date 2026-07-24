import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MiningPage() {
  const [correlation, setCorrelation] = useState(null);
  const [featureStats, setFeatureStats] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [selectedCol, setSelectedCol] = useState('danceability');
  const [outliers, setOutliers] = useState([]);

  useEffect(() => {
    api.get('/mining/correlation').then(r => setCorrelation(r.data));
    api.get('/mining/feature-stats').then(r => setFeatureStats(r.data));
    api.get('/mining/patterns').then(r => setPatterns(r.data));
  }, []);

  useEffect(() => {
    api.get(`/mining/outliers/${selectedCol}`).then(r => setOutliers(r.data));
  }, [selectedCol]);

  const columns = [
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
                      <td className="py-2 px-3 text-right">{Number(featureStats[`min_${f}`]).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right">{Number(featureStats[`max_${f}`]).toFixed(3)}</td>
                      <td className="py-2 px-3 text-right">{Number(featureStats[`avg_${f}`]).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Correlation Matrix">
          {correlation && (
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(correlation).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={`text-sm font-bold ${Number(val) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(val).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Genre Patterns">
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
                  <td className="py-2 px-3 text-right">{Number(p.avg_energy).toFixed(3)}</td>
                  <td className="py-2 px-3 text-right">{Number(p.avg_danceability).toFixed(3)}</td>
                  <td className="py-2 px-3 text-right">{Number(p.avg_valence).toFixed(3)}</td>
                  <td className="py-2 px-3 text-right">{Number(p.avg_acousticness).toFixed(3)}</td>
                  <td className="py-2 px-3 text-right">{Number(p.avg_popularity).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        <DataTable columns={columns} data={outliers} />
      </Card>
    </div>
  );
}
