import React from 'react';

export const Calls: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Call Management</h3>
        <p className="mt-1 text-sm text-gray-500">This feature will be implemented in a future update.</p>
      </div>
    </div>
  );
};