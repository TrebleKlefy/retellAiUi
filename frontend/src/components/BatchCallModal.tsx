import React, { useState, useEffect } from 'react';
import { BatchCallRequest, CallPriority } from '../types/call';
import { callService } from '../services/callService';
import { Button } from './common/Button';

interface BatchCallModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchCallModal: React.FC<BatchCallModalProps> = ({
  clientId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<BatchCallRequest>>({
    clientId,
    priority: CallPriority.NORMAL,
    maxConcurrent: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load leads for this client
      loadLeads();
    }
  }, [isOpen, clientId]);

  const loadLeads = async () => {
    try {
      // This would need to be implemented based on your lead service
      // const clientLeads = await leadService.getLeadsByClient(clientId);
      // setLeads(clientLeads);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedLeads.length === 0) {
      alert('Please select at least one lead');
      return;
    }

    try {
      setIsLoading(true);
      const batchData: BatchCallRequest = {
        ...formData,
        leadIds: selectedLeads
      } as BatchCallRequest;
      
      await callService.createBatchCall(clientId, batchData);
      onSuccess();
    } catch (error) {
      console.error('Failed to create batch call:', error);
      alert('Failed to create batch call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BatchCallRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLeadSelection = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads(prev => [...prev, leadId]);
    } else {
      setSelectedLeads(prev => prev.filter(id => id !== leadId));
    }
  };

  const handleSelectAll = () => {
    setSelectedLeads(leads.map(lead => lead.id));
  };

  const handleDeselectAll = () => {
    setSelectedLeads([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Batch Calls</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority || CallPriority.NORMAL}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(CallPriority).map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Concurrent
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.maxConcurrent || 10}
                onChange={(e) => handleInputChange('maxConcurrent', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled At
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('scheduledAt', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Leads ({selectedLeads.length} selected)
              </label>
              <div className="space-x-2">
                <Button
                  type="button"
                  onClick={handleSelectAll}
                  variant="secondary"
                  size="sm"
                >
                  Select All
                </Button>
                <Button
                  type="button"
                  onClick={handleDeselectAll}
                  variant="secondary"
                  size="sm"
                >
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
              {leads.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No leads available for this client
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <label key={lead.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {lead.phone} • {lead.email}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || selectedLeads.length === 0}
            >
              {isLoading ? 'Creating...' : `Create ${selectedLeads.length} Calls`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};