export default function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300 ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
