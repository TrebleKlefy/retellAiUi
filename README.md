# Lead Management & Data Import System

A comprehensive lead management system with data import capabilities from CSV/Excel files, Airtable, and Google Sheets, including lead validation, duplicate detection, and lead scoring.

## Features

### Lead Management
- ✅ **Lead CRUD Operations** - Create, read, update, and delete leads
- ✅ **Lead Status Management** - Track leads through various statuses (New, In Progress, Contacted, etc.)
- ✅ **Lead Scoring & Prioritization** - Automatic lead scoring based on data quality and completeness
- ✅ **Lead Filtering & Search** - Advanced filtering by status, priority, source, date ranges, and more
- ✅ **Lead History Tracking** - Track all changes and interactions with leads
- ✅ **Lead Analytics** - Comprehensive dashboard with conversion funnel and performance metrics

### Data Import Features
- ✅ **CSV/Excel File Upload** - Drag-and-drop file upload with field mapping
- ✅ **Airtable Integration** - Sync leads directly from Airtable
- ✅ **Google Sheets Integration** - Sync leads from Google Sheets
- ✅ **Data Validation & Cleaning** - Automatic data normalization and validation
- ✅ **Duplicate Detection** - Smart duplicate detection based on email and phone
- ✅ **Import Progress Tracking** - Real-time progress tracking for large imports

### Lead Processing Features
- ✅ **Smart Data Normalization** - Automatic phone number formatting and name capitalization
- ✅ **Phone Number Formatting** - Standardize phone numbers to consistent format
- ✅ **Email Validation** - Validate email addresses during import and creation
- ✅ **Address Standardization** - Clean and standardize address data
- ✅ **Name Processing** - Proper name capitalization and formatting
- ✅ **Source Tracking** - Track lead sources for analytics

## Technology Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** for API framework
- **Airtable** for database
- **Multer** for file uploads
- **XLSX** for Excel file processing
- **CSV-Parser** for CSV file processing
- **Google APIs** for Google Sheets integration

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads
- **React Table** for data tables
- **Axios** for API communication

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Airtable account and API key
- Google Cloud Platform account (for Google Sheets integration)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd retellAiUi
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Airtable Configuration
AIRTABLE_API_KEY=your_airtable_api_key
AIRTABLE_BASE_ID=your_airtable_base_id

# Google Sheets Configuration (Optional)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=path/to/service-account-key.json
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_RANGE=Sheet1!A:Z

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

4. **Start the backend server**
```bash
npm run dev
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start the frontend development server**
```bash
npm start
```

## API Endpoints

### Lead Management
- `GET /api/clients/:clientId/leads` - Get leads for client
- `GET /api/leads/:id` - Get lead by ID
- `POST /api/clients/:clientId/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Import Operations
- `POST /api/clients/:clientId/import` - Import leads from file
- `POST /api/clients/:clientId/sync/airtable` - Sync from Airtable
- `POST /api/clients/:clientId/sync/google-sheets` - Sync from Google Sheets
- `GET /api/import/:sessionId/progress` - Get import progress

### Lead Analytics
- `GET /api/clients/:clientId/leads/stats` - Get lead statistics
- `POST /api/leads/calculate-score` - Calculate lead score
- `POST /api/clients/:clientId/leads/detect-duplicates` - Detect duplicate leads

## Usage Guide

### Creating Leads

1. **Manual Creation**
   - Navigate to the Leads page
   - Click "Add Lead" button
   - Fill in the required information (First Name, Last Name, Phone)
   - Add optional information (Email, Address, Source, etc.)
   - Click "Create Lead"

2. **Bulk Import via File**
   - Click "Import Leads" button
   - Drag and drop a CSV or Excel file
   - Map the file columns to lead fields
   - Review the mapping and click "Import Leads"
   - Monitor the import progress

3. **Sync from Airtable**
   - Click "Sync Airtable" button
   - The system will automatically sync leads from your configured Airtable base
   - Review the sync results

4. **Sync from Google Sheets**
   - Click "Sync Sheets" button
   - The system will automatically sync leads from your configured Google Sheet
   - Review the sync results

