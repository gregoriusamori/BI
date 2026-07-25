import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { Plus, Trash2, Table2, Pencil, X, Check } from 'lucide-react';

const RESERVED_PREFIXES = ['tbl_', 'pg_', 'users', 'import_', 'sql_', 'knex_'];

export default function DynamicPage() {
  const [tables, setTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [tablesError, setTablesError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState(null);
  const [tableInfo, setTableInfo] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newColumns, setNewColumns] = useState([{ name: '', type: 'VARCHAR(255)' }]);
  const [createError, setCreateError] = useState(null);
  const [showInsert, setShowInsert] = useState(false);
  const [insertData, setInsertData] = useState({});
  const [insertError, setInsertError] = useState(null);
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  const loadTables = async () => {
    setTablesLoading(true);
    setTablesError(null);
    try {
      const res = await api.get('/dynamic/tables');
      setTables(res.data.filter(t => !RESERVED_PREFIXES.some(p => t.startsWith(p))));
    } catch (err) {
      setTablesError('Failed to load tables. Please try again.');
    } finally {
      setTablesLoading(false);
    }
  };

  useEffect(() => { loadTables(); }, []);

  const selectTable = async (tableName) => {
    setSelectedTable(tableName);
    setShowInsert(false);
    setEditingRow(null);
    setRowsLoading(true);
    setRowsError(null);
    try {
      const [rowsRes, infoRes] = await Promise.all([
        api.get(`/dynamic/tables/${tableName}`),
        api.get(`/dynamic/tables/${tableName}/info`),
      ]);
      setRows(rowsRes.data.rows);
      setTableInfo(infoRes.data.filter(c => c.column_name !== 'id' && c.column_name !== 'created_at'));
    } catch (err) {
      setRowsError('Failed to load table data');
    } finally {
      setRowsLoading(false);
    }
  };

  const createTable = async (e) => {
    e.preventDefault();
    setCreateError(null);
    if (!newTableName || newColumns.some(c => !c.name)) {
      setCreateError('Please fill in all fields');
      return;
    }
    try {
      await api.post('/dynamic/tables', { tableName: newTableName, columns: newColumns });
      setShowCreate(false);
      setNewTableName('');
      setNewColumns([{ name: '', type: 'VARCHAR(255)' }]);
      loadTables();
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create table');
    }
  };

  const dropTable = async (tableName) => {
    if (!window.confirm(`Drop table "${tableName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/dynamic/tables/${tableName}`);
      setSelectedTable(null);
      setRows([]);
      setTableInfo([]);
      loadTables();
    } catch (err) {
      console.error('Failed to drop table:', err);
    }
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    setInsertError(null);
    try {
      await api.post(`/dynamic/tables/${selectedTable}/rows`, insertData);
      setShowInsert(false);
      setInsertData({});
      selectTable(selectedTable);
    } catch (err) {
      setInsertError(err.response?.data?.error || 'Failed to insert row');
    }
  };

  const handleEdit = (row) => {
    setEditingRow(row.id);
    const data = {};
    tableInfo.forEach(c => { data[c.column_name] = row[c.column_name] ?? ''; });
    setEditData(data);
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/dynamic/tables/${selectedTable}/rows/${id}`, editData);
      setEditingRow(null);
      setEditData({});
      selectTable(selectedTable);
    } catch (err) {
      console.error('Failed to update row:', err);
    }
  };

  const handleDeleteRow = async (id) => {
    if (!window.confirm('Delete this row?')) return;
    try {
      await api.delete(`/dynamic/tables/${selectedTable}/rows/${id}`);
      selectTable(selectedTable);
    } catch (err) {
      console.error('Failed to delete row:', err);
    }
  };

  if (tablesLoading) return <LoadingSpinner text="Loading tables..." />;
  if (tablesError) return <ErrorMessage message={tablesError} onRetry={loadTables} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Dynamic Tables</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Table
        </button>
      </div>

      {showCreate && (
        <Card title="Create New Table">
          <form onSubmit={createTable} className="space-y-4">
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{createError}</div>
            )}
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="Table name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              required
            />
            {newColumns.map((col, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={col.name}
                  onChange={(e) => { const cols = [...newColumns]; cols[i] = { ...cols[i], name: e.target.value }; setNewColumns(cols); }}
                  placeholder="Column name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
                <select
                  value={col.type}
                  onChange={(e) => { const cols = [...newColumns]; cols[i] = { ...cols[i], type: e.target.value }; setNewColumns(cols); }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="VARCHAR(255)">Text</option>
                  <option value="INTEGER">Integer</option>
                  <option value="NUMERIC(10,2)">Number</option>
                  <option value="BOOLEAN">Boolean</option>
                  <option value="TIMESTAMP">Date/Time</option>
                </select>
              </div>
            ))}
            <button type="button" onClick={() => setNewColumns([...newColumns, { name: '', type: 'VARCHAR(255)' }])} className="text-sm text-blue-600 hover:text-blue-700">
              + Add Column
            </button>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold text-gray-700 mb-3">Tables</h3>
          <div className="space-y-1">
            {tables.map(t => (
              <div
                key={t}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm ${selectedTable === t ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                onClick={() => selectTable(t)}
              >
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4" />
                  {t}
                </div>
                <button onClick={(e) => { e.stopPropagation(); dropTable(t); }} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tables.length === 0 && <p className="text-sm text-gray-400">No custom tables yet</p>}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {selectedTable ? (
            <Card title={`${selectedTable} (${rows.length} rows)`}>
              <div className="mb-4">
                <button
                  onClick={() => { setShowInsert(!showInsert); setInsertData({}); setInsertError(null); }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Insert Row
                </button>
              </div>

              {showInsert && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-3">New Row</h4>
                  {insertError && <p className="text-red-600 text-sm mb-2">{insertError}</p>}
                  <form onSubmit={handleInsert} className="space-y-2">
                    {tableInfo.map(c => (
                      <div key={c.column_name} className="flex items-center gap-2">
                        <label className="w-32 text-sm text-gray-600 truncate">{c.column_name}</label>
                        <input
                          type="text"
                          value={insertData[c.column_name] || ''}
                          onChange={(e) => setInsertData({ ...insertData, [c.column_name]: e.target.value })}
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
                          placeholder={c.data_type}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                      <button type="submit" className="px-4 py-1.5 bg-green-600 text-white rounded text-sm">Save</button>
                      <button type="button" onClick={() => setShowInsert(false)} className="px-4 py-1.5 bg-gray-200 rounded text-sm">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {rowsLoading ? (
                <LoadingSpinner text="Loading table data..." />
              ) : rowsError ? (
                <ErrorMessage message={rowsError} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {tableInfo.map((col, i) => (
                          <th key={i} className="text-left py-2 px-3 font-semibold text-gray-600">{col.column_name}</th>
                        ))}
                        <th className="text-left py-2 px-3 font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100">
                          {tableInfo.map((col, j) => (
                            <td key={j} className="py-2 px-3 text-gray-700">
                              {editingRow === row.id ? (
                                <input
                                  type="text"
                                  value={editData[col.column_name] ?? ''}
                                  onChange={(e) => setEditData({ ...editData, [col.column_name]: e.target.value })}
                                  className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                                />
                              ) : (
                                String(row[col.column_name] ?? '')
                              )}
                            </td>
                          ))}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              {editingRow === row.id ? (
                                <>
                                  <button onClick={() => handleSaveEdit(row.id)} className="p-1 text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => { setEditingRow(null); setEditData({}); }} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => handleEdit(row)} className="p-1 text-blue-600 hover:text-blue-700"><Pencil className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteRow(row.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12 text-gray-400">
                <Table2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a table or create a new one</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
