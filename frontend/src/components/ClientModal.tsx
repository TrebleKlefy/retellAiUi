import React, { useState, useEffect } from 'react';
import { Client, CreateClientRequest } from '../types/client';
import { clientService } from '../services/clientService';

interface ClientModalProps {
  client?: Client | null;
  onClose: () => void;
  onSave: () => void;
}

type TabType = 'basic' | 'integrations' | 'schedule' | 'compliance' | 'preferences';

export const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: '',
    airtable: {
      apiKey: '',
      baseId: '',
      leadsTable: 'Leads',
      resultsTable: 'Call Results',
      enabled: false
    },
    googleSheets: {
      spreadsheetId: '',
      sheetName: 'Sheet1',
      enabled: false,
      syncInterval: null
    },
    retell: {
      apiKey: '',
      agentId: '',
      fromNumber: ''
    },
    schedule: {
      timezone: 'America/New_York',
      activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      timeWindows: [{ start: '09:00', end: '17:00' }],
      maxConcurrent: 5,
      delayBetweenCalls: 3000,
      maxAttempts: 3,
      callCooldownHours: 24
    },
    compliance: {
      enableStateFiltering: false,
      allowedStates: [],
      enableDuplicateDetection: true,
      quotaEnabled: false,
      dailyQuota: 100
    },
    preferences: {
      priority: 1,
      urgentCallsEnabled: true,
      batchDialingEnabled: true,
      pauseForUrgent: false,
      leadScoring: true,
      duplicateDetection: true,
      autoFailAfterAttempts: true
    }
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (client) {
        await clientService.updateClient(client.id, formData);
      } else {
        await clientService.createClient(formData);
      }
      onSave();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      setError(error.response?.data?.message || 'Failed to save client. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'basic', label: 'Basic Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'integrations', label: 'Integrations', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { id: 'schedule', label: 'Schedule', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'compliance', label: 'Compliance', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  const renderBasicInfo = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      {/* Airtable Configuration */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Airtable Integration</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.airtable?.enabled || false}
              onChange={(e) => setFormData({
                ...formData,
                airtable: { ...formData.airtable!, enabled: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={formData.airtable?.apiKey || ''}
              onChange={(e) => setFormData({
                ...formData,
                airtable: { ...formData.airtable!, apiKey: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base ID</label>
            <input
              type="text"
              value={formData.airtable?.baseId || ''}
              onChange={(e) => setFormData({
                ...formData,
                airtable: { ...formData.airtable!, baseId: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Leads Table</label>
            <input
              type="text"
              value={formData.airtable?.leadsTable || 'Leads'}
              onChange={(e) => setFormData({
                ...formData,
                airtable: { ...formData.airtable!, leadsTable: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Results Table</label>
            <input
              type="text"
              value={formData.airtable?.resultsTable || 'Call Results'}
              onChange={(e) => setFormData({
                ...formData,
                airtable: { ...formData.airtable!, resultsTable: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Google Sheets Configuration */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Google Sheets Integration</h4>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.googleSheets?.enabled || false}
              onChange={(e) => setFormData({
                ...formData,
                googleSheets: { ...formData.googleSheets!, enabled: e.target.checked }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Spreadsheet ID</label>
            <input
              type="text"
              value={formData.googleSheets?.spreadsheetId || ''}
              onChange={(e) => setFormData({
                ...formData,
                googleSheets: { ...formData.googleSheets!, spreadsheetId: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sheet Name</label>
            <input
              type="text"
              value={formData.googleSheets?.sheetName || 'Sheet1'}
              onChange={(e) => setFormData({
                ...formData,
                googleSheets: { ...formData.googleSheets!, sheetName: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Retell AI Configuration */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Retell AI Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={formData.retell?.apiKey || ''}
              onChange={(e) => setFormData({
                ...formData,
                retell: { ...formData.retell!, apiKey: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent ID</label>
            <input
              type="text"
              value={formData.retell?.agentId || ''}
              onChange={(e) => setFormData({
                ...formData,
                retell: { ...formData.retell!, agentId: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Number</label>
            <input
              type="text"
              value={formData.retell?.fromNumber || ''}
              onChange={(e) => setFormData({
                ...formData,
                retell: { ...formData.retell!, fromNumber: e.target.value }
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
          <select
            value={formData.schedule?.timezone || 'America/New_York'}
            onChange={(e) => setFormData({
              ...formData,
              schedule: { ...formData.schedule!, timezone: e.target.value }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Concurrent Calls</label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.schedule?.maxConcurrent || 5}
            onChange={(e) => setFormData({
              ...formData,
              schedule: { ...formData.schedule!, maxConcurrent: parseInt(e.target.value) }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delay Between Calls (ms)</label>
          <input
            type="number"
            min="0"
            value={formData.schedule?.delayBetweenCalls || 3000}
            onChange={(e) => setFormData({
              ...formData,
              schedule: { ...formData.schedule!, delayBetweenCalls: parseInt(e.target.value) }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Attempts</label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.schedule?.maxAttempts || 3}
            onChange={(e) => setFormData({
              ...formData,
              schedule: { ...formData.schedule!, maxAttempts: parseInt(e.target.value) }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Active Days</label>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <label key={day} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.schedule?.activeDays?.includes(day) || false}
                onChange={(e) => {
                  const currentDays = formData.schedule?.activeDays || [];
                  const newDays = e.target.checked
                    ? [...currentDays, day]
                    : currentDays.filter(d => d !== day);
                  setFormData({
                    ...formData,
                    schedule: { ...formData.schedule!, activeDays: newDays }
                  });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{day}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.compliance?.enableStateFiltering || false}
            onChange={(e) => setFormData({
              ...formData,
              compliance: { ...formData.compliance!, enableStateFiltering: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable State Filtering</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.compliance?.enableDuplicateDetection || false}
            onChange={(e) => setFormData({
              ...formData,
              compliance: { ...formData.compliance!, enableDuplicateDetection: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable Duplicate Detection</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.compliance?.quotaEnabled || false}
            onChange={(e) => setFormData({
              ...formData,
              compliance: { ...formData.compliance!, quotaEnabled: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable Daily Quota</span>
        </label>
      </div>

      {formData.compliance?.quotaEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Quota</label>
          <input
            type="number"
            min="1"
            value={formData.compliance?.dailyQuota || 100}
            onChange={(e) => setFormData({
              ...formData,
              compliance: { ...formData.compliance!, dailyQuota: parseInt(e.target.value) }
            })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-10)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={formData.preferences?.priority || 1}
          onChange={(e) => setFormData({
            ...formData,
            preferences: { ...formData.preferences!, priority: parseInt(e.target.value) }
          })}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.preferences?.urgentCallsEnabled || false}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences!, urgentCallsEnabled: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable Urgent Calls</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.preferences?.batchDialingEnabled || false}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences!, batchDialingEnabled: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable Batch Dialing</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.preferences?.pauseForUrgent || false}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences!, pauseForUrgent: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Pause for Urgent Calls</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.preferences?.leadScoring || false}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences!, leadScoring: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable Lead Scoring</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.preferences?.duplicateDetection || false}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences!, duplicateDetection: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Enable Duplicate Detection</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.preferences?.autoFailAfterAttempts || false}
            onChange={(e) => setFormData({
              ...formData,
              preferences: { ...formData.preferences!, autoFailAfterAttempts: e.target.checked }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Auto Fail After Max Attempts</span>
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo();
      case 'integrations':
        return renderIntegrations();
      case 'schedule':
        return renderSchedule();
      case 'compliance':
        return renderCompliance();
      case 'preferences':
        return renderPreferences();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex">
          {/* Tab Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <nav className="p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="mb-6">
                {renderTabContent()}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'Saving...' : (client ? 'Update Client' : 'Create Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};