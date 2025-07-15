import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Call, CallStatus, CallOutcome, CallPriority, CallFilters } from '../types/call';
import { callService } from '../services/callService';
import { CallTable } from '../components/CallTable';
import { CallStats } from '../components/CallStats';
import { CallControls } from '../components/CallControls';
import { CallFilters as CallFiltersComponent } from '../components/CallFilters';
import { Loading } from '../components/common/Loading';

export const Calls: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [calls, setCalls] = useState<Call[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CallFilters>({});

  useEffect(() => {
    if (clientId) {
      loadCalls();
      loadStats();
    }
  }, [clientId, filters]);

  const loadCalls = async () => {
    try {
      setIsLoading(true);
      const data = await callService.getCalls(clientId!, filters);
      setCalls(data);
    } catch (error) {
      console.error('Failed to load calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await callService.getCallStats(clientId!);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFilterChange = (newFilters: CallFilters) => {
    setFilters(newFilters);
  };

  const handleCallCreated = () => {
    loadCalls();
    loadStats();
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Call Management</h1>
        <CallControls clientId={clientId!} onCallCreated={handleCallCreated} />
      </div>

      {stats && <CallStats stats={stats} />}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Call Filters</h2>
        <CallFiltersComponent filters={filters} onFilterChange={handleFilterChange} />
      </div>

      <CallTable calls={calls} onUpdate={loadCalls} />
    </div>
  );
};