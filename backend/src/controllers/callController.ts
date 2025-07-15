import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { CallService } from '../services/callService';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';

export class CallController {
  private callService: CallService;

  constructor() {
    this.callService = new CallService();
  }

  getCalls = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const outcome = req.query.outcome as string;
      const leadId = req.query.leadId as string;
      const agentId = req.query.agentId as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      const result = await this.callService.getCalls({ 
        page, 
        limit, 
        search, 
        status, 
        outcome, 
        leadId, 
        agentId, 
        dateFrom, 
        dateTo 
      });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get calls'));
      }
    }
  };

  getCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const call = await this.callService.getCallById(id);
      
      res.status(200).json(createSuccessResponse(call));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get call'));
      }
    }
  };

  createCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const callData = req.body;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.callService.createCall(callData, userId);
      
      res.status(201).json(createSuccessResponse(result, 'Call created successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to create call'));
      }
    }
  };

  updateCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await this.callService.updateCall(id, updateData);
      
      res.status(200).json(createSuccessResponse(result, 'Call updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update call'));
      }
    }
  };

  deleteCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.callService.deleteCall(id);
      
      res.status(200).json(createSuccessResponse(null, 'Call deleted successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to delete call'));
      }
    }
  };

  getCallStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.callService.getCallStats();
      
      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get call stats'));
    }
  };

  startCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.callService.startCall(id, userId);
      
      res.status(200).json(createSuccessResponse(result, 'Call started successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to start call'));
      }
    }
  };

  endCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { outcome, notes } = req.body;
      
      const result = await this.callService.endCall(id, { outcome, notes });
      
      res.status(200).json(createSuccessResponse(result, 'Call ended successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to end call'));
      }
    }
  };

  getCallRecording = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const recording = await this.callService.getCallRecording(id);
      
      res.status(200).json(createSuccessResponse(recording));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get call recording'));
      }
    }
  };

  getCallTranscript = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const transcript = await this.callService.getCallTranscript(id);
      
      res.status(200).json(createSuccessResponse(transcript));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get call transcript'));
      }
    }
  };

  handleRetellWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const webhookData = req.body;
      
      await this.callService.handleRetellWebhook(webhookData);
      
      res.status(200).json(createSuccessResponse(null, 'Webhook processed successfully'));
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json(createErrorResponse('Failed to process webhook'));
    }
  };

  createRetellCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leadId, phoneNumber, agentId } = req.body;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.callService.createRetellCall(leadId, phoneNumber, agentId, userId);
      
      res.status(200).json(createSuccessResponse(result, 'Retell call created successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to create Retell call'));
      }
    }
  };

  getScheduledCalls = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.callService.getScheduledCalls({ page, limit });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get scheduled calls'));
      }
    }
  };

  scheduleCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const callData = req.body;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.callService.scheduleCall(callData, userId);
      
      res.status(201).json(createSuccessResponse(result, 'Call scheduled successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to schedule call'));
      }
    }
  };

  updateScheduledCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await this.callService.updateScheduledCall(id, updateData);
      
      res.status(200).json(createSuccessResponse(result, 'Scheduled call updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update scheduled call'));
      }
    }
  };

  cancelScheduledCall = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.callService.cancelScheduledCall(id);
      
      res.status(200).json(createSuccessResponse(null, 'Scheduled call cancelled successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to cancel scheduled call'));
      }
    }
  };
} 