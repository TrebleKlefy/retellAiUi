import React, { useState, useEffect } from 'react';
import { Client } from '../types/client';
import { clientService } from '../services/clientService';
import { ClientModal } from '../components/ClientModal';
import { ClientCard } from '../components/ClientCard';
import { Loading } from '../components/common/Loading';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await clientService.deleteClient(clientId);
        await loadClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
        setError('Failed to delete client. Please try again.');
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedClient(null);
  };

  const handleModalSave = async () => {
    await loadClients();
    handleModalClose();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your clients and their configurations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Client</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new client.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={() => handleEditClient(client)}
              onDelete={() => handleDeleteClient(client.id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ClientModal
          client={selectedClient}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};