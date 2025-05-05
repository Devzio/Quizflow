import { useState, useEffect, useCallback } from 'react';
import {
  getAllCriteria,
  addCriterion,
  updateCriterion,
  deleteCriterion,
  EdgeCriterion,
  addChangeListener,
  removeChangeListener
} from '../utils/edgeCriteriaService';
import Modal from './Modal';

interface EdgeCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CriterionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterion: EdgeCriterion;
  onSubmit: (criterion: EdgeCriterion) => void;
  isEditMode: boolean;
}

function CriterionFormModal({ isOpen, onClose, criterion, onSubmit, isEditMode }: CriterionFormModalProps) {
  const [formData, setFormData] = useState<EdgeCriterion>(criterion);

  useEffect(() => {
    setFormData(criterion);
  }, [criterion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Edge Criterion' : 'Add Edge Criterion'}
      className="criterion-form-modal"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="value">Value:</label>
          <input
            type="text"
            id="value"
            name="value"
            value={formData.value}
            onChange={handleInputChange}
            placeholder="e.g. authenticated"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="label">Label:</label>
          <input
            type="text"
            id="label"
            name="label"
            value={formData.label}
            onChange={handleInputChange}
            placeholder="e.g. Authenticated"
            required
          />
        </div>

        <div className="form-buttons">
          <button type="submit">{isEditMode ? 'Update' : 'Add'}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

export default function EdgeCriteriaModal({ isOpen, onClose }: EdgeCriteriaModalProps) {
  const [criteria, setCriteria] = useState<EdgeCriterion[]>([]);
  const [currentCriterion, setCurrentCriterion] = useState<EdgeCriterion>({ id: '', value: '', label: '' });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Function to refresh criteria list - wrapped in useCallback to maintain reference
  const refreshCriteria = useCallback(() => {
    console.log('Refreshing criteria list'); // Debugging
    setCriteria(getAllCriteria());
  }, []);

  // Set up change listener when component mounts
  useEffect(() => {
    console.log('Setting up change listener');
    addChangeListener(refreshCriteria);

    return () => {
      console.log('Removing change listener');
      removeChangeListener(refreshCriteria);
    };
  }, [refreshCriteria]);

  useEffect(() => {
    if (isOpen) {
      // Load criteria when modal opens
      console.log('Modal opened, loading criteria');
      refreshCriteria();
      resetForm();
    }
  }, [isOpen, refreshCriteria]);

  const resetForm = () => {
    setCurrentCriterion({ id: '', value: '', label: '' });
    setIsEditMode(false);
    setIsFormModalOpen(false);
  };

  const handleOpenAddModal = () => {
    setCurrentCriterion({ id: '', value: '', label: '' });
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleEdit = (criterion: EdgeCriterion) => {
    console.log('Editing criterion:', criterion);
    setCurrentCriterion({ ...criterion });
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log('Deleting criterion:', id);
    deleteCriterion(id);
  };

  const handleSubmitCriterion = (criterion: EdgeCriterion) => {
    if (isEditMode) {
      console.log('Updating criterion:', criterion);
      updateCriterion(criterion);
    } else {
      console.log('Adding criterion:', criterion);
      addCriterion({ ...criterion, id: Date.now().toString() });
    }
    resetForm();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Edge Criteria"
        className="criteria-modal"
      >
        <div className="action-buttons">
          <button onClick={handleOpenAddModal}>Add New Criterion</button>
        </div>
        <h3>Edge Criteria List</h3>

        <div className="criteria-list">
          {criteria.length === 0 ? (
            <p>No criteria available. Click "Add New Criterion" to create one.</p>
          ) : (
            <ul>
              {criteria.map(criterion => (
                <li key={criterion.id}>
                  <div className="criterion-item">
                    <div className="criterion-info">
                      <strong>{criterion.label}</strong> ({criterion.value})
                    </div>
                    <div className="criterion-actions">
                      <button onClick={() => handleEdit(criterion)}>Edit</button>
                      <button onClick={() => handleDelete(criterion.id)}>Delete</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>

      <CriterionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        criterion={currentCriterion}
        onSubmit={handleSubmitCriterion}
        isEditMode={isEditMode}
      />
    </>
  );
}