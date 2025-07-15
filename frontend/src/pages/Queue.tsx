import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QueueItem, QueueStats } from '../types/queue';
import { queueService } from '../services/queueService';
import { QueueTable } from '../components/QueueTable';
import { QueueStats as QueueStatsComponent } from '../components/QueueStats';
import { QueueControls } from '../components/QueueControls';
import { QueueFilters } from '../components/QueueFilters';
import { Loading } from '../components/common/Loading';

export const Queue: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clientId) {
      loadQueueData();
    }
  }, [clientId, filters]);

  const loadQueueData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [itemsData, statsData] = await Promise.all([
        queueService.getQueueItems(clientId!, filters),
        queueService.getQueueStats(clientId!)
      ]);
      
      setQueueItems(itemsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load queue data:', error);
      setError('Failed to load queue data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      const result = await queueService.processQueue(clientId!);
      console.log('Queue processing result:', result);
      
      // Show success message
      alert(`Queue processed: ${result.processed} items (${result.successful} successful, ${result.failed} failed)`);
      
      // Reload data
      loadQueueData();
    } catch (error) {
      console.error('Failed to process queue:', error);
      alert('Failed to process queue. Please try again.');
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleQueueUpdated = () => {
    loadQueueData();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadQueueData}
                  className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <QueueControls 
          clientId={clientId!} 
          onQueueUpdated={handleQueueUpdated}
          onProcessQueue={handleProcessQueue}
        />
      </div>

      {stats && <QueueStatsComponent stats={stats} />}

      <div className="mt-6">
        <QueueFilters onFilterChange={handleFilterChange} />
      </div>

      <div className="mt-6">
        <QueueTable 
          items={queueItems} 
          onUpdate={handleQueueUpdated}
          onCancel={handleQueueUpdated}
        />
      </div>
    </div>
  );
};