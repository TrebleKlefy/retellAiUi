import { Request, Response } from 'express';
import { CallService } from '../services/callService';
import { CustomError } from '../middleware/errorHandler';
import { CreateCallRequest, BatchCallRequest, CallFilters } from '../models/Call';

export class CallController {
  private callService: CallService;

  constructor() {
    this.callService = new CallService();
  }

  createCall = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const callData: CreateCallRequest = {
        ...req.body,
        clientId
      };
      
      const call = await this.callService.createCall(callData);
      res.status(201).json({
        success: true,
        data: call
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  };

  createBatchCall = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const batchData: BatchCallRequest = {
        ...req.body,
        clientId
      };
      
      const result = await this.callService.createBatchCall(batchData);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  };

  getCalls = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const filters: CallFilters = {
        search: req.query.search as string,
        status: req.query.status as any,
        outcome: req.query.outcome as any,
        priority: req.query.priority as any,
        dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
        dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined
      };
      
      const calls = await this.callService.getCalls(clientId, filters);
      res.json({
        success: true,
        data: calls
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  };

  getCall = async (req: Request, res: Response) => {
    try {
      const call = await this.callService.getCall(req.params.id);
      res.json({
        success: true,
        data: call
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  };

  cancelCall = async (req: Request, res: Response) => {
    try {
      await this.callService.cancelCall(req.params.id);
      res.json({ 
        success: true, 
        message: 'Call cancelled successfully' 
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  };

  getCallStats = async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const stats = await this.callService.getCallStats(clientId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ 
          success: false, 
          message: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }
    }
  };

  // Webhook handler for Retell AI callbacks
  handleWebhook = async (req: Request, res: Response) => {
    try {
      const { event_type, call } = req.body;
      
      switch (event_type) {
        case 'call_ended':
          await this.callService.processCallEnded(call);
          break;
        case 'call_analyzed':
          await this.callService.processCallAnalysis(call);
          break;
        case 'call_failed':
          await this.callService.processCallFailed(call);
          break;
        case 'call_connected':
          // Handle call connected event
          break;
        case 'call_ringing':
          // Handle call ringing event
          break;
        default:
          console.log(`Unhandled Retell event: ${event_type}`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  };
} 