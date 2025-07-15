export interface Lead {
  id: string;
  clientId: string;
  
  // Contact Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Address Information
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Lead Information
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  score: number;
  
  // Call Information
  attemptCount: number;
  lastAttemptAt?: Date;
  nextCallAt?: Date;
  maxAttempts: number;
  
  // Metadata
  notes?: string;
  tags: string[];
  customFields: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  importedAt?: Date;
}

export enum LeadStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
  SALE_MADE = 'sale_made',
  NOT_INTERESTED = 'not_interested',
  DO_NOT_CALL = 'do_not_call',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export enum LeadPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

export interface CreateLeadRequest {
  clientId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  source?: string;
  priority?: LeadPriority;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateLeadRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  source?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  attemptCount?: number;
  lastAttemptAt?: Date;
  nextCallAt?: Date;
  maxAttempts?: number;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface ImportLeadRequest {
  clientId: string;
  file?: File;
  airtableSync?: boolean;
  googleSheetsSync?: boolean;
  mapping: LeadFieldMapping;
}

export interface LeadFieldMapping {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  source?: string;
  notes?: string;
  [key: string]: string | undefined;
}

export interface LeadFilters {
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  tags?: string[];
  scoreMin?: number;
  scoreMax?: number;
  page?: number;
  limit?: number;
}

export interface LeadStats {
  total: number;
  new: number;
  inProgress: number;
  contacted: number;
  qualified: number;
  appointmentScheduled: number;
  saleMade: number;
  notInterested: number;
  doNotCall: number;
  failed: number;
  expired: number;
  totalValue: number;
  conversionRate: number;
  averageScore: number;
}

export interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
  sessionId: string;
  errors?: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
}

export interface SyncResult {
  total: number;
  imported: number;
  updated: number;
  errors: number;
  errors?: Array<{
    record: any;
    message: string;
  }>;
}

export interface ImportProgress {
  status: string;
  progress: number;
  total: number;
  processed: number;
}