import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  isLoading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  isLoading = false 
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'users':
        return '👥';
      case 'phone':
        return '📞';
      case 'chart-bar':
        return '📊';
      case 'trophy':
        return '🏆';
      case 'clock':
        return '⏰';
      case 'target':
        return '🎯';
      case 'trending-up':
        return '📈';
      case 'trending-down':
        return '📉';
      default:
        return '📈';
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'green':
        return 'bg-green-50 border-green-200 text-green-600';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-600';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-600';
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-600';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${getChangeColor(change)} flex items-center gap-1`}>
              <span>{getChangeIcon(change)}</span>
              <span>{Math.abs(change)}%</span>
              <span>from last period</span>
            </p>
          )}
        </div>
        <div className={`text-3xl p-3 rounded-full ${getColorClasses(color)}`}>
          {getIcon(icon)}
        </div>
      </div>
    </div>
  );
};