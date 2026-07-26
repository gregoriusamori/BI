import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Music, ArrowLeft, Filter } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import DataTable from '../components/Common/DataTable';
import Card from '../components/Common/Card';
import api from '../api/axios';

const TYPE_LABELS = {
  genre: 'Genre',
  artist: 'Artist',
  year: 'Year',
  decade: 'Decade',
};

export default function DrillDownPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const type = searchParams.get('type') || '';
  const value = searchParams.get('value') || '';
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type || !value) return;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (type === 'genre') params.set('genre', value);
    else if (type === 'artist') params.set('artist', value);
    else if (type === 'year') params.set('year', value);
    else if (type === 'decade') params.set('decade', value);

    api.get(`/tracks/filter?${params.toString()}&limit=200`)
      .then((res) => setTracks(res.data.tracks))
      .catch(() => setError('Failed to load tracks'))
      .finally(() => setLoading(false));
  }, [type, value]);

  if (!type || !value) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Invalid drill-down parameters</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text={`Loading ${TYPE_LABELS[type]?.toLowerCase()} tracks...`} />;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const columns = [
    {
      header: 'Track',
      accessor: 'track_name',
      render: (row) => (
        <span className="font-medium text-gray-800">{row.track_name}</span>
      ),
    },
    {
      header: 'Artist',
      accessor: 'artist_name',
      render: (row) => (
        <button
          onClick={() => navigate(`/drilldown?type=artist&value=${encodeURIComponent(row.artist_name)}`)}
          className="text-blue-600 hover:underline"
        >
          {row.artist_name}
        </button>
      ),
    },
    {
      header: 'Genre',
      accessor: 'genre_name',
      render: (row) => (
        <button
          onClick={() => navigate(`/drilldown?type=genre&value=${encodeURIComponent(row.genre_name)}`)}
          className="text-purple-600 hover:underline"
        >
          {row.genre_name}
        </button>
      ),
    },
    { header: 'Year', accessor: 'year' },
    { header: 'Duration', accessor: 'duration_minutes', render: (row) => `${Number(row.duration_minutes).toFixed(1)} min` },
    { header: 'Popularity', accessor: 'popularity_score' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {TYPE_LABELS[type]}: <span className="text-blue-600">{value}</span>
          </h1>
          <p className="text-gray-500 text-sm">{tracks.length} track{tracks.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      <Card>
        <DataTable columns={columns} data={tracks} pageSize={15} />
      </Card>
    </div>
  );
}
