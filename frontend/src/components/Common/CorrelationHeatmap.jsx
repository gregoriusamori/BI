const FEATURES = [
  { key: 'dance_energy', row: 'Dance', col: 'Energy' },
  { key: 'dance_valence', row: 'Dance', col: 'Valence' },
  { key: 'energy_loud', row: 'Energy', col: 'Loudness' },
  { key: 'speech_energy', row: 'Speech', col: 'Energy' },
  { key: 'acoustic_energy', row: 'Acoustic', col: 'Energy' },
  { key: 'valence_energy', row: 'Valence', col: 'Energy' },
  { key: 'tempo_energy', row: 'Tempo', col: 'Energy' },
];

function getCorrelationColor(value) {
  if (value === null || value === undefined) return 'bg-gray-100 dark:bg-gray-700';
  const v = Number(value);
  if (v >= 0.5) return 'bg-green-600 text-white';
  if (v >= 0.2) return 'bg-green-300 dark:bg-green-700';
  if (v >= -0.2) return 'bg-gray-200 dark:bg-gray-600';
  if (v >= -0.5) return 'bg-red-300 dark:bg-red-700';
  return 'bg-red-600 text-white';
}

export default function CorrelationHeatmap({ data }) {
  if (!data) return null;

  const rowLabels = ['Dance', 'Energy', 'Valence', 'Acoustic', 'Speech', 'Tempo', 'Loudness'];
  const colLabels = ['Dance', 'Energy', 'Valence', 'Acoustic', 'Speech', 'Tempo', 'Loudness'];

  const matrix = {};
  rowLabels.forEach(r => {
    matrix[r] = {};
    colLabels.forEach(c => matrix[r][c] = null);
  });

  FEATURES.forEach(({ key, row, col }) => {
    const val = Number(data[key] || 0);
    matrix[row][col] = val;
    matrix[col][row] = val;
  });

  rowLabels.forEach(r => { matrix[r][r] = 1; });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="py-2 px-2"></th>
            {colLabels.map(c => (
              <th key={c} className="py-2 px-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map(r => (
            <tr key={r}>
              <td className="py-1 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400 text-right whitespace-nowrap">{r}</td>
              {colLabels.map(c => {
                const val = matrix[r][c];
                return (
                  <td key={c} className="py-1 px-1">
                    <div
                      className={`w-full h-10 rounded flex items-center justify-center text-xs font-medium ${getCorrelationColor(val)}`}
                      title={`${r} vs ${c}: ${val !== null ? Number(val).toFixed(3) : 'N/A'}`}
                    >
                      {val !== null ? Number(val).toFixed(2) : '-'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-600" />
          <span>Strong negative</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600" />
          <span>Weak</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-600" />
          <span>Strong positive</span>
        </div>
      </div>
    </div>
  );
}
