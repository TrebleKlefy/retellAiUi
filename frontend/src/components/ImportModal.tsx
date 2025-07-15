import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { leadService } from '../services/leadService';
import { LeadFieldMapping } from '../types/lead';

interface ImportModalProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ clientId, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<LeadFieldMapping>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    source: '',
    notes: ''
  });
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      // Read headers from CSV/Excel file
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          setHeaders(headers);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await leadService.importLeads(clientId, file, mapping);
      setImportResult(result);
      if (result.imported > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please check your file and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMappingChange = (field: keyof LeadFieldMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateMapping = () => {
    return mapping.firstName && mapping.lastName && mapping.phone;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Import Leads</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {!importResult ? (
            <>
              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (CSV or Excel)
                </label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <p className="text-green-600">✓ {file.name}</p>
                      <p className="text-sm text-gray-500">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600">
                        {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
                      </p>
                      <p className="text-sm text-gray-500">Supports CSV, XLS, XLSX files</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Field Mapping */}
              {headers.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Fields
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <select
                        value={mapping.firstName}
                        onChange={(e) => handleMappingChange('firstName', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <select
                        value={mapping.lastName}
                        onChange={(e) => handleMappingChange('lastName', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <select
                        value={mapping.email}
                        onChange={(e) => handleMappingChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <select
                        value={mapping.phone}
                        onChange={(e) => handleMappingChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <select
                        value={mapping.address}
                        onChange={(e) => handleMappingChange('address', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <select
                        value={mapping.city}
                        onChange={(e) => handleMappingChange('city', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        value={mapping.state}
                        onChange={(e) => handleMappingChange('state', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Zip Code
                      </label>
                      <select
                        value={mapping.zipCode}
                        onChange={(e) => handleMappingChange('zipCode', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <select
                        value={mapping.source}
                        onChange={(e) => handleMappingChange('source', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">Select field</option>
                        {headers.map(header => (
                          <option key={header} value={header}>{header}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || !validateMapping() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Importing...' : 'Import Leads'}
                </button>
              </div>
            </>
          ) : (
            /* Import Results */
            <div className="text-center">
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Import Complete</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-800 font-medium">{importResult.imported} Imported</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-yellow-800 font-medium">{importResult.duplicates} Duplicates</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-red-800 font-medium">{importResult.errors} Errors</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-blue-800 font-medium">{importResult.total} Total</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};