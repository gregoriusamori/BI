export default function DataTable({ columns, data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col, i) => (
              <th key={i} className="text-left py-3 px-4 font-semibold text-gray-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((col, j) => (
                <td key={j} className="py-3 px-4 text-gray-700">
                  {col.accessor ? row[col.accessor] : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">No data available</div>
      )}
    </div>
  );
}
