import React from 'react';
import { CallStats as CallStatsType } from '../types/call';

interface CallStatsProps {
  stats: CallStatsType;
}

export const CallStats: React.FC<CallStatsProps> = ({ stats }) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalCalls}</div>
          <div className="text-sm text-blue-800">Total Calls</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.successfulCalls}</div>
          <div className="text-sm text-green-800">Successful Calls</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.failedCalls}</div>
          <div className="text-sm text-red-800">Failed Calls</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.successRate.toFixed(1)}%</div>
          <div className="text-sm text-purple-800">Success Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-3">Calls by Status</h3>
          <div className="space-y-2">
            {Object.entries(stats.callsByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-md font-semibold text-gray-900 mb-3">Calls by Outcome</h3>
          <div className="space-y-2">
            {Object.entries(stats.callsByOutcome).map(([outcome, count]) => (
              <div key={outcome} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{outcome.replace('_', ' ')}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{formatDuration(stats.totalDuration)}</div>
            <div className="text-sm text-gray-600">Total Duration</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{formatDuration(stats.averageDuration)}</div>
            <div className="text-sm text-gray-600">Average Duration</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{stats.totalCalls > 0 ? Math.round(stats.totalDuration / stats.totalCalls) : 0}s</div>
            <div className="text-sm text-gray-600">Avg Duration (seconds)</div>
          </div>
        </div>
      </div>
    </div>
  );
};