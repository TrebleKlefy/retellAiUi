import React, { useState } from 'react';
import { LeadFilters, LeadStatus, LeadPriority } from '../types/lead';

interface LeadFiltersProps {
  onFilterChange: (filters: LeadFilters) => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<LeadFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: LeadFilters = {};
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search leads..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            {Object.values(LeadStatus).map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">All Priorities</option>
            {Object.values(LeadPriority).map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source
          </label>
          <input
            type="text"
            placeholder="Filter by source..."
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="0"
              value={filters.scoreMin || ''}
              onChange={(e) => handleFilterChange('scoreMin', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              placeholder="100"
              value={filters.scoreMax || ''}
              onChange={(e) => handleFilterChange('scoreMax', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (value === undefined || value === '' || value === null) return null;
            
            let displayValue = value;
            if (key === 'dateFrom' || key === 'dateTo') {
              displayValue = new Date(value).toLocaleDateString();
            } else if (key === 'status') {
              displayValue = (value as string).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            } else if (key === 'priority') {
              displayValue = (value as string).charAt(0).toUpperCase() + (value as string).slice(1);
            }

            return (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {key}: {displayValue}
                <button
                  onClick={() => handleFilterChange(key as keyof LeadFilters, undefined)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};