export interface TimeWindow {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Client {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Airtable Configuration
  airtable: {
    apiKey: string;
    baseId: string;
    leadsTable: string;
    resultsTable: string;
    enabled: boolean;
  };
  
  // Google Sheets Configuration
  googleSheets: {
    spreadsheetId: string;
    sheetName: string;
    enabled: boolean;
    syncInterval: number | null;
  };
  
  // Retell AI Configuration
  retell: {
    apiKey: string;
    agentId: string;
    fromNumber: string;
  };
  
  // Calling Schedule
  schedule: {
    timezone: string;
    activeDays: string[];
    timeWindows: TimeWindow[];
    maxConcurrent: number;
    delayBetweenCalls: number;
    maxAttempts: number;
    callCooldownHours: number;
  };
  
  // Compliance Settings
  compliance: {
    enableStateFiltering: boolean;
    allowedStates: string[];
    enableDuplicateDetection: boolean;
    quotaEnabled: boolean;
    dailyQuota: number;
  };
  
  // Client Preferences
  preferences: {
    priority: number;
    urgentCallsEnabled: boolean;
    batchDialingEnabled: boolean;
    pauseForUrgent: boolean;
    leadScoring: boolean;
    duplicateDetection: boolean;
    autoFailAfterAttempts: boolean;
  };
}

export interface CreateClientRequest {
  name: string;
  airtable?: Partial<Client['airtable']>;
  googleSheets?: Partial<Client['googleSheets']>;
  retell?: Partial<Client['retell']>;
  schedule?: Partial<Client['schedule']>;
  compliance?: Partial<Client['compliance']>;
  preferences?: Partial<Client['preferences']>;
}

export interface UpdateClientRequest {
  name?: string;
  isActive?: boolean;
  airtable?: Partial<Client['airtable']>;
  googleSheets?: Partial<Client['googleSheets']>;
  retell?: Partial<Client['retell']>;
  schedule?: Partial<Client['schedule']>;
  compliance?: Partial<Client['compliance']>;
  preferences?: Partial<Client['preferences']>;
}

export interface ClientStats {
  totalLeads: number;
  activeLeads: number;
  totalCalls: number;
  successfulCalls: number;
  successRate: number;
}

export interface IntegrationTestResult {
  airtable: boolean;
  googleSheets: boolean;
  retell: boolean;
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