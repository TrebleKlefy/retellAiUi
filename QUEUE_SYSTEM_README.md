# Priority Queue & Scheduling System

## Overview

The Priority Queue & Scheduling System is a sophisticated call management solution that handles lead prioritization, business hours management, timezone support, and intelligent retry logic for the RetellAI UI application.

## Features

### 🎯 Priority Queue Management
- **Multi-level Priority System**: Urgent, High, Normal, and Low priority levels
- **Priority-based Scheduling**: Calls are scheduled based on priority and business hours
- **Queue Analytics**: Comprehensive statistics and performance metrics
- **Queue Controls**: Pause, resume, and manual processing capabilities

### ⏰ Smart Scheduling
- **Business Hours Management**: Configurable business hours per client
- **Timezone Support**: Full timezone awareness for global operations
- **Day-of-Week Filtering**: Support for different active days
- **Dynamic Scheduling**: Intelligent call time optimization
- **Retry Logic**: Configurable retry delays with exponential backoff

### 📊 Queue Monitoring
- **Real-time Statistics**: Live queue performance metrics
- **Status Tracking**: Complete visibility into queue item states
- **Performance Analytics**: Success rates, wait times, and throughput
- **Queue Optimization**: Load balancing and concurrent processing

## Architecture

### Backend Components

#### Models (`backend/src/models/Queue.ts`)
```typescript
// Core queue interfaces
interface QueueItem {
  id: string;
  clientId: string;
  leadId: string;
  priority: QueuePriority;
  scheduledAt: Date;
  retryCount: number;
  maxRetries: number;
  status: QueueStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Priority levels
enum QueuePriority {
  URGENT = 'urgent',    // Hot leads, immediate calling
  HIGH = 'high',        // Priority clients, business hours
  NORMAL = 'normal',    // Regular batch dialing
  LOW = 'low'           // Low priority, off-hours
}

// Queue statuses
enum QueueStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRY_SCHEDULED = 'retry_scheduled'
}
```

#### Services

**QueueService** (`backend/src/services/queueService.ts`)
- Manages queue operations (add, remove, process)
- Handles priority-based scheduling
- Implements retry logic
- Provides queue statistics

**SchedulerService** (`backend/src/services/schedulerService.ts`)
- Business hours validation
- Timezone-aware scheduling
- Optimal call time calculation
- Holiday and day-of-week filtering

**CronService** (`backend/src/services/cronService.ts`)
- Automatic queue processing every 5 minutes
- Background job management
- Error handling and logging

#### Controllers & Routes

**QueueController** (`backend/src/controllers/queueController.ts`)
- RESTful API endpoints for queue management
- Request validation and error handling
- Response formatting

**Queue Routes** (`backend/src/routes/queue.ts`)
```typescript
// Queue management endpoints
POST   /api/clients/:clientId/queue           // Add item to queue
GET    /api/clients/:clientId/queue           // Get queue items
POST   /api/clients/:clientId/queue/process   // Process queue
DELETE /api/queue/:id                         // Cancel queue item
GET    /api/clients/:clientId/queue/stats     // Get queue statistics
POST   /api/clients/:clientId/queue/schedule-batch // Schedule batch
```

### Frontend Components

#### Pages
- **QueueManagement** (`frontend/src/pages/QueueManagement.tsx`): Client selection interface
- **Queue** (`frontend/src/pages/Queue.tsx`): Individual client queue management

#### Components
- **QueueTable** (`frontend/src/components/QueueTable.tsx`): Queue items display
- **QueueStats** (`frontend/src/components/QueueStats.tsx`): Statistics dashboard
- **QueueControls** (`frontend/src/components/QueueControls.tsx`): Action buttons
- **QueueFilters** (`frontend/src/components/QueueFilters.tsx`): Filtering interface

#### Services
- **QueueService** (`frontend/src/services/queueService.ts`): API communication
- **Types** (`frontend/src/types/queue.ts`): TypeScript definitions

## API Endpoints

### Queue Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/clients/:clientId/queue` | Add item to queue |
| GET | `/api/clients/:clientId/queue` | Get queue items with filters |
| GET | `/api/queue/:id` | Get specific queue item |
| PUT | `/api/queue/:id` | Update queue item |
| POST | `/api/clients/:clientId/queue/process` | Process queue |
| DELETE | `/api/queue/:id` | Cancel queue item |
| GET | `/api/clients/:clientId/queue/stats` | Get queue statistics |
| POST | `/api/clients/:clientId/queue/schedule-batch` | Schedule batch of leads |

### Queue Configuration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients/:clientId/queue/config` | Get queue configuration |
| PUT | `/api/clients/:clientId/queue/config` | Update queue configuration |

## Configuration

