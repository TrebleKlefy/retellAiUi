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

  getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        status: req.query.status as string,
        priority: req.query.priority as string,
        source: req.query.source as string,
        assignedTo: req.query.assignedTo as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        scoreMin: req.query.scoreMin ? parseInt(req.query.scoreMin as string) : undefined,
        scoreMax: req.query.scoreMax ? parseInt(req.query.scoreMax as string) : undefined
      };

      const leads = await this.leadService.getLeads(clientId, filters);
      
      res.status(200).json(createSuccessResponse(leads));
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
      
      const lead = await this.leadService.getLead(id);
      
      res.status(200).json(createSuccessResponse(lead));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get lead'));
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
      const { clientId } = req.params;
      const stats = await this.leadService.getLeadStats(clientId);
      
      res.status(200).json(createSuccessResponse(stats));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get lead stats'));
      }
    }
  };

  importLeads = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const importRequest = {
        clientId,
        file: req.file,
        airtableSync: req.body.airtableSync === 'true',
        googleSheetsSync: req.body.googleSheetsSync === 'true',
        mapping: JSON.parse(req.body.mapping || '{}')
      };

      const result = await this.leadService.importLeads(importRequest);
      
      res.status(200).json(createSuccessResponse(result, 'Leads imported successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to import leads'));
      }
    }
  };

  syncFromAirtable = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const result = await this.leadService.syncFromAirtable(clientId);
      
      res.status(200).json(createSuccessResponse(result, 'Airtable sync completed'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to sync from Airtable'));
      }
    }
  };

  syncFromGoogleSheets = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const result = await this.leadService.syncFromGoogleSheets(clientId);
      
      res.status(200).json(createSuccessResponse(result, 'Google Sheets sync completed'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to sync from Google Sheets'));
      }
    }
  };

  getImportProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const progress = await this.leadService.getImportProgress(sessionId);
      
      res.status(200).json(createSuccessResponse(progress));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to get import progress'));
      }
    }
  };

  updateLeadStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const result = await this.leadService.updateLead(id, { status });
      
      res.status(200).json(createSuccessResponse(result, 'Lead status updated successfully'));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to update lead status'));
      }
    }
  };

  calculateLeadScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const leadData = req.body;
      const score = await this.leadService.calculateLeadScore(leadData);
      
      res.status(200).json(createSuccessResponse({ score }));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to calculate lead score'));
      }
    }
  };

  detectDuplicates = async (req: Request, res: Response): Promise<void> => {
    try {
      const { clientId } = req.params;
      const leadData = req.body;
      const duplicates = await this.leadService.detectDuplicates(leadData, clientId);
      
      res.status(200).json(createSuccessResponse({ duplicates }));
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      } else {
        res.status(500).json(createErrorResponse('Failed to detect duplicates'));
      }
    }
  };
} 