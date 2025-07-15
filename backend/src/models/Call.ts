export interface Call {
  id: string;
  leadId: string;
  agentId: string; // User ID
  callId: string; // Retell call ID
  phoneNumber: string;
  duration: number; // in seconds
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'no-answer';
  outcome: 'successful' | 'no-answer' | 'voicemail' | 'busy' | 'wrong-number' | 'failed';
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  tags?: string[];
  scheduledAt?: Date;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCallRequest {
  leadId: string;
  phoneNumber: string;
  scheduledAt?: Date;
  notes?: string;
  tags?: string[];
}

export interface UpdateCallRequest {
  status?: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'no-answer';
  outcome?: 'successful' | 'no-answer' | 'voicemail' | 'busy' | 'wrong-number' | 'failed';
  duration?: number;
  recordingUrl?: string;
  transcript?: string;
  notes?: string;
  tags?: string[];
  startedAt?: Date;
  endedAt?: Date;
}

export interface CallResponse {
  success: boolean;
  data: Call;
}

export interface CallsResponse {
  success: boolean;
  data: Call[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CallStats {
  total: number;
  successful: number;
  noAnswer: number;
  voicemail: number;
  busy: number;
  wrongNumber: number;
  failed: number;
  totalDuration: number;
  averageDuration: number;
  successRate: number;
}

export interface RetellCallData {
  call_id: string;
  agent_id: string;
  phone_number: string;
  status: string;
  duration?: number;
  recording_url?: string;
  transcript?: string;
  metadata?: any;
}

export interface RetellWebhookPayload {
  event: string;
  data: RetellCallData;
  timestamp: string;
}

export interface CallFilters {
  leadId?: string;
  agentId?: string;
  status?: string;
  outcome?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
} 