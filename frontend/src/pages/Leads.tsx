import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lead, LeadFilters, LeadStats } from '../types/lead';
import { leadService } from '../services/leadService';
import { LeadTable } from '../components/LeadTable';
import { ImportModal } from '../components/ImportModal';
import { LeadFilters as LeadFiltersComponent } from '../components/LeadFilters';
import { LeadStats as LeadStatsComponent } from '../components/LeadStats';
import { LeadModal } from '../components/LeadModal';
import { Loading } from '../components/common/Loading';

export const Leads: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [filters, setFilters] = useState<LeadFilters>({});
  const [showImportModal, setShowImportModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [syncLoading, setSyncLoading] = useState({
    airtable: false,
    googleSheets: false
  });

  useEffect(() => {
    if (clientId) {
      loadLeads();
      loadStats();
    }
  }, [clientId, filters]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const data = await leadService.getLeads(clientId!, filters);
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await leadService.getLeadStats(clientId!);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    loadLeads();
    loadStats();
  };

  const handleFilterChange = (newFilters: LeadFilters) => {
    setFilters(newFilters);
  };

  const handleCreateLead = () => {
    setEditingLead(null);
    setShowLeadModal(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setShowLeadModal(true);
  };

  const handleLeadSave = () => {
    setShowLeadModal(false);
    loadLeads();
    loadStats();
  };

  const handleSyncAirtable = async () => {
    try {
      setSyncLoading(prev => ({ ...prev, airtable: true }));
      const result = await leadService.syncFromAirtable(clientId!);
      alert(`Airtable sync completed: ${result.imported} imported, ${result.errors} errors`);
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Failed to sync from Airtable:', error);
      alert('Failed to sync from Airtable');
    } finally {
      setSyncLoading(prev => ({ ...prev, airtable: false }));
    }
  };

  const handleSyncGoogleSheets = async () => {
    try {
      setSyncLoading(prev => ({ ...prev, googleSheets: true }));
      const result = await leadService.syncFromGoogleSheets(clientId!);
      alert(`Google Sheets sync completed: ${result.imported} imported, ${result.errors} errors`);
      loadLeads();
      loadStats();
    } catch (error) {
      console.error('Failed to sync from Google Sheets:', error);
      alert('Failed to sync from Google Sheets');
    } finally {
      setSyncLoading(prev => ({ ...prev, googleSheets: false }));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateLead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Lead
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Import Leads
          </button>
          <button
            onClick={handleSyncAirtable}
            disabled={syncLoading.airtable}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {syncLoading.airtable ? 'Syncing...' : 'Sync Airtable'}
          </button>
          <button
            onClick={handleSyncGoogleSheets}
            disabled={syncLoading.googleSheets}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            {syncLoading.googleSheets ? 'Syncing...' : 'Sync Sheets'}
          </button>
        </div>
      </div>

      {/* Stats Section */}
      {stats && <LeadStatsComponent stats={stats} isLoading={isLoadingStats} />}

      {/* Filters Section */}
      <div className="mb-6">
        <LeadFiltersComponent onFilterChange={handleFilterChange} />
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <LeadTable 
          leads={leads} 
          onUpdate={loadLeads}
          onEdit={handleEditLead}
        />
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          clientId={clientId!}
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Lead Modal */}
      {showLeadModal && (
        <LeadModal
          lead={editingLead}
          clientId={clientId!}
          onClose={() => setShowLeadModal(false)}
          onSave={handleLeadSave}
        />
      )}
    </div>
  );
};