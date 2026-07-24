import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Common/Card';
import DataTable from '../components/Common/DataTable';
import { Plus, Trash2, Table2 } from 'lucide-react';

export default function DynamicPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [rows, setRows] = useState([]);
  const [tableInfo, setTableInfo] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newColumns, setNewColumns] = useState([{ name: '', type: 'VARCHAR(255)' }]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const res = await api.get('/dynamic/tables');
    setTables(res.data.filter(t => !t.startsWith('tbl_') && !t.startsWith('pg_') && !t.startsWith('users') && !t.startsWith('import_') && !t.startsWith('tbl_track') && !t.startsWith('tbl_cluster')));
  };

  const selectTable = async (tableName) => {
    setSelectedTable(tableName);
    const [rowsRes, infoRes] = await Promise.all([
      api.get(`/dynamic/tables/${tableName}`),
      api.get(`/dynamic/tables/${tableName}/info`),
    ]);
    setRows(rowsRes.data.rows);
    setTableInfo(infoRes.data);
  };

  const createTable = async (e) => {
    e.preventDefault();
    if (!newTableName || newColumns.some(c => !c.name)) return;
    await api.post('/dynamic/tables', { tableName: newTableName, columns: newColumns });
    setShowCreate(false);
    setNewTableName('');
    setNewColumns([{ name: '', type: 'VARCHAR(255)' }]);
    loadTables();
  };

  const dropTable = async (tableName) => {
    if (!confirm(`Drop table "${tableName}"?`)) return;
    await api.delete(`/dynamic/tables/${tableName}`);
    setSelectedTable(null);
    setRows([]);
    loadTables();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
                  onChange={(e) => {
                    const cols = [...newColumns];
                    cols[i].name = e.target.value;
                    setNewColumns(cols);
                  }}
                  placeholder="Column name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
                <select
                  value={col.type}
                  onChange={(e) => {
                    const cols = [...newColumns];
                    cols[i].type = e.target.value;
                    setNewColumns(cols);
                  }}
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
            <button
              type="button"
              onClick={() => setNewColumns([...newColumns, { name: '', type: 'VARCHAR(255)' }])}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add Column
            </button>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                Create
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 rounded-lg text-sm">
                Cancel
              </button>
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm ${
                  selectedTable === t ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                }`}
                onClick={() => selectTable(t)}
              >
                <div className="flex items-center gap-2">
                  <Table2 className="w-4 h-4" />
                  {t}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); dropTable(t); }}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tables.length === 0 && (
              <p className="text-sm text-gray-400">No custom tables</p>
            )}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {selectedTable ? (
            <Card title={`${selectedTable} (${rows.length} rows)`}>
              {tableInfo.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {tableInfo.map((col, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {col.column_name} <span className="text-gray-400">({col.data_type})</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {tableInfo.map((col, i) => (
                        <th key={i} className="text-left py-2 px-3 font-semibold text-gray-600">
                          {col.column_name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        {tableInfo.map((col, j) => (
                          <td key={j} className="py-2 px-3 text-gray-700">
                            {String(row[col.column_name] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
