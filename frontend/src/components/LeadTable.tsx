import React, { useState } from 'react';
import { Lead, LeadStatus, LeadPriority } from '../types/lead';
import { leadService } from '../services/leadService';

interface LeadTableProps {
  leads: Lead[];
  onUpdate: () => void;
  onEdit: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({ leads, onUpdate, onEdit }) => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Lead;
    direction: 'asc' | 'desc';
  } | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      try {
        await Promise.all(selectedLeads.map(id => leadService.deleteLead(id)));
        setSelectedLeads([]);
        onUpdate();
      } catch (error) {
        console.error('Failed to delete leads:', error);
        alert('Failed to delete some leads');
      }
    }
  };

  const handleStatusChange = async (leadId: string, status: string) => {
    try {
      await leadService.updateLeadStatus(leadId, status);
      onUpdate();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      alert('Failed to update lead status');
    }
  };

  const handleSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeads = React.useMemo(() => {
    if (!sortConfig) return leads;

    return [...leads].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [leads, sortConfig]);

  const getSortIcon = (key: keyof Lead) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '↕️';
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No leads found</p>
      </div>
    );
  }

  return (
    <div>
      {selectedLeads.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">
              {selectedLeads.length} leads selected
            </span>
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('firstName')}
              >
                Name {getSortIcon('firstName')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('phone')}
              >
                Phone {getSortIcon('phone')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status {getSortIcon('status')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                Priority {getSortIcon('priority')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('score')}
              >
                Score {getSortIcon('score')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('source')}
              >
                Source {getSortIcon('source')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {leadService.formatPhoneNumber(lead.phone)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`text-sm border border-gray-300 rounded px-2 py-1 ${leadService.getStatusColor(lead.status)}`}
                  >
                    {Object.values(LeadStatus).map(status => (
                      <option key={status} value={status}>
                        {leadService.formatLeadStatus(status)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leadService.getPriorityColor(lead.priority)}`}>
                    {leadService.formatPriority(lead.priority)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <span className="mr-2">{lead.score}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${lead.score}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(lead)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this lead?')) {
                        leadService.deleteLead(lead.id).then(onUpdate);
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};