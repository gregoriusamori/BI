import { CheckCircle, AlertTriangle, XCircle, BarChart3 } from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Common/Card';
import StatCard from '../components/Common/StatCard';
import DataTable from '../components/Common/DataTable';
import { SkeletonDashboard } from '../components/Common/Skeleton';
import ErrorMessage from '../components/Common/ErrorMessage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getChartColors } from '../utils/chartTheme';

export default function DataQualityPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const colors = getChartColors(isDark);
  const { data: summary, loading: l1, error: e1, refetch: r1 } = useFetch('/data-quality/summary');
  const { data: completeness, loading: l2, error: e2, refetch: r2 } = useFetch('/data-quality/completeness');
  const { data: duplicates, loading: l3, error: e3, refetch: r3 } = useFetch('/data-quality/duplicates');
  const { data: outliers, loading: l4, error: e4, refetch: r4 } = useFetch('/data-quality/outlier-summary');

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;

  if (loading) return <SkeletonDashboard />;
  if (error) return <ErrorMessage message={error} onRetry={() => { r1(); r2(); r3(); r4(); }} />;

  const getScoreColor = (pct) => {
    if (pct >= 95) return 'text-green-600 dark:text-green-400';
    if (pct >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreIcon = (pct) => {
    if (pct >= 95) return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    if (pct >= 80) return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
  };

  const avgCompleteness = completeness?.columns
    ? (completeness.columns.reduce((sum, c) => sum + parseFloat(c.completeness), 0) / completeness.columns.length).toFixed(1)
    : 0;

  const completenessChart = completeness?.columns?.map(c => ({
    name: c.column,
    completeness: parseFloat(c.completeness),
  })) || [];

  const outlierChart = outliers?.map(o => ({
    name: o.feature,
    outliers: o.outliers,
  })) || [];

  const duplicateColumns = [
    { header: 'Track', accessor: 'track_name' },
    { header: 'Artist', accessor: 'artist_name' },
    { header: 'Copies', accessor: 'duplicate_count', align: 'right' },
  ];

  const completenessColumns = [
    {
      header: 'Column',
      accessor: 'column',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-800 dark:text-gray-200">{row.column}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{row.table}</span>
        </div>
      ),
    },
    {
      header: 'Completeness',
      accessor: 'completeness',
      render: (row) => (
        <div className="flex items-center gap-2">
          {getScoreIcon(parseFloat(row.completeness))}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-semibold ${getScoreColor(parseFloat(row.completeness))}`}>
                {row.completeness}%
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{row.filled}/{row.total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ease-out ${parseFloat(row.completeness) >= 95 ? 'bg-green-500' : parseFloat(row.completeness) >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${row.completeness}%` }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Nulls',
      accessor: 'nulls',
      align: 'right',
      render: (row) => (
        <span className={`font-medium ${row.nulls > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {row.nulls.toLocaleString()}
        </span>
      ),
    },
  ];

  const outlierColumns = [
    { header: 'Feature', accessor: 'feature' },
    { header: 'Mean', accessor: 'mean' },
    { header: 'Std Dev', accessor: 'stddev' },
    { header: 'Min', accessor: 'min' },
    { header: 'Max', accessor: 'max' },
    {
      header: 'Outliers',
      accessor: 'outliers',
      align: 'right',
      render: (row) => (
        <span className={`font-semibold ${row.outliers > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
          {row.outliers.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data Quality Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Overall Score" value={`${avgCompleteness}%`} icon={BarChart3} color={avgCompleteness >= 95 ? 'green' : avgCompleteness >= 80 ? 'orange' : 'red'} />
        <StatCard label="Total Tracks" value={summary?.totalTracks || '-'} icon={BarChart3} color="blue" />
        <StatCard label="Duplicate Groups" value={duplicates?.length || 0} icon={AlertTriangle} color="orange" />
        <StatCard label="Features with Outliers" value={outliers?.filter(o => o.outliers > 0).length || 0} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Column Completeness">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completenessChart} layout="vertical">
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: colors.axis }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: colors.axis }} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
              <Bar dataKey="completeness" radius={[0, 4, 4, 0]} animationDuration={1000}>
                {completenessChart.map((entry, i) => (
                  <Cell key={i} fill={entry.completeness >= 95 ? '#10B981' : entry.completeness >= 80 ? '#F59E0B' : '#EF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Outliers Count by Feature">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outlierChart}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: colors.axis }} />
              <YAxis tick={{ fill: colors.axis }} />
              <Tooltip contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: '8px', color: colors.tooltipText }} />
              <Bar dataKey="outliers" fill="#F59E0B" radius={[4, 4, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Column Completeness Detail">
        <DataTable columns={completenessColumns} data={completeness?.columns || []} pageSize={20} />
      </Card>

      {duplicates?.length > 0 && (
        <Card title={`Duplicate Tracks (${duplicates.length} groups)`}>
          <DataTable columns={duplicateColumns} data={duplicates} pageSize={10} />
        </Card>
      )}

      <Card title="Audio Features Statistics (outlier summary)">
        <DataTable columns={outlierColumns} data={outliers || []} pageSize={10} />
      </Card>
    </div>
  );
}
