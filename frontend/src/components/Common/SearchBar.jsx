import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Music, Mic2, Tag } from 'lucide-react';
import api from '../../api/axios';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        setLoading(true);
        api.get(`/search?q=${encodeURIComponent(query.trim())}`)
          .then((res) => setResults(res.data))
          .catch(() => setResults(null))
          .finally(() => setLoading(false));
      } else {
        setResults(null);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const goToSearch = () => {
    if (query.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const total = results
    ? results.tracks.length + results.artists.length + results.genres.length
    : 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white dark:focus-within:bg-gray-600 transition">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tracks, artists, genres..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="ml-2 bg-transparent outline-none text-sm w-32 lg:w-56 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null); }} className="ml-1">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">Searching...</div>
          ) : total === 0 ? (
            <div className="p-4 text-center text-gray-400 dark:text-gray-500 text-sm">No results found</div>
          ) : (
            <>
              {results.tracks.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">Tracks</div>
                  {results.tracks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <Music className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{t.name}</span>
                      {t.subtitle && <span className="text-gray-400 dark:text-gray-500 truncate">- {t.subtitle}</span>}
                    </button>
                  ))}
                </div>
              )}
              {results.artists.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">Artists</div>
                  {results.artists.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <Mic2 className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                      <span className="truncate">{a.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.genres.length > 0 && (
                <div>
                  <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase bg-gray-50 dark:bg-gray-700">Genres</div>
                  {results.genres.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { navigate(`/search?q=${encodeURIComponent(query)}`); setOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100"
                    >
                      <Tag className="w-4 h-4 text-green-500 dark:text-green-400 shrink-0" />
                      <span className="truncate">{g.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {total > 0 && (
                <button
                  onClick={goToSearch}
                  className="w-full px-3 py-2 text-center text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 border-t border-gray-100 dark:border-gray-700 font-medium"
                >
                  View all results ({total})
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
