import axios from 'axios';
import { CustomError } from '../middleware/errorHandler';

export class RetellService {
  private baseUrl = 'https://api.retellai.com';

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/agents`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Retell AI connection test failed:', error);
      return false;
    }
  }

  async validateAgent(apiKey: string, agentId: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Retell AI agent validation failed:', error);
      return false;
    }
  }

  async validatePhoneNumber(_apiKey: string, fromNumber: string): Promise<boolean> {
    try {
      // This would typically validate the phone number format and ownership
      // For now, we'll just check if it's a valid format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(fromNumber.replace(/\D/g, ''));
    } catch (error) {
      console.error('Retell AI phone number validation failed:', error);
      return false;
    }
  }

  async getAgents(apiKey: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/agents`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.agents || [];
    } catch (error: any) {
      throw new CustomError(`Failed to get agents from Retell AI: ${error.message}`, 500);
    }
  }

  async getAgent(apiKey: string, agentId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      throw new CustomError(`Failed to get agent from Retell AI: ${error.message}`, 500);
    }
  }

  async createCall(apiKey: string, callData: {
    agent_id: string;
    from_number: string;
    to_number: string;
    metadata?: any;
  }): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/calls`, callData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      throw new CustomError(`Failed to create call with Retell AI: ${error.message}`, 500);
    }
  }

  async getCall(apiKey: string, callId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/v1/calls/${callId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: any) {
      throw new CustomError(`Failed to get call from Retell AI: ${error.message}`, 500);
    }
  }
}