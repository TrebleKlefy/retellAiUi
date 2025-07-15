import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from '../utils/database';
import { 
  Call, 
  CreateCallRequest, 
  UpdateCallRequest, 
  CallStats, 
  CallFilters, 
  RetellWebhookPayload,
  BatchCallRequest,
  CallStatus,
  CallOutcome,
  CallPriority
} from '../models/Call';
import { Client } from '../models/Client';
import { Lead } from '../models/Lead';
import { RetellService } from './retellService';
import { ClientService } from './clientService';
import { LeadService } from './leadService';
import { config } from '../config/environment';

export class CallService {
  private readonly tableName = 'Calls';
  private retellService: RetellService;
  private clientService: ClientService;
  private leadService: LeadService;

  constructor() {
    this.retellService = new RetellService();
    this.clientService = new ClientService();
    this.leadService = new LeadService();
  }

  async createCall(callData: CreateCallRequest): Promise<Call> {
    try {
      // Get client and lead data
      const client = await this.clientService.getClient(callData.clientId);
      const lead = await this.leadService.getLead(callData.leadId);
      
      if (!client.retell?.isActive) {
        throw new CustomError('Client Retell AI is not active', 400);
      }
      
      // Check concurrency limits
      const concurrency = await this.retellService.getConcurrency(client);
      if (concurrency.currentConcurrency >= concurrency.concurrencyLimit) {
        throw new CustomError('Concurrency limit reached', 429);
      }
      
      // Create call with Retell AI
      const retellCall = await this.retellService.createCall(
        client, 
        lead, 
        callData.priority || 'normal'
      );
      
      // Create call record
      const call = await this.createCallRecord({
        callId: retellCall.callId,
        clientId: callData.clientId,
        leadId: callData.leadId,
        fromNumber: client.retell!.fromNumber,
        toNumber: lead.phone!,
        status: CallStatus.INITIATED,
        outcome: CallOutcome.FAILED, // Will be updated by webhook
        priority: callData.priority || CallPriority.NORMAL,
        scheduledAt: callData.scheduledAt || new Date(),
        attemptNumber: 1,
        maxAttempts: 3,
        duration: 0,
        transcript: '',
        sentiment: 0,
        intent: '',
        keywords: [],
        notes: '',
        followUpNotes: ''
      });
      
      return call;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Failed to create call: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  async createBatchCall(batchData: BatchCallRequest): Promise<{
    batchCallId: string;
    totalCalls: number;
    calls: Call[];
  }> {
    try {
      // Get client and leads data
      const client = await this.clientService.getClient(batchData.clientId);
      const leads = await Promise.all(
        batchData.leadIds.map(id => this.leadService.getLead(id))
      );
      
      if (!client.retell?.isActive) {
        throw new CustomError('Client Retell AI is not active', 400);
      }
      
      // Check concurrency limits
      const concurrency = await this.retellService.getConcurrency(client);
      const maxConcurrent = Math.min(
        batchData.maxConcurrent || 10,
        concurrency.concurrencyLimit - concurrency.currentConcurrency
      );
      
      if (maxConcurrent <= 0) {
        throw new CustomError('No available concurrency slots', 429);
      }
      
      // Create batch call with Retell AI
      const retellBatch = await this.retellService.createBatchCall(
        client,
        leads.slice(0, maxConcurrent),
        batchData.priority || 'normal'
      );
      
      // Create call records
      const calls = await Promise.all(
        leads.slice(0, maxConcurrent).map(lead =>
          this.createCallRecord({
            callId: `${retellBatch.batchCallId}_${lead.id}`,
            clientId: batchData.clientId,
            leadId: lead.id,
            fromNumber: client.retell!.fromNumber,
            toNumber: lead.phone!,
            status: CallStatus.SCHEDULED,
            outcome: CallOutcome.FAILED, // Will be updated by webhook
            priority: batchData.priority || CallPriority.NORMAL,
            scheduledAt: batchData.scheduledAt || new Date(),
            attemptNumber: 1,
            maxAttempts: 3,
            duration: 0,
            transcript: '',
            sentiment: 0,
            intent: '',
            keywords: [],
            notes: '',
            followUpNotes: ''
          })
        )
      );
      
      return {
        batchCallId: retellBatch.batchCallId,
        totalCalls: calls.length,
        calls
      };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(`Failed to create batch call: ${error instanceof Error ? error.message : 'Unknown error'}`, 500);
    }
  }

  async getCalls(clientId: string, filters?: CallFilters): Promise<Call[]> {
    try {
      const { search, status, outcome, priority, dateFrom, dateTo } = filters || {};
      const offset = 0;
      const limit = 100; // Default limit

      let filterFormula = '';
      const conditions = [`{ClientId} = '${clientId}'`];

      if (search) {
        conditions.push(`OR(SEARCH('${search}', {ToNumber}) > 0, SEARCH('${search}', {Notes}) > 0)`);
      }

      if (status) {
        conditions.push(`{Status} = '${status}'`);
      }

      if (outcome) {
        conditions.push(`{Outcome} = '${outcome}'`);
      }

      if (priority) {
        conditions.push(`{Priority} = '${priority}'`);
      }

      if (dateFrom || dateTo) {
        let dateCondition = '';
        if (dateFrom && dateTo) {
          dateCondition = `AND({CreatedAt} >= '${dateFrom}', {CreatedAt} <= '${dateTo}')`;
        } else if (dateFrom) {
          dateCondition = `{CreatedAt} >= '${dateFrom}'`;
        } else if (dateTo) {
          dateCondition = `{CreatedAt} <= '${dateTo}'`;
        }
        conditions.push(dateCondition);
      }

      if (conditions.length > 0) {
        filterFormula = `AND(${conditions.join(', ')})`;
      }

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: filterFormula,
        maxRecords: limit,
        offset: offset
      });

      return records;
    } catch (error) {
      throw new CustomError('Failed to get calls', 500);
    }
  }

