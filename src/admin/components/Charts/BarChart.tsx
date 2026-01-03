import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showValues?: boolean;
  loading?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  color = '#8B5CF6',
  showValues = true,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg"
        style={{ height }}
      >
        暂无数据
      </div>
    );
  }

  const padding = { top: 30, right: 20, bottom: 40, left: 50 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(40, (chartWidth / data.length) * 0.7);
  const barGap = (chartWidth - barWidth * data.length) / (data.length + 1);

  const getBarHeight = (value: number) => (value / maxValue) * chartHeight;
  const getBarX = (index: number) => padding.left + barGap + index * (barWidth + barGap);

  // Y轴刻度
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    Math.round((maxValue * i) / (yTicks - 1))
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 400 }}>
        {/* 网格线 */}
        {yTickValues.map((tick, i) => {
          const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#E5E7EB"
              strokeDasharray="4"
            />
          );
        })}

        {/* Y轴标签 */}
        {yTickValues.map((tick, i) => {
          const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
          return (
            <text
              key={i}
              x={padding.left - 10}
              y={y}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-xs fill-gray-500"
            >
              {tick}
            </text>
          );
        })}

        {/* 柱状图 */}
        {data.map((point, index) => {
          const barHeight = getBarHeight(point.value);
          const x = getBarX(index);
          const y = padding.top + chartHeight - barHeight;

          return (
            <g key={index}>
              {/* 柱子 */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={4}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />

              {/* 数值标签 */}
              {showValues && point.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                >
                  {point.value}
                </text>
              )}

              {/* X轴标签 */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default BarChart;
