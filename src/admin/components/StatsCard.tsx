import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  loading?: boolean;
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  gray: 'bg-gray-50 text-gray-600',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel = 'vs 上周',
  color = 'blue',
  loading = false,
}) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) {
      return <Minus size={14} />;
    }
    return trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-gray-500';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {trend > 0 ? '+' : ''}
                {trend}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
