import React, { useState } from 'react';
import { QueueItem, QueuePriority, QueueStatus } from '../types/queue';
import { queueService } from '../services/queueService';

interface QueueTableProps {
  items: QueueItem[];
  onUpdate: () => void;
  onCancel: () => void;
}

export const QueueTable: React.FC<QueueTableProps> = ({ items, onUpdate, onCancel }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCancelItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to cancel this queue item?')) {
      try {
        setIsLoading(itemId);
        await queueService.cancelQueueItem(itemId);
        onCancel();
      } catch (error) {
        console.error('Failed to cancel queue item:', error);
        alert('Failed to cancel queue item. Please try again.');
      } finally {
        setIsLoading(null);
      }
    }
  };

  const getPriorityColor = (priority: QueuePriority) => {
    switch (priority) {
      case QueuePriority.URGENT: return 'bg-red-100 text-red-800';
      case QueuePriority.HIGH: return 'bg-orange-100 text-orange-800';
      case QueuePriority.NORMAL: return 'bg-blue-100 text-blue-800';
      case QueuePriority.LOW: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: QueueStatus) => {
    switch (status) {
      case QueueStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case QueueStatus.SCHEDULED: return 'bg-blue-100 text-blue-800';
      case QueueStatus.IN_PROGRESS: return 'bg-green-100 text-green-800';
      case QueueStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case QueueStatus.FAILED: return 'bg-red-100 text-red-800';
      case QueueStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      case QueueStatus.RETRY_SCHEDULED: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (items.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No queue items</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding items to the queue.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Queue Items ({items.length})</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Retry Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.leadId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>{formatDate(item.scheduledAt)}</div>
                    <div className="text-xs text-gray-500">{formatTimeAgo(item.scheduledAt)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.retryCount} / {item.maxRetries}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimeAgo(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {item.status === QueueStatus.PENDING && (
                    <button
                      onClick={() => handleCancelItem(item.id)}
                      disabled={isLoading === item.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading === item.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                  {item.status === QueueStatus.FAILED && (
                    <button
                      onClick={() => onUpdate()}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Retry
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};