import React from 'react';
import { LeadStats as LeadStatsType } from '../types/lead';

interface LeadStatsProps {
  stats: LeadStatsType;
  isLoading: boolean;
}

export const LeadStats: React.FC<LeadStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statusStats = [
    { label: 'New', value: stats.new, color: 'bg-blue-500', percentage: stats.total > 0 ? (stats.new / stats.total * 100).toFixed(1) : '0' },
    { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500', percentage: stats.total > 0 ? (stats.inProgress / stats.total * 100).toFixed(1) : '0' },
    { label: 'Contacted', value: stats.contacted, color: 'bg-purple-500', percentage: stats.total > 0 ? (stats.contacted / stats.total * 100).toFixed(1) : '0' },
    { label: 'Qualified', value: stats.qualified, color: 'bg-green-500', percentage: stats.total > 0 ? (stats.qualified / stats.total * 100).toFixed(1) : '0' },
    { label: 'Appointment', value: stats.appointmentScheduled, color: 'bg-indigo-500', percentage: stats.total > 0 ? (stats.appointmentScheduled / stats.total * 100).toFixed(1) : '0' },
    { label: 'Sale Made', value: stats.saleMade, color: 'bg-emerald-500', percentage: stats.total > 0 ? (stats.saleMade / stats.total * 100).toFixed(1) : '0' },
    { label: 'Not Interested', value: stats.notInterested, color: 'bg-red-500', percentage: stats.total > 0 ? (stats.notInterested / stats.total * 100).toFixed(1) : '0' },
    { label: 'Do Not Call', value: stats.doNotCall, color: 'bg-gray-500', percentage: stats.total > 0 ? (stats.doNotCall / stats.total * 100).toFixed(1) : '0' }
  ];

  const performanceStats = [
    { label: 'Total Leads', value: stats.total, color: 'bg-blue-100 text-blue-800' },
    { label: 'Conversion Rate', value: `${stats.conversionRate}%`, color: 'bg-green-100 text-green-800' },
    { label: 'Average Score', value: stats.averageScore, color: 'bg-purple-100 text-purple-800' },
    { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, color: 'bg-orange-100 text-orange-800' }
  ];

  return (
    <div className="mb-6">
      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {performanceStats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <div className="w-6 h-6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-4 h-4 rounded-full ${stat.color} mr-2`}></div>
                <span className="text-sm font-medium text-gray-700">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.percentage}%</div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${stat.color} h-2 rounded-full`}
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg shadow border mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">New Leads</span>
            <span className="text-sm text-gray-900">{stats.new}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Contacted</span>
            <span className="text-sm text-gray-900">{stats.contacted}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Qualified</span>
            <span className="text-sm text-gray-900">{stats.qualified}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Appointments Scheduled</span>
            <span className="text-sm text-gray-900">{stats.appointmentScheduled}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Sales Made</span>
            <span className="text-sm text-gray-900">{stats.saleMade}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Overall Conversion Rate</span>
              <span className="text-sm font-bold text-green-600">{stats.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};