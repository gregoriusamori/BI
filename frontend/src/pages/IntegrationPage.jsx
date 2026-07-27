import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { SkeletonDashboard } from '../components/Common/Skeleton';
import { Upload, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';

export default function IntegrationPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/integration/history')
      .then(r => setHistory(r.data))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const validateFile = (f) => {
    if (!f) return { valid: false, error: 'No file selected' };
    if (!f.name.endsWith('.csv')) {
      return { valid: false, error: 'Only CSV files are supported' };
    }
    if (f.size > 50 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 50MB' };
    }
    return { valid: true };
  };

  const handleFile = (f) => {
    setResult(null);
    const validation = validateFile(f);
    if (!validation.valid) {
      setResult({ error: validation.error });
      return;
    }
    setFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

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
      setFile(null);
      api.get('/integration/history').then(r => setHistory(r.data));
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Import failed. Please try again.' });
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
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Integration Services</h1>

      <Card title="Import Dataset">
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
              ${dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleInputChange}
              className="hidden"
            />

            {file ? (
              <>
                <FileSpreadsheet className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3 animate-bounce" />
                <p className="text-gray-800 dark:text-gray-100 font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
                </p>
              </>
            ) : (
              <>
                <Upload className={`w-12 h-12 mx-auto mb-3 transition-transform duration-300 ${dragActive ? 'text-blue-500 dark:text-blue-400 scale-110' : 'text-gray-400 dark:text-gray-500'}`} />
                <p className="text-gray-600 dark:text-gray-300 mb-1">
                  {dragActive ? 'Release to upload file' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">CSV files up to 50MB</p>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium hover:scale-105 hover:shadow-md"
          >
            {uploading ? 'Importing...' : 'Import Data'}
          </button>
        </form>

        {result && !result.error && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-fade-in">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
              <CheckCircle className="w-5 h-5" />
              Import Completed
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              <p>Imported: {result.imported} records</p>
              <p>Skipped: {result.skipped} records</p>
              <p>Total: {result.total} records</p>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm animate-fade-in">
            <XCircle className="w-5 h-5 inline mr-2" />
            {result.error}
          </div>
        )}
      </Card>

      <Card title="Import History">
        {historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <DataTable columns={historyColumns} data={history} />
        )}
      </Card>
    </div>
  );
}