### Default Queue Configuration
```typescript
{
  maxConcurrent: 5,                    // Maximum concurrent calls
  retryDelays: [5, 15, 30, 60],       // Minutes between retries
  businessHours: {
    start: '09:00',                    // Business hours start
    end: '17:00',                      // Business hours end
    priorityHours: [9, 10, 11, 14, 15, 16], // Optimal calling hours
    timezone: 'America/New_York'       // Client timezone
  },
  timezone: 'America/New_York',        // Default timezone
  activeDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Active days
  priorityWeights: {                   // Priority weights
    urgent: 100,
    high: 75,
    normal: 50,
    low: 25
  }
}
```

## Usage Examples

### Adding Items to Queue
```typescript
// Single item
const queueItem = await queueService.addToQueue({
  clientId: 'client123',
  leadId: 'lead456',
  priority: QueuePriority.HIGH,
  scheduledAt: new Date('2024-01-15T10:00:00Z'),
  maxRetries: 3
});

// Batch scheduling
const result = await queueService.scheduleBatch({
  clientId: 'client123',
  leadIds: ['lead1', 'lead2', 'lead3'],
  priority: QueuePriority.NORMAL,
  batchSize: 10
});
```

### Processing Queue
```typescript
// Manual processing
const result = await queueService.processQueue('client123');
console.log(`Processed: ${result.processed}, Success: ${result.successful}, Failed: ${result.failed}`);

// Automatic processing (via cron job)
// Runs every 5 minutes automatically
```

### Getting Queue Statistics
```typescript
const stats = await queueService.getQueueStats('client123');
console.log(`Total items: ${stats.totalItems}`);
console.log(`Pending: ${stats.pendingItems}`);
console.log(`Success rate: ${(stats.completedItems / stats.totalItems * 100).toFixed(1)}%`);
```

## Business Logic

### Priority Scheduling Algorithm
1. **Urgent Priority**: Scheduled immediately if within business hours
2. **High Priority**: Scheduled during optimal business hours
3. **Normal Priority**: Scheduled during regular business hours
4. **Low Priority**: Scheduled during off-hours or low-traffic periods

### Retry Logic
- Configurable retry delays: [5, 15, 30, 60] minutes
- Exponential backoff for failed attempts
- Maximum retry limit per item
- Automatic status updates

### Business Hours Validation
- Timezone-aware business hours checking
- Day-of-week filtering
- Holiday calendar support (extensible)
- Priority hour optimization

## Monitoring & Analytics

### Queue Statistics
- Total items in queue
- Items by status (pending, in-progress, completed, failed)
- Items by priority breakdown
- Average wait times
- Success rates and failure analysis

### Performance Metrics
- Processing throughput
- Queue processing time
- Retry success rates
- Business hours utilization

## Error Handling

### Queue Processing Errors
- Network failures
- Call service errors
- Invalid lead data
- Business hours violations

### Retry Strategy
- Automatic retry scheduling
- Error logging and tracking
- Failure reason recording
- Manual retry options

## Security

### Authentication
- All queue endpoints require authentication
- JWT token validation
- Role-based access control

### Data Validation
- Input sanitization
- Type checking
- Business rule validation
- Rate limiting

## Dependencies

### Backend
```json
{
  "node-cron": "^3.0.3",        // Cron job scheduling
  "uuid": "^9.0.0",             // Unique ID generation
  "moment-timezone": "^0.5.43"  // Timezone handling
}
```

### Frontend
```json
{
  "react-router-dom": "^6.8.0", // Routing
  "axios": "^1.6.0"             // HTTP client
}
```

## Testing

### Backend Testing
- Queue item creation tests
- Queue processing tests
- Scheduling algorithm tests
- Business hours validation tests
- Retry logic tests

### Frontend Testing
- Queue management interface tests
- Queue item creation tests
- Queue processing tests
- Queue statistics tests
- Queue controls tests

## Deployment

### Environment Variables
```bash
# Queue Configuration
QUEUE_MAX_CONCURRENT=5
QUEUE_RETRY_DELAYS="5,15,30,60"
QUEUE_DEFAULT_TIMEZONE="America/New_York"
QUEUE_BUSINESS_HOURS_START="09:00"
QUEUE_BUSINESS_HOURS_END="17:00"
```

### Cron Job Configuration
- Automatic queue processing every 5 minutes
- Configurable via environment variables
- Graceful shutdown handling
- Error logging and monitoring

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Machine learning for optimal scheduling
- **Multi-tenant Support**: Enhanced client isolation
- **Webhook Integration**: Real-time notifications
- **Mobile App**: Queue management on mobile devices
- **API Rate Limiting**: Enhanced API protection
- **Queue Optimization**: AI-powered queue balancing

### Scalability Improvements
- **Database Integration**: Replace in-memory storage
- **Redis Caching**: Performance optimization
- **Microservices**: Service decomposition
- **Load Balancing**: Horizontal scaling
- **Monitoring**: Advanced metrics and alerting

## Support

For questions or issues with the Priority Queue & Scheduling System:

1. Check the API documentation
2. Review the error logs
3. Test with the provided examples
4. Contact the development team

## License

This Priority Queue & Scheduling System is part of the RetellAI UI project and follows the same licensing terms.