export function getChartColors(isDark) {
  return {
    axis: isDark ? '#9CA3AF' : '#6B7280',
    grid: isDark ? '#374151' : '#E5E7EB',
    tooltipBg: isDark ? '#1F2937' : '#FFFFFF',
    tooltipText: isDark ? '#F3F4F6' : '#111827',
    tooltipBorder: isDark ? '#4B5563' : '#E5E7EB',
  };
}

export const CHART_PALETTE = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
