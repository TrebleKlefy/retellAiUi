# Dashboard & Analytics System

## Overview

The Dashboard & Analytics System provides comprehensive real-time insights into lead management, call performance, queue status, and business metrics across all clients. This system includes interactive dashboards, customizable widgets, and detailed analytics reporting.

## Features

### Dashboard Features
- ✅ Real-time metrics display
- ✅ Multi-client dashboard support
- ✅ Customizable widgets
- ✅ Interactive charts and graphs
- ✅ Performance indicators
- ✅ Alert system (framework ready)

### Analytics Features
- ✅ Lead conversion analytics
- ✅ Call performance metrics
- ✅ Queue efficiency analysis
- ✅ Client performance comparison
- ✅ Trend analysis and forecasting
- ✅ Custom report generation

### Reporting Features
- ✅ Automated report generation
- ✅ Export capabilities (PDF, Excel, CSV)
- ✅ Scheduled report delivery (framework ready)
- ✅ Custom report builder
- ✅ Data visualization
- ✅ Performance benchmarking

## Architecture

### Backend Structure

```
backend/src/
├── models/
│   ├── Dashboard.ts          # Dashboard and analytics interfaces
│   └── Queue.ts             # Queue management interfaces
├── services/
│   ├── analyticsService.ts   # Core analytics logic
│   └── queueService.ts      # Queue management service
├── controllers/
│   └── analyticsController.ts # HTTP request handlers
└── routes/
    └── analytics.ts         # API endpoints
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── MetricCard.tsx       # Individual metric display
│   ├── LineChart.tsx        # Trend line charts
│   ├── BarChart.tsx         # Categorical bar charts
│   ├── PieChart.tsx         # Proportional pie charts
│   └── TimeRangeSelector.tsx # Time range controls
├── services/
│   └── analyticsService.ts   # API communication
├── types/
│   └── analytics.ts         # TypeScript interfaces
└── pages/
    └── Dashboard.tsx        # Main dashboard page
```

## API Endpoints

### Analytics Data
- `GET /api/clients/:clientId/analytics/dashboard` - Get dashboard data for specific client
- `GET /api/clients/:clientId/analytics/leads` - Get lead metrics for specific client
- `GET /api/clients/:clientId/analytics/calls` - Get call metrics for specific client
- `GET /api/clients/:clientId/analytics/queue` - Get queue metrics for specific client
- `GET /api/clients/:clientId/analytics/trends` - Get trend data for specific client

### Global Analytics
- `GET /api/analytics/dashboard` - Get global dashboard data
- `GET /api/analytics/leads` - Get global lead metrics
- `GET /api/analytics/calls` - Get global call metrics
- `GET /api/analytics/queue` - Get global queue metrics
- `GET /api/analytics/trends` - Get global trend data

### Dashboard Management
- `POST /api/dashboards` - Create new dashboard
- `GET /api/clients/:clientId/dashboards` - Get client-specific dashboards
- `GET /api/dashboards` - Get global dashboards
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

### Reports
- `POST /api/reports/generate` - Generate custom reports

## Data Models

### Analytics Data Structure
```typescript
interface AnalyticsData {
  leads: LeadMetrics;
  calls: CallMetrics;
  queue: QueueMetrics;
  performance: PerformanceMetrics;
  trends: TrendData[];
}
```

### Lead Metrics
```typescript
interface LeadMetrics {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  conversionRate: number;
  averageScore: number;
}
```

### Call Metrics
```typescript
interface CallMetrics {
  total: number;
  successful: number;
  failed: number;
  successRate: number;
  averageDuration: number;
  totalDuration: number;
  outcomes: Record<string, number>;
}
```

## Installation & Setup

### Backend Dependencies
```bash
cd backend
npm install chart.js pdfkit exceljs
```

### Frontend Dependencies
```bash
cd frontend
npm install recharts
```

### Environment Configuration
Ensure your backend environment variables are properly configured for database connections and API keys.

## Usage

### Accessing the Dashboard
1. Navigate to `/dashboard` for global analytics
2. Navigate to `/dashboard/:clientId` for client-specific analytics
3. Use the time range selector to adjust the data period
4. Interact with charts and metrics for detailed insights

### Creating Custom Dashboards
1. Use the dashboard management API endpoints
2. Configure widgets and layouts
3. Set refresh intervals for real-time updates

### Generating Reports
1. Use the report generation endpoint
2. Specify report type, format, and time range
3. Include charts and tables as needed

## Components

### MetricCard
Displays individual metrics with icons, values, and trend indicators.

### LineChart
Shows trend data over time with interactive tooltips.

### BarChart
Displays categorical data with customizable colors.

### PieChart
Shows proportional data with percentage calculations.

### TimeRangeSelector
Allows users to select different time periods for analytics.

## Testing

### Backend Tests
Run the analytics service tests:
```bash
cd backend
npm test -- analyticsService.test.ts
```

### Frontend Tests
Test the dashboard components:
```bash
cd frontend
npm test
```

## Performance Considerations

### Backend Optimization
- Implement caching for frequently accessed metrics
- Use database indexing for faster queries
- Optimize aggregation queries for large datasets

### Frontend Optimization
- Implement lazy loading for chart components
- Use React.memo for expensive components
- Implement virtual scrolling for large datasets

## Security

### Authentication
- All analytics endpoints require authentication
- JWT tokens are validated for each request
- Role-based access control for sensitive data

### Data Privacy
- Client data is isolated by client ID
- Sensitive metrics are filtered appropriately
- Audit logging for data access

## Future Enhancements

### Planned Features
- Real-time WebSocket updates
- Advanced filtering and segmentation
- Machine learning insights
- Custom alert rules
- Mobile-responsive dashboards
- Export to additional formats

### Performance Improvements
- Redis caching layer
- Database query optimization
- CDN for static assets
- Progressive web app features

## Troubleshooting

### Common Issues

1. **Charts not loading**
   - Check if Recharts is properly installed
   - Verify data format matches expected structure

2. **Metrics showing zero values**
   - Ensure database has sample data
   - Check time range filters
   - Verify client ID parameters

3. **API errors**
   - Check authentication tokens
   - Verify endpoint URLs
   - Review server logs for details

### Debug Mode
Enable debug logging in the backend:
```typescript
// In analyticsService.ts
console.log('Analytics data:', data);
```

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure TypeScript types are complete
5. Test with real data scenarios

## License

This dashboard and analytics system is part of the RetellAI UI project and follows the same licensing terms.