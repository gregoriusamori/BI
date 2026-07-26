import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Download, FileText } from 'lucide-react';

export default function ReportPage() {
  const navigate = useNavigate();
  const { data: summary, loading: l1, error: e1, refetch: r1 } = useFetch('/reports/summary');
  const { data: genreReport, loading: l2, error: e2, refetch: r2 } = useFetch('/reports/genre');
  const { data: artistReport, loading: l3, error: e3, refetch: r3 } = useFetch('/reports/artist?limit=15');
  const { data: decadeReport, loading: l4, error: e4, refetch: r4 } = useFetch('/reports/decade');
  const [activeTab, setActiveTab] = useState('summary');

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;

  if (loading) return <LoadingSpinner text="Loading reports..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); r4(); }} />;

  const genreColumns = [
    {
      header: 'Genre',
      accessor: 'genre_name',
      render: (row) => (
        <button
          onClick={() => navigate(`/drilldown?type=genre&value=${encodeURIComponent(row.genre_name)}`)}
          className="text-blue-600 hover:underline font-medium"
        >
          {row.genre_name}
        </button>
      ),
    },
    { header: 'Tracks', accessor: 'total_tracks' },
    { header: 'Avg Popularity', accessor: 'avg_popularity' },
    { header: 'Avg Energy', accessor: 'avg_energy' },
    { header: 'Avg Danceability', accessor: 'avg_danceability' },
  ];

  const artistColumns = [
    {
      header: 'Artist',
      accessor: 'artist_name',
      render: (row) => (
        <button
          onClick={() => navigate(`/drilldown?type=artist&value=${encodeURIComponent(row.artist_name)}`)}
          className="text-blue-600 hover:underline font-medium"
        >
          {row.artist_name}
        </button>
      ),
    },
    { header: 'Tracks', accessor: 'total_tracks' },
    { header: 'Avg Popularity', accessor: 'avg_popularity' },
    { header: 'Avg Energy', accessor: 'avg_energy' },
    { header: 'First Year', accessor: 'earliest_year' },
    { header: 'Last Year', accessor: 'latest_year' },
  ];

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'genre', label: 'Genre Report' },
    { id: 'artist', label: 'Artist Report' },
    { id: 'decade', label: 'Decade Report' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reporting Services</h1>

      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-gray-500">Total Tracks</p>
              <p className="text-3xl font-bold text-gray-800">{summary.total_tracks}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Total Artists</p>
              <p className="text-3xl font-bold text-gray-800">{summary.total_artists}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Total Genres</p>
              <p className="text-3xl font-bold text-gray-800">{summary.total_genres}</p>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-gray-500">Avg Popularity</p>
              <p className="text-3xl font-bold text-blue-600">{Number(summary.avg_popularity || 0).toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Avg Energy</p>
              <p className="text-3xl font-bold text-green-600">{Number(summary.avg_energy || 0).toFixed(3)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Avg Danceability</p>
              <p className="text-3xl font-bold text-purple-600">{Number(summary.avg_danceability || 0).toFixed(3)}</p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'genre' && (
        <Card title="Genre Analysis Report">
          <div className="flex gap-2 mb-4">
            <button onClick={() => exportToCSV(genreReport, 'genre-report')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={() => exportToPDF('Genre Analysis Report', genreReport, genreColumns)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <FileText className="w-3 h-3" /> PDF
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreReport}>
              <XAxis dataKey="genre_name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total_tracks"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => navigate(`/drilldown?type=genre&value=${encodeURIComponent(data.genre_name)}`)}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <DataTable columns={genreColumns} data={genreReport} />
          </div>
        </Card>
      )}

      {activeTab === 'artist' && (
        <Card title="Artist Analysis Report">
          <div className="flex gap-2 mb-4">
            <button onClick={() => exportToCSV(artistReport, 'artist-report')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={() => exportToPDF('Artist Analysis Report', artistReport, artistColumns)} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <FileText className="w-3 h-3" /> PDF
            </button>
          </div>
          <DataTable columns={artistColumns} data={artistReport} />
        </Card>
      )}

      {activeTab === 'decade' && (
        <Card title="Decade Analysis Report">
          <div className="flex gap-2 mb-4">
            <button onClick={() => exportToCSV(decadeReport, 'decade-report')} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button onClick={() => exportToPDF('Decade Analysis Report', decadeReport, [
              { header: 'Decade', accessor: 'decade' },
              { header: 'Tracks', accessor: 'total_tracks' },
              { header: 'Avg Popularity', accessor: 'avg_popularity' },
              { header: 'Avg Energy', accessor: 'avg_energy' },
              { header: 'Avg Danceability', accessor: 'avg_danceability' },
            ])} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition">
              <FileText className="w-3 h-3" /> PDF
            </button>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={decadeReport}>
              <XAxis dataKey="decade" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" label={{ value: 'Total Tracks', angle: -90, position: 'insideLeft', style: { fill: '#3B82F6' } }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Avg Popularity', angle: 90, position: 'insideRight', style: { fill: '#10B981' } }} />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="total_tracks"
                name="Total Tracks"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4, cursor: 'pointer' }}
                onClick={(data) => navigate(`/drilldown?type=decade&value=${data.decade}`)}
              />
              <Line yAxisId="right" type="monotone" dataKey="avg_popularity" name="Avg Popularity" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <DataTable
              columns={[
                {
                  header: 'Decade',
                  accessor: 'decade',
                  render: (row) => (
                    <button
                      onClick={() => navigate(`/drilldown?type=decade&value=${row.decade}`)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {row.decade}s
                    </button>
                  ),
                },
                { header: 'Tracks', accessor: 'total_tracks' },
                { header: 'Avg Popularity', accessor: 'avg_popularity' },
                { header: 'Avg Energy', accessor: 'avg_energy' },
                { header: 'Avg Danceability', accessor: 'avg_danceability' },
              ]}
              data={decadeReport}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
