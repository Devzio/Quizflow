import { useState, useEffect, useCallback } from 'react';
import { Plus, Pen, Trash2 } from 'lucide-react';
import {
  getAllCriteria,
  addCriterion,
  updateCriterion,
  NodeCriterion,
  addChangeListener,
  removeChangeListener
} from '../utils/nodeCriteriaService';
import Modal from './Modal';

interface NodeCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CriterionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterion: NodeCriterion;
  onSubmit: (criterion: NodeCriterion) => void;
  isEditMode: boolean;
}

function CriterionFormModal({ isOpen, onClose, criterion, onSubmit, isEditMode, criteria }: CriterionFormModalProps & { criteria: NodeCriterion[] }) {
  const [formData, setFormData] = useState<NodeCriterion>(criterion);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    setFormData(criterion);
    setSelectedId("");
  }, [criterion, isEditMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = criteria.find(c => c.id === id);
    setFormData(found ? { ...found } : { id, value: '', label: '' });
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
      title={isEditMode ? 'Edit Node Criterion' : 'Add Node Criterion'}
      className="criterion-form-modal"
    >
      <form onSubmit={handleSubmit}>
        {!isEditMode && (
          <div className="form-group">
            <label htmlFor="criterion-id">Criterion ID:</label>
            <select
              id="criterion-id"
              value={selectedId}
              onChange={handleIdChange}
              required
            >
              <option value="">Select existing criterion ID</option>
              {criteria.map(c => (
                <option key={c.id} value={c.id}>{c.id}</option>
              ))}
            </select>
          </div>
        )}
        {isEditMode && (
          <div className="form-group">
            <label>Criterion ID:</label>
            <div>{formData.id}</div>
          </div>
        )}
        {(isEditMode || selectedId) && (
          <>
            <div className="form-group">
              <label htmlFor="value">Value:</label>
              <input
                type="text"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="label">Display Label:</label>
              <input
                type="text"
                id="label"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )}
        <div className="form-buttons">
          <button type="submit" className="toolbar-btn" disabled={!isEditMode && !selectedId}>{isEditMode ? 'Update' : 'Add'}</button>
          <button type="button" className="toolbar-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

export default function NodeCriteriaModal({ isOpen, onClose }: NodeCriteriaModalProps) {
  const [criteria, setCriteria] = useState<NodeCriterion[]>([]);
  const [currentCriterion, setCurrentCriterion] = useState<NodeCriterion>({ id: '', value: '', label: '' });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Function to refresh criteria list - wrapped in useCallback to maintain reference
  const refreshCriteria = useCallback(() => {
    console.log('Refreshing node criteria list');
    setCriteria(getAllCriteria());
  }, []);

  // Set up change listener when component mounts
  useEffect(() => {
    console.log('Setting up node criteria change listener');
    addChangeListener(refreshCriteria);

    return () => {
      console.log('Removing node criteria change listener');
      removeChangeListener(refreshCriteria);
    };
  }, [refreshCriteria]);

  useEffect(() => {
    if (isOpen) {
      // Load criteria when modal opens
      console.log('Node criteria modal opened, loading criteria');
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

  const handleEdit = (criterion: NodeCriterion) => {
    console.log('Editing node criterion:', criterion);
    setCurrentCriterion({ ...criterion });
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Only clear value and label, keep the id
    setCriteria(prevCriteria => prevCriteria.map(c =>
      c.id === id ? { ...c, value: '', label: '' } : c
    ));
    // If you want to persist this change, also update the storage/service:
    const crit = criteria.find(c => c.id === id);
    if (crit) {
      updateCriterion({ ...crit, value: '', label: '' });
    }
  };

  const handleSubmitCriterion = (criterion: NodeCriterion) => {
    if (isEditMode) {
      console.log('Updating node criterion:', criterion);
      updateCriterion(criterion);
    } else {
      console.log('Adding node criterion:', criterion);
      addCriterion({ ...criterion, id: Date.now().toString() });
    }
    resetForm();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manage Node Criteria"
        className="criteria-modal"
      >
        <div className="action-buttons">
          <button onClick={handleOpenAddModal} className="toolbar-btn">
            <Plus className="" size={14} />
            Add New Criterion
          </button>
        </div>
        <h3>Node Criteria List</h3>

        <div className="criteria-list">
          {criteria.filter(criterion => criterion.value && criterion.label).length === 0 ? (
            <p>No criteria available. Click "Add New Criterion" to create one.</p>
          ) : (
            <ul>
              {criteria.filter(criterion => criterion.value && criterion.label).map(criterion => (
                <li key={criterion.id}>
                  <div className="criterion-item">
                    <div className="criterion-info">
                      <strong>{criterion.label}</strong> ({criterion.value})
                    </div>
                    <div className="criterion-actions">
                      <button onClick={() => handleEdit(criterion)} className="toolbar-btn"><Pen className="" size={14} /></button>
                      <button onClick={() => handleDelete(criterion.id)} className="toolbar-btn"><Trash2 className="" size={14} /></button>
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
        criteria={criteria}
      />
    </>
  );
}
