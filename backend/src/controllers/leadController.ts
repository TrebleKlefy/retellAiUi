import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { LeadService } from '../services/leadService';
import { createSuccessResponse, createErrorResponse } from '../utils/helpers';

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const source = req.query.source as string;
      const assignedTo = req.query.assignedTo as string;
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;

      const result = await this.leadService.getLeads({ 
        page, 
        limit, 
        search, 
        status, 
        source, 
        assignedTo, 
        dateFrom, 
        dateTo 
      });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get leads'));
      }
    }
  };

  getLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const lead = await this.leadService.getLeadById(id);
      
      res.status(200).json(createSuccessResponse(lead));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get lead'));
      }
    }
  };

  createLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadData = req.body;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.leadService.createLead(leadData, userId);
      
      res.status(201).json(createSuccessResponse(result, 'Lead created successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to create lead'));
      }
    }
  };

  updateLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await this.leadService.updateLead(id, updateData);
      
      res.status(200).json(createSuccessResponse(result, 'Lead updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update lead'));
      }
    }
  };

  deleteLead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.leadService.deleteLead(id);
      
      res.status(200).json(createSuccessResponse(null, 'Lead deleted successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to delete lead'));
      }
    }
  };

  getLeadStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.leadService.getLeadStats();
      
      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      res.status(500).json(createErrorResponse('Failed to get lead stats'));
    }
  };

  getLeadCalls = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.leadService.getLeadCalls(id, { page, limit });
      
      res.status(200).json(createSuccessResponse(result));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get lead calls'));
      }
    }
  };

  convertToClient = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const clientData = req.body;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.leadService.convertToClient(id, clientData, userId);
      
      res.status(200).json(createSuccessResponse(result, 'Lead converted to client successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to convert lead to client'));
      }
    }
  };

  updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await this.leadService.updateLeadStatus(id, status);
      
      res.status(200).json(createSuccessResponse(result, 'Lead status updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update lead status'));
      }
    }
  };

  bulkImport = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadsData = req.body.leads;
      const userId = (req as AuthRequest).user?.id;
      
      const result = await this.leadService.bulkImport(leadsData, userId);
      
      res.status(200).json(createSuccessResponse(result, 'Leads imported successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to import leads'));
      }
    }
  };

  bulkUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { leadIds, updateData } = req.body;
      
      const result = await this.leadService.bulkUpdate(leadIds, updateData);
      
      res.status(200).json(createSuccessResponse(result, 'Leads updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update leads'));
      }
    }
  };
} 