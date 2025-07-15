import React, { useState, useEffect } from 'react';
import { CreateCallRequest, CallPriority } from '../types/call';
import { callService } from '../services/callService';
import { Button } from './common/Button';

interface CreateCallModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCallModal: React.FC<CreateCallModalProps> = ({
  clientId,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<Partial<CreateCallRequest>>({
    clientId,
    priority: CallPriority.NORMAL
  });
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

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
    
    if (!formData.leadId) {
      alert('Please select a lead');
      return;
    }

    try {
      setIsLoading(true);
      await callService.createCall(clientId, formData as CreateCallRequest);
      onSuccess();
    } catch (error) {
      console.error('Failed to create call:', error);
      alert('Failed to create call');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateCallRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Call</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lead
            </label>
            <select
              value={formData.leadId || ''}
              onChange={(e) => handleInputChange('leadId', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.firstName} {lead.lastName} - {lead.phone}
                </option>
              ))}
            </select>
          </div>

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
              Scheduled At
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt ? new Date(formData.scheduledAt).toISOString().slice(0, 16) : ''}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Call'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};