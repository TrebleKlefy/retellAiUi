import { Request, Response } from 'express';
import { CustomError } from '../middleware/errorHandler';
import { ClientService } from '../services/clientService';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';

export class ClientController {
  private clientService: ClientService;

  constructor() {
    this.clientService = new ClientService();
  }

  getClients = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clients = await this.clientService.getClients();
      
      res.status(200).json(createSuccessResponse(clients));
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
      
      const client = await this.clientService.getClient(id);
      
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
      
      const result = await this.clientService.createClient(clientData);
      
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

  testIntegrations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const results = await this.clientService.testIntegrations(id);
      
      res.status(200).json(createSuccessResponse(results));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to test integrations'));
      }
    }
  };

  getClientStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const stats = await this.clientService.getClientStats(id);
      
      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get client stats'));
      }
    }
  };
} 