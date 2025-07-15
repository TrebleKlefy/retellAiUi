import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnalyticsData } from '../types/analytics';
import { analyticsService } from '../services/analyticsService';
import { MetricCard } from '../components/MetricCard';
import { LineChart } from '../components/LineChart';
import { BarChart } from '../components/BarChart';
import { PieChart } from '../components/PieChart';
import { TimeRangeSelector } from '../components/TimeRangeSelector';
import { Loading } from '../components/common/Loading';

export const Dashboard: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [clientId, timeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await analyticsService.getDashboardData(clientId, timeRange);
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Calculate trend changes for metric cards
  const getTrendChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const recentTrends = data.trends.slice(-2);
  const currentTrend = recentTrends[1] || { calls: 0, leads: 0 };
  const previousTrend = recentTrends[0] || { calls: 0, leads: 0 };

  const callTrendChange = getTrendChange(currentTrend.calls, previousTrend.calls);
  const leadTrendChange = getTrendChange(currentTrend.leads, previousTrend.leads);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {clientId ? 'Client Dashboard' : 'Global Dashboard'}
          </h1>
          <p className="text-gray-600 mt-1">
            {clientId ? 'Client-specific analytics and insights' : 'Overview of all client performance'}
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Leads"
          value={data.leads.total}
          change={leadTrendChange}
          icon="users"
          color="blue"
        />
        <MetricCard
          title="Total Calls"
          value={data.calls.total}
          change={callTrendChange}
          icon="phone"
          color="green"
        />
        <MetricCard
          title="Success Rate"
          value={`${data.calls.successRate.toFixed(1)}%`}
          change={data.calls.successRate}
          icon="trophy"
          color="yellow"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${data.leads.conversionRate.toFixed(1)}%`}
          change={data.leads.conversionRate}
          icon="target"
          color="purple"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="New Leads"
          value={data.leads.new}
          icon="trending-up"
          color="green"
        />
        <MetricCard
          title="Qualified Leads"
          value={data.leads.qualified}
          icon="chart-bar"
          color="blue"
        />
        <MetricCard
          title="Average Call Duration"
          value={`${Math.round(data.calls.averageDuration)}s`}
          icon="clock"
          color="yellow"
        />
        <MetricCard
          title="Queue Items"
          value={data.queue.totalItems}
          icon="trending-up"
          color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <LineChart
            data={data.trends}
            xKey="date"
            yKey="calls"
            title="Call Trends"
            color="#10B981"
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <LineChart
            data={data.trends}
            xKey="date"
            yKey="leads"
            title="Lead Trends"
            color="#3B82F6"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <PieChart
            data={Object.entries(data.calls.outcomes).map(([key, value]) => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              value
            }))}
            title="Call Outcomes Distribution"
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <BarChart
            data={[
              { name: 'Pending', value: data.queue.pendingItems },
              { name: 'In Progress', value: data.queue.inProgressItems },
              { name: 'Completed', value: data.queue.totalItems - data.queue.pendingItems - data.queue.inProgressItems }
            ]}
            title="Queue Status"
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{data.performance.dailyCalls}</p>
            <p className="text-sm text-gray-600">Daily Calls</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{data.performance.dailyLeads}</p>
            <p className="text-sm text-gray-600">Daily Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{data.performance.weeklyCalls}</p>
            <p className="text-sm text-gray-600">Weekly Calls</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{data.performance.efficiency.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Efficiency</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 