### Managing Leads

1. **Viewing Leads**
   - Use the search bar to find specific leads
   - Apply filters by status, priority, source, or date range
   - Sort leads by clicking on column headers

2. **Editing Leads**
   - Click the "Edit" button on any lead row
   - Modify the lead information
   - Click "Update Lead" to save changes

3. **Updating Lead Status**
   - Use the status dropdown in the leads table
   - Select the new status
   - Changes are automatically saved

4. **Bulk Operations**
   - Select multiple leads using checkboxes
   - Use bulk delete to remove multiple leads at once

### Lead Analytics

1. **Dashboard Overview**
   - View total leads, conversion rate, and average score
   - See lead status breakdown with visual charts
   - Monitor conversion funnel from new leads to sales

2. **Performance Metrics**
   - Track lead scoring trends
   - Monitor source effectiveness
   - Analyze conversion rates by status

## Data Models

### Lead Model
```typescript
interface Lead {
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
```

### Lead Statuses
- `new` - New lead
- `in_progress` - Lead being worked on
- `contacted` - Lead has been contacted
- `qualified` - Lead is qualified
- `appointment_scheduled` - Appointment scheduled
- `sale_made` - Sale completed
- `not_interested` - Lead not interested
- `do_not_call` - Do not call list
- `failed` - Lead failed
- `expired` - Lead expired

### Lead Priorities
- `urgent` - Highest priority
- `high` - High priority
- `normal` - Normal priority
- `low` - Low priority

## Lead Scoring Algorithm

The system automatically calculates lead scores (0-100) based on:

- **Email presence** (20 points) - Lead has a valid email
- **Phone quality** (25 points) - Phone number has 10+ digits
- **Source quality** (15 points) - High-quality sources get more points
- **Priority bonus** (10 points) - Urgent/high priority leads get bonus
- **Address completeness** (10 points) - Complete address information
- **Tags** (5 points per tag, max 15) - More tags indicate better engagement
- **Custom fields** (5 points per field, max 15) - Additional data indicates quality

## File Import Formats

### Supported File Types
- CSV files (.csv)
- Excel files (.xlsx, .xls)

### Required Fields
- First Name (required)
- Last Name (required)
- Phone (required)

### Optional Fields
- Email
- Address
- City
- State
- Zip Code
- Country
- Source
- Notes

### Field Mapping
During import, you can map your file columns to the lead fields:
- Drag and drop your file
- Select the appropriate column for each field
- Required fields must be mapped
- Optional fields can be left unmapped

## Configuration

### Airtable Setup
1. Create an Airtable account
2. Create a new base with a "Leads" table
3. Get your API key from Airtable account settings
4. Get your base ID from the API documentation
5. Configure the environment variables

### Google Sheets Setup
1. Create a Google Cloud Platform project
2. Enable Google Sheets API
3. Create a service account and download the key file
4. Share your Google Sheet with the service account email
5. Configure the environment variables

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors** - Form validation with user-friendly error messages
- **File Upload Errors** - Clear error messages for unsupported file types
- **Import Errors** - Detailed error reporting for failed imports
- **Duplicate Detection** - Automatic detection and reporting of duplicate leads
- **API Errors** - Proper HTTP status codes and error messages

## Performance Considerations

- **File Size Limits** - Maximum 10MB file uploads
- **Batch Processing** - Large imports are processed in batches
- **Progress Tracking** - Real-time progress updates for long-running operations
- **Caching** - Lead statistics are cached for better performance
- **Pagination** - Large lead lists are paginated for better performance

## Security Features

- **Authentication** - JWT-based authentication required for all operations
- **Authorization** - Role-based access control
- **Input Validation** - Comprehensive input validation and sanitization
- **File Upload Security** - File type validation and size limits
- **API Rate Limiting** - Protection against abuse

## Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred hosting platform

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the build folder to your web server or CDN

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### Version 1.0.0
- Initial release with comprehensive lead management
- File import functionality (CSV/Excel)
- Airtable and Google Sheets integration
- Lead scoring and analytics
- Advanced filtering and search
- Bulk operations support