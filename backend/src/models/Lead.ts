export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  value?: number;
  assignedTo?: string; // User ID
  clientId?: string; // Client ID if converted
  notes?: string;
  tags?: string[];
  lastContacted?: Date;
  nextFollowUp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  source: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  value?: number;
  assignedTo?: string;
  notes?: string;
  tags?: string[];
  nextFollowUp?: Date;
}

export interface UpdateLeadRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  industry?: string;
  source?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'closed' | 'lost';
  value?: number;
  assignedTo?: string;
  clientId?: string;
  notes?: string;
  tags?: string[];
  lastContacted?: Date;
  nextFollowUp?: Date;
}

export interface LeadResponse {
  success: boolean;
  data: Lead;
}

export interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  closed: number;
  lost: number;
  totalValue: number;
  conversionRate: number;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
} 