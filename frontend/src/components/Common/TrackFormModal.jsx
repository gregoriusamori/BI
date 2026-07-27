import { useState, useEffect } from 'react';
import { X, Save, Music } from 'lucide-react';
import api from '../../api/axios';

const defaultForm = {
  track_name: '',
  artist_id: '',
  genre_id: '',
  year: '',
  duration_minutes: '',
  popularity_score: '',
  danceability: '',
  energy: '',
  loudness: '',
  speechiness: '',
  acousticness: '',
  instrumentalness: '',
  liveness: '',
  valence: '',
  tempo: '',
};

export default function TrackFormModal({ open, onClose, editData, onSuccess }) {
  const [form, setForm] = useState(defaultForm);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [artistSearch, setArtistSearch] = useState('');
  const [showArtistDropdown, setShowArtistDropdown] = useState(false);

  const isEdit = !!editData;

  useEffect(() => {
    if (open) {
      api.get('/artists?limit=500').then((res) => setArtists(res.data.artists || res.data || []));
      api.get('/genres').then((res) => setGenres(res.data || []));
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setForm({
        track_name: editData.track_name || '',
        artist_id: editData.artist_id || '',
        genre_id: editData.genre_id || '',
        year: editData.year || '',
        duration_minutes: editData.duration_minutes || '',
        popularity_score: editData.popularity_score ?? '',
        danceability: editData.danceability ?? '',
        energy: editData.energy ?? '',
        loudness: editData.loudness ?? '',
        speechiness: editData.speechiness ?? '',
        acousticness: editData.acousticness ?? '',
        instrumentalness: editData.instrumentalness ?? '',
        liveness: editData.liveness ?? '',
        valence: editData.valence ?? '',
        tempo: editData.tempo ?? '',
      });
      setArtistSearch(editData.artist_name || '');
    } else {
      setForm(defaultForm);
      setArtistSearch('');
    }
    setErrors({});
  }, [editData, open]);

  const validate = () => {
    const errs = {};
    if (!form.track_name.trim()) errs.track_name = 'Track name is required';
    if (!form.artist_id) errs.artist_id = 'Artist is required';
    if (!form.genre_id) errs.genre_id = 'Genre is required';
    if (form.year && (isNaN(form.year) || form.year < 1900 || form.year > 2030)) errs.year = 'Year must be 1900-2030';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        artist_id: parseInt(form.artist_id),
        genre_id: parseInt(form.genre_id),
        year: form.year ? parseInt(form.year) : null,
        duration_minutes: form.duration_minutes ? parseFloat(form.duration_minutes) : null,
        duration_ms: form.duration_minutes ? Math.round(parseFloat(form.duration_minutes) * 60000) : null,
        popularity_score: form.popularity_score !== '' ? parseInt(form.popularity_score) : 0,
        danceability: form.danceability !== '' ? parseFloat(form.danceability) : 0,
        energy: form.energy !== '' ? parseFloat(form.energy) : 0,
        loudness: form.loudness !== '' ? parseFloat(form.loudness) : 0,
        speechiness: form.speechiness !== '' ? parseFloat(form.speechiness) : 0,
        acousticness: form.acousticness !== '' ? parseFloat(form.acousticness) : 0,
        instrumentalness: form.instrumentalness !== '' ? parseFloat(form.instrumentalness) : 0,
        liveness: form.liveness !== '' ? parseFloat(form.liveness) : 0,
        valence: form.valence !== '' ? parseFloat(form.valence) : 0,
        tempo: form.tempo !== '' ? parseFloat(form.tempo) : 0,
      };

      if (isEdit) {
        await api.put(`/tracks/${editData.track_id}`, payload);
      } else {
        await api.post('/tracks', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save track' });
    } finally {
      setSaving(false);
    }
  };

  const filteredArtists = artists.filter((a) =>
    a.artist_name.toLowerCase().includes(artistSearch.toLowerCase())
  ).slice(0, 50);

  const selectedArtist = artists.find((a) => a.artist_id === parseInt(form.artist_id));

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{isEdit ? 'Edit Track' : 'Add New Track'}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{errors.submit}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Track Name *</label>
              <input
                type="text"
                value={form.track_name}
                onChange={(e) => setForm({ ...form, track_name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.track_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Enter track name"
              />
              {errors.track_name && <p className="text-red-500 text-xs mt-1">{errors.track_name}</p>}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Artist *</label>
              <input
                type="text"
                value={artistSearch}
                onChange={(e) => {
                  setArtistSearch(e.target.value);
                  setShowArtistDropdown(true);
                  if (!e.target.value) setForm({ ...form, artist_id: '' });
                }}
                onFocus={() => setShowArtistDropdown(true)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.artist_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="Search artist..."
              />
              {showArtistDropdown && filteredArtists.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredArtists.map((a) => (
                    <button
                      key={a.artist_id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, artist_id: a.artist_id });
                        setArtistSearch(a.artist_name);
                        setShowArtistDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-900 dark:text-gray-100"
                    >
                      {a.artist_name}
                    </button>
                  ))}
                </div>
              )}
              {errors.artist_id && <p className="text-red-500 text-xs mt-1">{errors.artist_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genre *</label>
              <select
                value={form.genre_id}
                onChange={(e) => setForm({ ...form, genre_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.genre_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              >
                <option value="">Select genre</option>
                {genres.map((g) => (
                  <option key={g.genre_id} value={g.genre_id}>{g.genre_name}</option>
                ))}
              </select>
              {errors.genre_id && <p className="text-red-500 text-xs mt-1">{errors.genre_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                placeholder="e.g. 2020"
                min="1900"
                max="2030"
              />
              {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                step="0.1"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="e.g. 3.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Popularity (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.popularity_score}
                onChange={(e) => setForm({ ...form, popularity_score: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0-100"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Audio Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'danceability', label: 'Danceability' },
                { key: 'energy', label: 'Energy' },
                { key: 'loudness', label: 'Loudness' },
                { key: 'speechiness', label: 'Speechiness' },
                { key: 'acousticness', label: 'Acousticness' },
                { key: 'instrumentalness', label: 'Instrumentalness' },
                { key: 'liveness', label: 'Liveness' },
                { key: 'valence', label: 'Valence' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0-1"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Tempo</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.tempo}
                  onChange={(e) => setForm({ ...form, tempo: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="BPM"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEdit ? 'Update Track' : 'Create Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
