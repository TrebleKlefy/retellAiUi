import React, { useState } from 'react';
import { Button } from './common/Button';
import { CreateCallModal } from './CreateCallModal';
import { BatchCallModal } from './BatchCallModal';

interface CallControlsProps {
  clientId: string;
  onCallCreated: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({ clientId, onCallCreated }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  return (
    <div className="flex space-x-3">
      <Button
        onClick={() => setShowCreateModal(true)}
        variant="primary"
      >
        Create Call
      </Button>
      
      <Button
        onClick={() => setShowBatchModal(true)}
        variant="secondary"
      >
        Batch Calls
      </Button>

      {showCreateModal && (
        <CreateCallModal
          clientId={clientId}
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            onCallCreated();
          }}
        />
      )}

      {showBatchModal && (
        <BatchCallModal
          clientId={clientId}
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          onSuccess={() => {
            setShowBatchModal(false);
            onCallCreated();
          }}
        />
      )}
    </div>
  );
};