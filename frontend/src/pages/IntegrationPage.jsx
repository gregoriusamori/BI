import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { Upload, CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';

export default function IntegrationPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/integration/history')
      .then(r => setHistory(r.data))
      .catch(() => {});
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Integration Services</h1>

      <Card title="Import Dataset">
        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
              ${dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                <FileSpreadsheet className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-800 font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB — Click or drop to replace
                </p>
              </>
            ) : (
              <>
                <Upload className={`w-12 h-12 mx-auto mb-3 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-gray-600 mb-1">
                  {dragActive ? 'Release to upload file' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-400">or click to browse</p>
                <p className="text-xs text-gray-400 mt-2">CSV files up to 50MB</p>
              </>
            )}
          </div>

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
