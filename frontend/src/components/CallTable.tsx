import React, { useState } from 'react';
import { Call, CallStatus, CallOutcome, CallPriority } from '../types/call';
import { callService } from '../services/callService';
import { Button } from './common/Button';

interface CallTableProps {
  calls: Call[];
  onUpdate: () => void;
}

export const CallTable: React.FC<CallTableProps> = ({ calls, onUpdate }) => {
  const [selectedCalls, setSelectedCalls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleCancelCall = async (callId: string) => {
    if (window.confirm('Are you sure you want to cancel this call?')) {
      try {
        setIsLoading(callId);
        await callService.cancelCall(callId);
        onUpdate();
      } catch (error) {
        console.error('Failed to cancel call:', error);
        alert('Failed to cancel call');
      } finally {
        setIsLoading(null);
      }
    }
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case CallStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case CallStatus.FAILED: return 'bg-red-100 text-red-800';
      case CallStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800';
      case CallStatus.SCHEDULED: return 'bg-yellow-100 text-yellow-800';
      case CallStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOutcomeColor = (outcome: CallOutcome) => {
    switch (outcome) {
      case CallOutcome.APPOINTMENT_SCHEDULED: return 'bg-green-100 text-green-800';
      case CallOutcome.QUALIFIED_LEAD: return 'bg-blue-100 text-blue-800';
      case CallOutcome.NOT_INTERESTED: return 'bg-red-100 text-red-800';
      case CallOutcome.NO_ANSWER: return 'bg-gray-100 text-gray-800';
      case CallOutcome.VOICEMAIL: return 'bg-yellow-100 text-yellow-800';
      case CallOutcome.WRONG_NUMBER: return 'bg-orange-100 text-orange-800';
      case CallOutcome.DO_NOT_CALL: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: CallPriority) => {
    switch (priority) {
      case CallPriority.URGENT: return 'bg-red-100 text-red-800';
      case CallPriority.HIGH: return 'bg-orange-100 text-orange-800';
      case CallPriority.NORMAL: return 'bg-blue-100 text-blue-800';
      case CallPriority.LOW: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration: number) => {
    if (!duration) return '-';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  if (calls.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg">No calls found</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Outcome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scheduled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {call.leadId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {call.toNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(call.status)}`}>
                    {call.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getOutcomeColor(call.outcome)}`}>
                    {call.outcome.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDuration(call.duration)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(call.priority)}`}>
                    {call.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(call.scheduledAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {call.status === CallStatus.SCHEDULED && (
                      <Button
                        onClick={() => handleCancelCall(call.id)}
                        disabled={isLoading === call.id}
                        variant="danger"
                        size="sm"
                      >
                        {isLoading === call.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    )}
                    {call.transcript && (
                      <Button
                        onClick={() => {/* Show transcript modal */}}
                        variant="secondary"
                        size="sm"
                      >
                        Transcript
                      </Button>
                    )}
                    {call.recordingUrl && (
                      <Button
                        onClick={() => window.open(call.recordingUrl, '_blank')}
                        variant="secondary"
                        size="sm"
                      >
                        Recording
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};