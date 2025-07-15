export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  industry?: string;
  website?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'prospect';
  assignedTo?: string; // User ID
  
  // Retell AI Configuration
  retell?: {
    apiKey: string;
    agentId: string;
    fromNumber: string;
    isActive: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientRequest {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  industry?: string;
  website?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'prospect';
  assignedTo?: string;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  industry?: string;
  website?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'prospect';
  assignedTo?: string;
}

export interface ClientResponse {
  success: boolean;
  data: Client;
}

export interface ClientsResponse {
  success: boolean;
  data: Client[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  prospects: number;
} 