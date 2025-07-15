import axios from 'axios';
import { Call, CreateCallRequest, BatchCallRequest } from '../models/Call';
import { Client } from '../models/Client';
import { CustomError } from '../middleware/errorHandler';

export class RetellService {
  private baseUrl = 'https://api.retellai.com/v2';

  async createCall(client: Client, lead: any, priority: string = 'normal'): Promise<{
    callId: string;
    status: string;
  }> {
    if (!client.retell?.apiKey || !client.retell?.agentId || !client.retell?.fromNumber) {
      throw new CustomError('Client Retell AI configuration is incomplete', 400);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/create-phone-call`,
        {
          agent_id: client.retell.agentId,
          from_number: client.retell.fromNumber,
          to_number: lead.phone,
          metadata: {
            lead_id: lead.id,
            client_id: client.id,
            priority: priority
          },
          retell_llm_dynamic_variables: {
            first_name: lead.firstName,
            last_name: lead.lastName,
            email: lead.email || '',
            source: lead.source || 'one of our online platforms',
            company: client.name
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${client.retell.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        callId: response.data.call_id,
        status: response.data.status
      };
    } catch (error: any) {
      if (error.response) {
        throw new CustomError(`Retell AI API error: ${error.response.data?.message || error.message}`, error.response.status);
      }
      throw new CustomError(`Failed to create call: ${error.message}`, 500);
    }
  }

  async createBatchCall(client: Client, leads: any[], priority: string = 'normal'): Promise<{
    batchCallId: string;
    totalTasks: number;
  }> {
    if (!client.retell?.apiKey || !client.retell?.agentId || !client.retell?.fromNumber) {
      throw new CustomError('Client Retell AI configuration is incomplete', 400);
    }

    try {
      const tasks = leads.map(lead => ({
        to_number: lead.phone,
        metadata: {
          lead_id: lead.id,
          client_id: client.id,
          priority: priority
        },
        retell_llm_dynamic_variables: {
          first_name: lead.firstName,
          last_name: lead.lastName,
          email: lead.email || '',
          source: lead.source || 'one of our online platforms',
          company: client.name
        }
      }));

      const response = await axios.post(
        `${this.baseUrl}/create-batch-call`,
        {
          from_number: client.retell.fromNumber,
          agent_id: client.retell.agentId,
          tasks: tasks,
          name: `${client.name}_batch_${Date.now()}`
        },
        {
          headers: {
            'Authorization': `Bearer ${client.retell.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        batchCallId: response.data.batch_call_id,
        totalTasks: response.data.total_task_count
      };
    } catch (error: any) {
      if (error.response) {
        throw new CustomError(`Retell AI API error: ${error.response.data?.message || error.message}`, error.response.status);
      }
      throw new CustomError(`Failed to create batch call: ${error.message}`, 500);
    }
  }

  async getCall(callId: string, client: Client): Promise<any> {
    if (!client.retell?.apiKey) {
      throw new CustomError('Client Retell AI configuration is incomplete', 400);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/get-call/${callId}`,
        {
          headers: {
            'Authorization': `Bearer ${client.retell.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new CustomError(`Retell AI API error: ${error.response.data?.message || error.message}`, error.response.status);
      }
      throw new CustomError(`Failed to get call: ${error.message}`, 500);
    }
  }

  async getConcurrency(client: Client): Promise<{
    currentConcurrency: number;
    concurrencyLimit: number;
  }> {
    if (!client.retell?.apiKey) {
      throw new CustomError('Client Retell AI configuration is incomplete', 400);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/get-concurrency`,
        {
          headers: {
            'Authorization': `Bearer ${client.retell.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new CustomError(`Retell AI API error: ${error.response.data?.message || error.message}`, error.response.status);
      }
      throw new CustomError(`Failed to get concurrency: ${error.message}`, 500);
    }
  }

  async cancelCall(callId: string, client: Client): Promise<void> {
    if (!client.retell?.apiKey) {
      throw new CustomError('Client Retell AI configuration is incomplete', 400);
    }

    try {
      await axios.delete(
        `${this.baseUrl}/delete-call/${callId}`,
        {
          headers: {
            'Authorization': `Bearer ${client.retell.apiKey}`
          }
        }
      );
    } catch (error: any) {
      if (error.response) {
        throw new CustomError(`Retell AI API error: ${error.response.data?.message || error.message}`, error.response.status);
      }
      throw new CustomError(`Failed to cancel call: ${error.message}`, 500);
    }
  }

  async getBatchCall(batchCallId: string, client: Client): Promise<any> {
    if (!client.retell?.apiKey) {
      throw new CustomError('Client Retell AI configuration is incomplete', 400);
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/get-batch-call/${batchCallId}`,
        {
          headers: {
            'Authorization': `Bearer ${client.retell.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new CustomError(`Retell AI API error: ${error.response.data?.message || error.message}`, error.response.status);
      }
      throw new CustomError(`Failed to get batch call: ${error.message}`, 500);
    }
  }
}