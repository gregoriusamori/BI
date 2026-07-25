import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url, options);
      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      let message = 'Failed to load data. Please try again.';

      if (!err.response) {
        message = 'Network error. Please check your connection.';
      } else if (status === 401) {
        message = 'Session expired. Please log in again.';
      } else if (status === 403) {
        message = 'You do not have permission to access this data.';
      } else if (status === 404) {
        message = 'Data not found.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
