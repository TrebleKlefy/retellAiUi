import React, { useState, useEffect } from 'react';
import { CallFilters as CallFiltersType, CallStatus, CallOutcome, CallPriority } from '../types/call';
import { Button } from './common/Button';

interface CallFiltersProps {
  filters: CallFiltersType;
  onFilterChange: (filters: CallFiltersType) => void;
}

export const CallFilters: React.FC<CallFiltersProps> = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState<CallFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof CallFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: CallFiltersType = {};
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search calls..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(CallStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Outcome
          </label>
          <select
            value={localFilters.outcome || ''}
            onChange={(e) => handleFilterChange('outcome', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Outcomes</option>
            {Object.values(CallOutcome).map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={localFilters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            {Object.values(CallPriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            type="date"
            value={localFilters.dateFrom ? new Date(localFilters.dateFrom).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            type="date"
            value={localFilters.dateTo ? new Date(localFilters.dateTo).toISOString().split('T')[0] : ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button
          onClick={handleClearFilters}
          variant="secondary"
        >
          Clear Filters
        </Button>
        <Button
          onClick={handleApplyFilters}
          variant="primary"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};