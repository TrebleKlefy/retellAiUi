import { Request, Response } from 'express';
import { QueueService } from '../services/queueService';
import { CreateQueueItemRequest, ScheduleRequest, QueueFilters } from '../models/Queue';

export class QueueController {
  private queueService: QueueService;

  constructor() {
    this.queueService = new QueueService();
  }

  addToQueue = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const queueData: CreateQueueItemRequest = {
        ...req.body,
        clientId
      };

      const queueItem = await this.queueService.addToQueue(queueData);
      res.status(201).json({
        success: true,
        data: queueItem
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add item to queue' 
      });
    }
  };

  getQueueItems = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const filters: QueueFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
        search: req.query.search as string
      };

      const items = await this.queueService.getQueueItems(clientId, filters);
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get queue items' 
      });
    }
  };

  getQueueItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const item = await this.queueService.getQueueItem(id);
      
      if (!item) {
        return res.status(404).json({ 
          success: false,
          message: 'Queue item not found' 
        });
      }

      res.json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get queue item' 
      });
    }
  };

  processQueue = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const result = await this.queueService.processQueue(clientId);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process queue' 
      });
    }
  };

  cancelQueueItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.queueService.cancelQueueItem(id);
      res.json({ 
        success: true,
        message: 'Queue item cancelled successfully' 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel queue item' 
      });
    }
  };

  getQueueStats = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const stats = await this.queueService.getQueueStats(clientId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get queue stats' 
      });
    }
  };

  scheduleBatch = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const scheduleData: ScheduleRequest = {
        ...req.body,
        clientId
      };

      const result = await this.queueService.scheduleBatch(scheduleData);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(400).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to schedule batch' 
      });
    }
  };

  updateQueueItem = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const updatedItem = await this.queueService.updateQueueItem(id, updates);
      res.json({
        success: true,
        data: updatedItem
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update queue item' 
      });
    }
  };

  getQueueConfig = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const config = await this.queueService.getQueueConfig(clientId);
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get queue config' 
      });
    }
  };

  updateQueueConfig = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const configUpdates = req.body;
      
      const updatedConfig = await this.queueService.updateQueueConfig(clientId, configUpdates);
      res.json({
        success: true,
        data: updatedConfig
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update queue config' 
      });
    }
  };
}