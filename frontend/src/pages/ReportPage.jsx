import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ReportPage() {
  const [summary, setSummary] = useState(null);
  const [genreReport, setGenreReport] = useState([]);
  const [artistReport, setArtistReport] = useState([]);
  const [decadeReport, setDecadeReport] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    api.get('/reports/summary').then(r => setSummary(r.data));
    api.get('/reports/genre').then(r => setGenreReport(r.data));
    api.get('/reports/artist?limit=15').then(r => setArtistReport(r.data));
    api.get('/reports/decade').then(r => setDecadeReport(r.data));
  }, []);

  const genreColumns = [
    { header: 'Genre', accessor: 'genre_name' },
    { header: 'Tracks', accessor: 'total_tracks' },
    { header: 'Avg Popularity', accessor: 'avg_popularity' },
    { header: 'Avg Energy', accessor: 'avg_energy' },
    { header: 'Avg Danceability', accessor: 'avg_danceability' },
  ];

  const artistColumns = [
    { header: 'Artist', accessor: 'artist_name' },
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
              <p className="text-3xl font-bold text-blue-600">{Number(summary.avg_popularity).toFixed(2)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Avg Energy</p>
              <p className="text-3xl font-bold text-green-600">{Number(summary.avg_energy).toFixed(3)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500">Avg Danceability</p>
              <p className="text-3xl font-bold text-purple-600">{Number(summary.avg_danceability).toFixed(3)}</p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'genre' && (
        <Card title="Genre Analysis Report">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genreReport}>
              <XAxis dataKey="genre_name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total_tracks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <DataTable columns={genreColumns} data={genreReport} />
          </div>
        </Card>
      )}

      {activeTab === 'artist' && (
        <Card title="Artist Analysis Report">
          <DataTable columns={artistColumns} data={artistReport} />
        </Card>
      )}

      {activeTab === 'decade' && (
        <Card title="Decade Analysis Report">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={decadeReport}>
              <XAxis dataKey="decade" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total_tracks" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="avg_popularity" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4">
            <DataTable
              columns={[
                { header: 'Decade', accessor: 'decade' },
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
