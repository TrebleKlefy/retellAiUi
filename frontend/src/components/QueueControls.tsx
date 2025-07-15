import React, { useState } from 'react';
import { QueuePriority } from '../types/queue';
import { queueService } from '../services/queueService';

interface QueueControlsProps {
  clientId: string;
  onQueueUpdated: () => void;
  onProcessQueue: () => void;
}

export const QueueControls: React.FC<QueueControlsProps> = ({ 
  clientId, 
  onQueueUpdated, 
  onProcessQueue 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    leadId: '',
    priority: QueuePriority.NORMAL,
    scheduledAt: '',
    maxRetries: 3
  });

  const handleProcessQueue = async () => {
    try {
      setIsProcessing(true);
      await onProcessQueue();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.leadId.trim()) {
      alert('Please enter a Lead ID');
      return;
    }

    try {
      setIsAddingItem(true);
      
      const queueData = {
        clientId,
        leadId: formData.leadId.trim(),
        priority: formData.priority,
        scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : undefined,
        maxRetries: formData.maxRetries
      };

      await queueService.addToQueue(clientId, queueData);
      
      // Reset form
      setFormData({
        leadId: '',
        priority: QueuePriority.NORMAL,
        scheduledAt: '',
        maxRetries: 3
      });
      setShowAddForm(false);
      
      // Refresh queue
      onQueueUpdated();
      
      alert('Item added to queue successfully!');
    } catch (error) {
      console.error('Failed to add item to queue:', error);
      alert('Failed to add item to queue. Please try again.');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxRetries' ? parseInt(value) || 3 : value
    }));
  };

  return (
    <div className="flex space-x-3">
      {/* Process Queue Button */}
      <button
        onClick={handleProcessQueue}
        disabled={isProcessing}
        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Process Queue
          </>
        )}
      </button>

      {/* Add to Queue Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add to Queue
      </button>

      {/* Refresh Button */}
      <button
        onClick={onQueueUpdated}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>

      {/* Add to Queue Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Item to Queue</h3>
              
              <form onSubmit={handleAddToQueue} className="space-y-4">
                <div>
                  <label htmlFor="leadId" className="block text-sm font-medium text-gray-700">
                    Lead ID *
                  </label>
                  <input
                    type="text"
                    id="leadId"
                    name="leadId"
                    value={formData.leadId}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter Lead ID"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value={QueuePriority.URGENT}>Urgent</option>
                    <option value={QueuePriority.HIGH}>High</option>
                    <option value={QueuePriority.NORMAL}>Normal</option>
                    <option value={QueuePriority.LOW}>Low</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700">
                    Scheduled At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledAt"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="maxRetries" className="block text-sm font-medium text-gray-700">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    id="maxRetries"
                    name="maxRetries"
                    value={formData.maxRetries}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingItem}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {isAddingItem ? 'Adding...' : 'Add to Queue'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};