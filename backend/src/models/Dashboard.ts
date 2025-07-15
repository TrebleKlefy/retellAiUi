export interface Dashboard {
  id: string;
  clientId?: string; // null for global dashboard
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: WidgetLayout[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  refreshInterval: number; // seconds
}

export enum WidgetType {
  METRIC_CARD = 'metric_card',
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  TABLE = 'table',
  GAUGE = 'gauge',
  PROGRESS_BAR = 'progress_bar',
  ALERT_LIST = 'alert_list'
}

export interface WidgetConfig {
  dataSource: string;
  filters?: Record<string, any>;
  aggregation?: string;
  timeRange?: string;
  chartOptions?: ChartOptions;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WidgetLayout {
  widgetId: string;
  position: WidgetPosition;
}

export interface ChartOptions {
  type: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animate?: boolean;
}

export interface AnalyticsData {
  leads: LeadMetrics;
  calls: CallMetrics;
  queue: QueueMetrics;
  performance: PerformanceMetrics;
  trends: TrendData[];
}

export interface LeadMetrics {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
  averageScore: number;
}

export interface CallMetrics {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  averageDuration: number;
  totalDuration: number;
  outcomes: Record<string, number>;
}

export interface QueueMetrics {
  totalItems: number;
  pendingItems: number;
  inProgressItems: number;
  averageWaitTime: number;
  processingRate: number;
  priorityDistribution: Record<string, number>;
}

export interface PerformanceMetrics {
  dailyCalls: number;
  weeklyCalls: number;
  monthlyCalls: number;
  dailyLeads: number;
  weeklyLeads: number;
  monthlyLeads: number;
  efficiency: number;
}

export interface TrendData {
  date: string;
  calls: number;
  leads: number;
  conversions?: number;
  revenue?: number;
}

export interface CreateDashboardRequest {
  clientId?: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  layout: WidgetLayout[];
  isDefault?: boolean;
}

export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  widgets?: DashboardWidget[];
  layout?: WidgetLayout[];
  isDefault?: boolean;
}

export interface DashboardResponse {
  success: boolean;
  data: Dashboard;
}

export interface DashboardsResponse {
  success: boolean;
  data: Dashboard[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportConfig {
  type: 'leads' | 'calls' | 'performance' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  timeRange: string;
  clientId?: string;
  filters?: Record<string, any>;
  includeCharts?: boolean;
  includeTables?: boolean;
}

export interface ReportResponse {
  success: boolean;
  data: {
    data: any;
    format: string;
    filename: string;
  };
}