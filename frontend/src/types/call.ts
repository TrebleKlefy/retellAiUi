export interface Call {
  id: string;
  callId: string; // Retell call ID
  clientId: string;
  leadId: string;
  
  // Call Information
  fromNumber: string;
  toNumber: string;
  status: CallStatus;
  outcome: CallOutcome;
  
  // Call Details
  duration: number; // in seconds
  transcript: string;
  recordingUrl?: string;
  
  // Call Analysis
  sentiment: number; // -1 to 1
  intent: string;
  keywords: string[];
  notes: string;
  
  // Call Results
  appointmentDate?: Date;
  followUpDate?: Date;
  followUpNotes: string;
  
  // Metadata
  priority: CallPriority;
  attemptNumber: number;
  maxAttempts: number;
  
  // Timestamps
  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum CallStatus {
  SCHEDULED = 'scheduled',
  INITIATED = 'initiated',
  RINGING = 'ringing',
  CONNECTED = 'connected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum CallOutcome {
  SUCCESSFUL = 'successful',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  QUALIFIED_LEAD = 'qualified_lead',
  SALE_MADE = 'sale_made',
  NOT_INTERESTED = 'not_interested',
  NO_ANSWER = 'no_answer',
  VOICEMAIL = 'voicemail',
  WRONG_NUMBER = 'wrong_number',
  DO_NOT_CALL = 'do_not_call',
  FAILED = 'failed'
}

export enum CallPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export interface CreateCallRequest {
  clientId: string;
  leadId: string;
  priority?: CallPriority;
  scheduledAt?: Date;
  dynamicVariables?: Record<string, any>;
}

export interface BatchCallRequest {
  clientId: string;
  leadIds: string[];
  priority?: CallPriority;
  scheduledAt?: Date;
  maxConcurrent?: number;
}

export interface CallFilters {
  clientId?: string;
  leadId?: string;
  status?: CallStatus;
  outcome?: CallOutcome;
  priority?: CallPriority;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface CallStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  averageDuration: number;
  totalDuration: number;
  callsByStatus: Record<CallStatus, number>;
  callsByOutcome: Record<CallOutcome, number>;
  callsByPriority: Record<CallPriority, number>;
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

export interface BatchCallResponse {
  success: boolean;
  data: {
    batchCallId: string;
    totalCalls: number;
    calls: Call[];
  };
}

export interface CallStatsResponse {
  success: boolean;
  data: CallStats;
}