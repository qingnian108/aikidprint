import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  loading?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 200,
  color = '#3B82F6',
  showGrid = true,
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

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = 600;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = 0;
  const valueRange = maxValue - minValue;

  const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (value: number) =>
    padding.top + chartHeight - ((value - minValue) / (valueRange || 1)) * chartHeight;

  // 生成路径
  const linePath = data
    .map((point, index) => {
      const x = getX(index);
      const y = getY(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // 生成填充区域路径
  const areaPath = `${linePath} L ${getX(data.length - 1)} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`;

  // Y轴刻度
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    Math.round(minValue + (valueRange * i) / (yTicks - 1))
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 400 }}>
        {/* 网格线 */}
        {showGrid &&
          yTickValues.map((tick, i) => (
            <line
              key={i}
              x1={padding.left}
              y1={getY(tick)}
              x2={width - padding.right}
              y2={getY(tick)}
              stroke="#E5E7EB"
              strokeDasharray="4"
            />
          ))}

        {/* Y轴标签 */}
        {yTickValues.map((tick, i) => (
          <text
            key={i}
            x={padding.left - 10}
            y={getY(tick)}
            textAnchor="end"
            alignmentBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {tick}
          </text>
        ))}

        {/* 填充区域 */}
        <path d={areaPath} fill={color} fillOpacity={0.1} />

        {/* 折线 */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />

        {/* 数据点 */}
        {data.map((point, index) => (
          <circle
            key={index}
            cx={getX(index)}
            cy={getY(point.value)}
            r={4}
            fill="white"
            stroke={color}
            strokeWidth={2}
          />
        ))}

        {/* X轴标签 */}
        {data.map((point, index) => {
          // 只显示部分标签避免重叠
          const showLabel = data.length <= 10 || index % Math.ceil(data.length / 10) === 0;
          if (!showLabel) return null;
          return (
            <text
              key={index}
              x={getX(index)}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default LineChart;
