import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Music, Mic2, Tag, Search as SearchIcon } from 'lucide-react';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import DataTable from '../components/Common/DataTable';
import api from '../api/axios';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (query.trim().length >= 2) {
      setLoading(true);
      api.get(`/search?q=${encodeURIComponent(query.trim())}`)
        .then((res) => setResults(res.data))
        .catch(() => setResults(null))
        .finally(() => setLoading(false));
    }
  }, [query]);

  if (query.trim().length < 2) {
    return (
      <div className="text-center py-20 text-gray-400 dark:text-gray-500">
        <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Type at least 2 characters to search</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  const total = results
    ? results.tracks.length + results.artists.length + results.genres.length
    : 0;

  const tabs = [
    { key: 'all', label: `All (${total})` },
    { key: 'tracks', label: `Tracks (${results?.tracks.length || 0})`, icon: Music },
    { key: 'artists', label: `Artists (${results?.artists.length || 0})`, icon: Mic2 },
    { key: 'genres', label: `Genres (${results?.genres.length || 0})`, icon: Tag },
  ];

  const filtered = {
    tracks: activeTab === 'all' || activeTab === 'tracks' ? results?.tracks || [] : [],
    artists: activeTab === 'all' || activeTab === 'artists' ? results?.artists || [] : [],
    genres: activeTab === 'all' || activeTab === 'genres' ? results?.genres || [] : [],
  };

  const trackColumns = [
    { header: 'Track', accessor: 'name' },
    { header: 'Artist', accessor: 'subtitle' },
    { header: 'Genre', accessor: 'extra' },
  ];

  const artistColumns = [
    { header: 'Artist', accessor: 'name' },
  ];

  const genreColumns = [
    { header: 'Genre', accessor: 'name' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">Search Results</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">"{query}" — {total} result{total !== 1 ? 's' : ''} found</p>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1 px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.tracks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-500 dark:text-blue-400" /> Tracks
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <DataTable columns={trackColumns} data={filtered.tracks} pageSize={10} />
          </div>
        </div>
      )}

      {filtered.artists.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-purple-500 dark:text-purple-400" /> Artists
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <DataTable columns={artistColumns} data={filtered.artists} pageSize={10} />
          </div>
        </div>
      )}

      {filtered.genres.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-500 dark:text-green-400" /> Genres
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <DataTable columns={genreColumns} data={filtered.genres} pageSize={10} />
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No results found for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
