import cron from 'node-cron';
import { QueueService } from './queueService';
import { ClientService } from './clientService';

export class CronService {
  private queueService: QueueService;
  private clientService: ClientService;
  private isRunning: boolean = false;

  constructor() {
    this.queueService = new QueueService();
    this.clientService = new ClientService();
  }

  startQueueProcessing(): void {
    if (this.isRunning) {
      console.log('Queue processing is already running');
      return;
    }

    // Process queues every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.processAllQueues();
      } catch (error) {
        console.error('Queue processing error:', error);
      }
    });

    this.isRunning = true;
    console.log('Queue processing started - running every 5 minutes');
  }

  stopQueueProcessing(): void {
    if (!this.isRunning) {
      console.log('Queue processing is not running');
      return;
    }

    // Stop all cron jobs
    cron.getTasks().forEach(task => task.stop());
    
    this.isRunning = false;
    console.log('Queue processing stopped');
  }

  private async processAllQueues(): Promise<void> {
    try {
      // Get all active clients
      const clients = await this.clientService.getClients();
      
      console.log(`Processing queues for ${clients.length} clients`);
      
      // Process queue for each client
      for (const client of clients) {
        if (client.status === 'active') {
          try {
            const result = await this.queueService.processQueue(client.id);
            if (result.processed > 0) {
              console.log(`Client ${client.id}: Processed ${result.processed} items (${result.successful} successful, ${result.failed} failed)`);
            }
          } catch (error) {
            console.error(`Error processing queue for client ${client.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in processAllQueues:', error);
    }
  }

  // Manual queue processing for testing
  async processQueueForClient(clientId: string): Promise<void> {
    try {
      const result = await this.queueService.processQueue(clientId);
      console.log(`Manual queue processing for client ${clientId}:`, result);
    } catch (error) {
      console.error(`Manual queue processing error for client ${clientId}:`, error);
      throw error;
    }
  }

  getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}