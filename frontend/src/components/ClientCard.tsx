import React from 'react';
import { Client } from '../types/client';

interface ClientCardProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onEdit, onDelete }) => {
  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 3) return 'bg-red-100 text-red-800';
    if (priority <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{client.name}</h3>
            <p className="text-sm text-gray-500 font-mono">{client.slug}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(client.isActive)}`}>
              {client.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(client.preferences.priority)}`}>
              Priority {client.preferences.priority}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Timezone:</span>
            <span className="text-gray-900">{client.schedule.timezone}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Max Concurrent:</span>
            <span className="text-gray-900">{client.schedule.maxConcurrent}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Max Attempts:</span>
            <span className="text-gray-900">{client.schedule.maxAttempts}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="font-medium text-gray-700">Integrations:</span>
          </div>
          <div className="flex space-x-2 mb-4">
            <span className={`px-2 py-1 text-xs rounded-full ${
              client.airtable.enabled 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              Airtable
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              client.googleSheets.enabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              Sheets
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              client.retell.apiKey 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              Retell
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-600 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};