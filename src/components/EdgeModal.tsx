import React from 'react';
import Modal from './Modal';

export default function EdgeModal({
  isOpen,
  onClose,
  criteria = [],
  selectedCriteriaId = '',
  handleCriteriaChange = () => { },
}: {
  isOpen: boolean;
  onClose: () => void;
  criteria: Array<{ id: string; value: string; label: string }>;
  selectedCriteriaId: string;
  handleCriteriaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Edge"
      className={`edge-modal${document.body.classList.contains('dark') ? ' dark' : ''
        }`}
    >
      <div className="form-group">
        <label htmlFor="criteria">Edge Criteria:</label>
        <select
          id="criteria"
          name="criteria"
          value={selectedCriteriaId}
          onChange={handleCriteriaChange}
          required
        >
          <option value="">Select edge criteria</option>
          {criteria
            .filter(c => c.value && c.label)
            .map(c => (
              <option key={c.id} value={c.id}>
                {c.label} ({c.value})
              </option>
            ))}
        </select>
      </div>
    </Modal>
  );
}