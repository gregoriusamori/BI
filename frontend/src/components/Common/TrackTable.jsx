import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import api from '../../api/axios';

export default function TrackTable({ onRefresh }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('track_id');
  const [order, setOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [limit] = useState(15);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit, search, sort, order,
      });
      const res = await api.get(`/tracks?${params.toString()}`);
      setData(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch tracks');
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, order, limit]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (col) => {
    if (sort === col) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(col);
      setOrder('asc');
    }
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const columns = [
    { header: 'ID', accessor: 'track_id', width: 'w-16' },
    { header: 'Track', accessor: 'track_name', width: 'min-w-[200px]' },
    { header: 'Artist', accessor: 'artist_name', width: 'min-w-[150px]' },
    { header: 'Genre', accessor: 'genre_name', width: 'w-28' },
    { header: 'Year', accessor: 'year', width: 'w-20' },
    { header: 'Duration', accessor: 'duration_minutes', width: 'w-24', format: (v) => v ? `${Number(v).toFixed(1)}m` : '-' },
    { header: 'Popularity', accessor: 'popularity_score', width: 'w-28' },
    { header: 'Energy', accessor: 'energy', width: 'w-24', format: (v) => v ? Number(v).toFixed(2) : '-' },
    { header: 'Dance', accessor: 'danceability', width: 'w-24', format: (v) => v ? Number(v).toFixed(2) : '-' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search tracks, artists, genres..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-2 top-2.5">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{total.toLocaleString()} tracks</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {columns.map((col) => (
                <th
                  key={col.accessor}
                  className={`py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-300 text-left cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600 ${col.width || ''}`}
                  onClick={() => handleSort(col.accessor)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {sort === col.accessor && (
                      order === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </th>
              ))}
              <th className="py-2.5 px-3 font-semibold text-gray-600 dark:text-gray-300 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-400 dark:text-gray-500">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-8 text-gray-400 dark:text-gray-500">No tracks found</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.track_id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  {columns.map((col) => (
                    <td key={col.accessor} className={`py-2 px-3 text-gray-700 dark:text-gray-200 ${col.width || ''}`}>
                      {col.format ? col.format(row[col.accessor]) : (row[col.accessor] ?? '-')}
                    </td>
                  ))}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('track-edit', { detail: row }))}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => window.dispatchEvent(new CustomEvent('track-delete', { detail: row }))}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              First
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page < 3) pageNum = i + 1;
              else if (page > totalPages - 3) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded border ${
                    page === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1 rounded border border-gray-200 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages}
              className="px-2 py-1 text-sm rounded border border-gray-200 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
