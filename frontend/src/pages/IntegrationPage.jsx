import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { Upload, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function IntegrationPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/integration/history').then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/integration/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      api.get('/integration/history').then(r => setHistory(r.data));
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Import failed' });
    } finally {
      setUploading(false);
    }
  };

  const historyColumns = [
    { header: 'Filename', accessor: 'filename' },
    { header: 'Imported', accessor: 'records_imported' },
    { header: 'Skipped', accessor: 'records_skipped' },
    { header: 'Date', accessor: 'imported_at' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Integration Services</h1>

      <Card title="Import Dataset">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">Drop your CSV file here or click to browse</p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
          >
            {uploading ? 'Importing...' : 'Import Data'}
          </button>
        </form>

        {result && !result.error && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle className="w-5 h-5" />
              Import Completed
            </div>
            <div className="mt-2 text-sm text-green-600">
              <p>Imported: {result.imported} records</p>
              <p>Skipped: {result.skipped} records</p>
              <p>Total: {result.total} records</p>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <XCircle className="w-5 h-5 inline mr-2" />
            {result.error}
          </div>
        )}
      </Card>

      <Card title="Import History">
        <DataTable columns={historyColumns} data={history} />
      </Card>
    </div>
  );
}