  async getCall(callId: string): Promise<Call> {
    try {
      const call = await AirtableService.getRecord(this.tableName, callId);
      
      if (!call) {
        throw new CustomError('Call not found', 404);
      }

      return call;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get call', 500);
    }
  }

  async cancelCall(callId: string): Promise<void> {
    try {
      // Get call and client data
      const call = await this.getCall(callId);
      const client = await this.clientService.getClient(call.clientId);
      
      // Cancel call with Retell AI
      await this.retellService.cancelCall(call.callId, client);
      
      // Update call status
      await this.updateCall(callId, { status: CallStatus.CANCELLED });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to cancel call', 500);
    }
  }

  async getCallStats(clientId: string): Promise<CallStats> {
    try {
      const calls = await this.getCalls(clientId);
      
      const totalCalls = calls.length;
      const successfulCalls = calls.filter(call => 
        call.outcome === CallOutcome.SUCCESSFUL || 
        call.outcome === CallOutcome.APPOINTMENT_SCHEDULED || 
        call.outcome === CallOutcome.QUALIFIED_LEAD
      ).length;
      const failedCalls = calls.filter(call => call.outcome === CallOutcome.FAILED).length;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
      const averageDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;

      // Group by status
      const callsByStatus = Object.values(CallStatus).reduce((acc, status) => {
        acc[status] = calls.filter(call => call.status === status).length;
        return acc;
      }, {} as Record<CallStatus, number>);

      // Group by outcome
      const callsByOutcome = Object.values(CallOutcome).reduce((acc, outcome) => {
        acc[outcome] = calls.filter(call => call.outcome === outcome).length;
        return acc;
      }, {} as Record<CallOutcome, number>);

      // Group by priority
      const callsByPriority = Object.values(CallPriority).reduce((acc, priority) => {
        acc[priority] = calls.filter(call => call.priority === priority).length;
        return acc;
      }, {} as Record<CallPriority, number>);

      return {
        totalCalls,
        successfulCalls,
        failedCalls,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration,
        totalDuration,
        callsByStatus,
        callsByOutcome,
        callsByPriority
      };
    } catch (error) {
      throw new CustomError('Failed to get call stats', 500);
    }
  }

