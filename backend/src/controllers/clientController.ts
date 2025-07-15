import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { ClientService } from '../services/clientService';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  getClients = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const assignedTo = req.query.assignedTo as string;

      const result = await this.clientService.getClients({ page, limit, search, status, assignedTo });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get clients'));
      }
    }
  };

  getClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const client = await this.clientService.getClientById(id);
      
      res.status(200).json(createSuccessResponse(client));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get client'));
      }
    }
  };

  createClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const clientData = req.body;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.clientService.createClient(clientData, userId);
      
      res.status(201).json(createSuccessResponse(result, 'Client created successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to create client'));
      }
    }
  };

  updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await this.clientService.updateClient(id, updateData);
      
      res.status(200).json(createSuccessResponse(result, 'Client updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update client'));
      }
    }
  };

  deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.clientService.deleteClient(id);
      
      res.status(200).json(createSuccessResponse(null, 'Client deleted successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to delete client'));
      }
    }
  };

  getClientStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.clientService.getClientStats();
      
      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get client stats'));
    }
  };

  getClientLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.clientService.getClientLeads(id, { page, limit });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get client leads'));
      }
    }
  };

  getClientCalls = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.clientService.getClientCalls(id, { page, limit });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get client calls'));
      }
    }
  };
} 