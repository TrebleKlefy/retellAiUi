import React from 'react';

interface TimeRangeSelectorProps {
  value: string;
  onChange: (timeRange: string) => void;
  className?: string;
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({ 
  value, 
  onChange, 
  className = '' 
}) => {
  const timeRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">Time Range:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        {timeRanges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
};