import { CustomError } from '../middleware/errorHandler';
import { AirtableService } from '../utils/database';
import { Call, CreateCallRequest, UpdateCallRequest, CallStats, CallFilters, RetellWebhookPayload } from '../models/Call';
import { config } from '../config/environment';
import axios from 'axios';

export class CallService {
  private readonly tableName = 'Calls';

  async getCalls(options: CallFilters & { page: number; limit: number }) {
    try {
      const { page, limit, search, status, outcome, leadId, agentId, dateFrom, dateTo } = options;
      const offset = (page - 1) * limit;

      let filterFormula = '';
      const conditions = [];

      if (search) {
        conditions.push(`OR(SEARCH('${search}', {PhoneNumber}) > 0, SEARCH('${search}', {Notes}) > 0)`);
      }

      if (status) {
        conditions.push(`{Status} = '${status}'`);
      }

      if (outcome) {
        conditions.push(`{Outcome} = '${outcome}'`);
      }

      if (leadId) {
        conditions.push(`{LeadId} = '${leadId}'`);
      }

      if (agentId) {
        conditions.push(`{AgentId} = '${agentId}'`);
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

      return {
        data: records,
        pagination: {
          page,
          limit,
          total: records.length,
          totalPages: Math.ceil(records.length / limit)
        }
      };
    } catch (error) {
      throw new CustomError('Failed to get calls', 500);
    }
  }

  async getCallById(callId: string): Promise<Call> {
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

  async createCall(callData: CreateCallRequest, userId?: string): Promise<Call> {
    try {
      const newCall = await AirtableService.createRecord(this.tableName, {
        ...callData,
        agentId: userId || 'system',
        status: 'initiated',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newCall;
    } catch (error) {
      throw new CustomError('Failed to create call', 500);
    }
  }

  async updateCall(callId: string, updateData: UpdateCallRequest): Promise<Call> {
    try {
      const existingCall = await AirtableService.getRecord(this.tableName, callId);
      
      if (!existingCall) {
        throw new CustomError('Call not found', 404);
      }

      const updatedCall = await AirtableService.updateRecord(this.tableName, callId, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });

      return updatedCall;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update call', 500);
    }
  }

  async deleteCall(callId: string): Promise<void> {
    try {
      const existingCall = await AirtableService.getRecord(this.tableName, callId);
      
      if (!existingCall) {
        throw new CustomError('Call not found', 404);
      }

      await AirtableService.deleteRecord(this.tableName, callId);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to delete call', 500);
    }
  }

  async getCallStats(): Promise<CallStats> {
    try {
      const allCalls = await AirtableService.getRecords(this.tableName);
      
      const totalDuration = allCalls.reduce((sum, call) => sum + (call.duration || 0), 0);
      const successfulCalls = allCalls.filter(call => call.outcome === 'successful').length;
      const successRate = allCalls.length > 0 ? (successfulCalls / allCalls.length) * 100 : 0;

      const stats: CallStats = {
        total: allCalls.length,
        successful: successfulCalls,
        noAnswer: allCalls.filter(call => call.outcome === 'no-answer').length,
        voicemail: allCalls.filter(call => call.outcome === 'voicemail').length,
        busy: allCalls.filter(call => call.outcome === 'busy').length,
        wrongNumber: allCalls.filter(call => call.outcome === 'wrong-number').length,
        failed: allCalls.filter(call => call.outcome === 'failed').length,
        totalDuration,
        averageDuration: allCalls.length > 0 ? Math.round(totalDuration / allCalls.length) : 0,
        successRate: Math.round(successRate * 100) / 100
      };

      return stats;
    } catch (error) {
      throw new CustomError('Failed to get call stats', 500);
    }
  }

  async startCall(callId: string, userId: string): Promise<Call> {
    try {
      const call = await this.getCallById(callId);
      
      if (!call) {
        throw new CustomError('Call not found', 404);
      }

      // Update call status to ringing
      const updatedCall = await this.updateCall(callId, {
        status: 'ringing',
        startedAt: new Date().toISOString()
      });

      return updatedCall;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to start call', 500);
    }
  }

  async endCall(callId: string, data: { outcome: string; notes?: string }): Promise<Call> {
    try {
      const call = await this.getCallById(callId);
      
      if (!call) {
        throw new CustomError('Call not found', 404);
      }

      // Calculate duration if call was started
      let duration = call.duration;
      if (call.startedAt) {
        const startTime = new Date(call.startedAt);
        const endTime = new Date();
        duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      }

      const updatedCall = await this.updateCall(callId, {
        status: 'completed',
        outcome: data.outcome,
        notes: data.notes,
        duration,
        endedAt: new Date().toISOString()
      });

      return updatedCall;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to end call', 500);
    }
  }

  async getCallRecording(callId: string) {
    try {
      const call = await this.getCallById(callId);
      
      if (!call.recordingUrl) {
        throw new CustomError('No recording available for this call', 404);
      }

      return { recordingUrl: call.recordingUrl };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get call recording', 500);
    }
  }

  async getCallTranscript(callId: string) {
    try {
      const call = await this.getCallById(callId);
      
      if (!call.transcript) {
        throw new CustomError('No transcript available for this call', 404);
      }

      return { transcript: call.transcript };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to get call transcript', 500);
    }
  }

  async handleRetellWebhook(webhookData: RetellWebhookPayload): Promise<void> {
    try {
      const { event, data } = webhookData;
      
      // Find call by Retell call ID
      const calls = await AirtableService.getRecords(this.tableName, {
        filterByFormula: `{CallId} = '${data.call_id}'`,
        maxRecords: 1
      });

      if (calls.length === 0) {
        console.warn(`Call not found for Retell call ID: ${data.call_id}`);
        return;
      }

      const call = calls[0];

      // Update call based on event
      switch (event) {
        case 'call.answered':
          await this.updateCall(call.id, {
            status: 'answered',
            startedAt: new Date().toISOString()
          });
          break;
        
        case 'call.ended':
          await this.updateCall(call.id, {
            status: 'completed',
            duration: data.duration,
            recordingUrl: data.recording_url,
            transcript: data.transcript,
            endedAt: new Date().toISOString()
          });
          break;
        
        case 'call.failed':
          await this.updateCall(call.id, {
            status: 'failed',
            outcome: 'failed',
            endedAt: new Date().toISOString()
          });
          break;
        
        default:
          console.log(`Unhandled Retell event: ${event}`);
      }
    } catch (error) {
      console.error('Error handling Retell webhook:', error);
      throw new CustomError('Failed to process webhook', 500);
    }
  }

  async createRetellCall(leadId: string, phoneNumber: string, agentId: string, userId: string) {
    try {
      if (!config.retell.apiKey) {
        throw new CustomError('Retell API key not configured', 500);
      }

      // Create call record first
      const call = await this.createCall({
        leadId,
        phoneNumber,
        scheduledAt: new Date().toISOString()
      }, userId);

      // Make API call to Retell
      const response = await axios.post('https://api.retellai.com/create-call', {
        agent_id: agentId,
        phone_number: phoneNumber,
        metadata: {
          call_id: call.id,
          lead_id: leadId
        }
      }, {
        headers: {
          'Authorization': `Bearer ${config.retell.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      // Update call with Retell call ID
      const updatedCall = await this.updateCall(call.id, {
        callId: response.data.call_id,
        status: 'initiated'
      });

      return updatedCall;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to create Retell call', 500);
    }
  }

  async getScheduledCalls(options: { page: number; limit: number }) {
    try {
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      const records = await AirtableService.getRecords(this.tableName, {
        filterByFormula: `{Status} = 'scheduled'`,
        maxRecords: limit,
        offset: offset
      });

      return {
        data: records,
        pagination: {
          page,
          limit,
          total: records.length,
          totalPages: Math.ceil(records.length / limit)
        }
      };
    } catch (error) {
      throw new CustomError('Failed to get scheduled calls', 500);
    }
  }

  async scheduleCall(callData: CreateCallRequest, userId: string): Promise<Call> {
    try {
      const newCall = await AirtableService.createRecord(this.tableName, {
        ...callData,
        agentId: userId,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return newCall;
    } catch (error) {
      throw new CustomError('Failed to schedule call', 500);
    }
  }

  async updateScheduledCall(callId: string, updateData: UpdateCallRequest): Promise<Call> {
    try {
      return await this.updateCall(callId, updateData);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to update scheduled call', 500);
    }
  }

  async cancelScheduledCall(callId: string): Promise<void> {
    try {
      await this.updateCall(callId, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Failed to cancel scheduled call', 500);
    }
  }
} 