  async processCallEnded(callData: any): Promise<void> {
    try {
      // Find call record
      const call = await this.findCallByRetellId(callData.call_id);
      if (!call) {
        console.warn(`Call not found for Retell ID: ${callData.call_id}`);
        return;
      }
      
      // Update call with results
      const updates: Partial<Call> = {
        status: CallStatus.COMPLETED,
        duration: callData.call_length || 0,
        transcript: callData.transcript || '',
        endedAt: new Date()
      };
      
      // Determine outcome
      const outcome = this.determineCallOutcome(callData);
      updates.outcome = outcome;
      
      // Update call record
      await this.updateCall(call.id, updates);
      
      // Update lead status if needed
      if (outcome === CallOutcome.APPOINTMENT_SCHEDULED || outcome === CallOutcome.QUALIFIED_LEAD) {
        await this.leadService.updateLead(call.leadId, {
          status: outcome === CallOutcome.APPOINTMENT_SCHEDULED ? 'appointment_scheduled' : 'qualified'
        });
      }
    } catch (error) {
      console.error('Error processing call ended:', error);
      throw error;
    }
  }

  async processCallAnalysis(callData: any): Promise<void> {
    try {
      // Find call record
      const call = await this.findCallByRetellId(callData.call_id);
      if (!call) {
        console.warn(`Call not found for Retell ID: ${callData.call_id}`);
        return;
      }
      
      // Update call with analysis
      const updates: Partial<Call> = {
        sentiment: callData.analysis_data?.sentiment || 0,
        intent: callData.analysis_data?.intent || '',
        keywords: callData.analysis_data?.keywords || [],
        notes: callData.analysis_data?.summary || ''
      };
      
      await this.updateCall(call.id, updates);
    } catch (error) {
      console.error('Error processing call analysis:', error);
      throw error;
    }
  }

  async processCallFailed(callData: any): Promise<void> {
    try {
      // Find call record
      const call = await this.findCallByRetellId(callData.call_id);
      if (!call) {
        console.warn(`Call not found for Retell ID: ${callData.call_id}`);
        return;
      }
      
      // Update call status
      await this.updateCall(call.id, {
        status: CallStatus.FAILED,
        outcome: CallOutcome.FAILED,
        endedAt: new Date()
      });
    } catch (error) {
      console.error('Error processing call failed:', error);
      throw error;
    }
  }

  private determineCallOutcome(callData: any): CallOutcome {
    const transcript = callData.transcript?.toLowerCase() || '';
    const duration = callData.call_length || 0;
    
    // No answer detection
    if (duration < 30) return CallOutcome.NO_ANSWER;
    
    // Voicemail detection
    if (transcript.includes('voicemail') || transcript.includes('leave a message')) {
      return CallOutcome.VOICEMAIL;
    }
    
    // Success indicators
    if (transcript.includes('appointment') || transcript.includes('schedule')) {
      return CallOutcome.APPOINTMENT_SCHEDULED;
    }
    
    if (transcript.includes('not interested') || transcript.includes('don\'t call')) {
      return CallOutcome.NOT_INTERESTED;
    }
    
    if (transcript.includes('wrong number') || transcript.includes('not here')) {
      return CallOutcome.WRONG_NUMBER;
    }
    
    if (transcript.includes('do not call') || transcript.includes('stop calling')) {
      return CallOutcome.DO_NOT_CALL;
    }
    
    // Default to connected if we have substantial conversation
    return duration > 60 ? CallOutcome.SUCCESSFUL : CallOutcome.FAILED;
  }

  private async createCallRecord(callData: Partial<Call>): Promise<Call> {
    try {
      const newCall = await AirtableService.createRecord(this.tableName, {
        ...callData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newCall;
    } catch (error) {
      throw new CustomError('Failed to create call record', 500);
    }
  }

  private async updateCall(callId: string, updates: Partial<Call>): Promise<void> {
    try {
      await AirtableService.updateRecord(this.tableName, callId, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw new CustomError('Failed to update call', 500);
    }
  }

  private async findCallByRetellId(retellCallId: string): Promise<Call | null> {
    try {
      const calls = await AirtableService.getRecords(this.tableName, {
        filterByFormula: `{CallId} = '${retellCallId}'`,
        maxRecords: 1
      });

      return calls.length > 0 ? calls[0] : null;
    } catch (error) {
      console.error('Error finding call by Retell ID:', error);
      return null;
    }
  }
} 