import { BaseEdge, EdgeProps, EdgeText, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { Check, Trash2, X } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getAllCriteria, EdgeCriterion, addChangeListener, removeChangeListener } from '../../utils/edgeCriteriaService';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { deleteElements, setEdges } = useReactFlow();

  const deleteEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState<string>(typeof data?.label === 'string' ? data.label : '');
  const [selectedCriteria, setSelectedCriteria] = useState<EdgeCriterion[]>(
    Array.isArray(data?.selectedCriteria) ? data.selectedCriteria : []
  );
  const [criteriaOptions, setCriteriaOptions] = useState<EdgeCriterion[]>([]);
  // const [currentInput, setCurrentInput] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Function to refresh criteria options
  const refreshCriteriaOptions = useCallback(() => {
    console.log('Refreshing criteria options in edge');
    setCriteriaOptions(getAllCriteria());
  }, []);

  // Load criteria options when component mounts and set up listener
  useEffect(() => {
    refreshCriteriaOptions();

    // Add listener for criteria changes
    addChangeListener(refreshCriteriaOptions);

    // Clean up listener when component unmounts
    return () => {
      removeChangeListener(refreshCriteriaOptions);
    };
  }, [refreshCriteriaOptions]);

  // Initialize selected criteria from data when mounting or when data changes
  useEffect(() => {
    if (data?.selectedCriteria) {
      setSelectedCriteria(Array.isArray(data.selectedCriteria) ? data.selectedCriteria : []);
    } else if (data?.edgeCriteria) {
      // For backward compatibility with the old single-criteria format
      const criterion = criteriaOptions.find(c => c.value === data.edgeCriteria);
      if (criterion) {
        setSelectedCriteria([criterion]);
      }
    }
  }, [data?.selectedCriteria, data?.edgeCriteria, criteriaOptions]);

  // Sync edge label with data.label whenever it changes
  useEffect(() => {
    if (data?.label) {
      if (typeof data.label === 'string') {
        setEdgeLabel(data.label);
      }
    }
  }, [data?.label]);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default context menu
    setIsModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdgeLabel(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const selectedCriterion = criteriaOptions.find(c => c.value === selectedValue);
    if (selectedCriterion && !selectedCriteria.some(c => c.value === selectedValue)) {
      const newSelectedCriteria = [...selectedCriteria, selectedCriterion];
      setSelectedCriteria(newSelectedCriteria);

      // Update the edge label to be a combination of all selected criteria
      if (newSelectedCriteria.length === 1) {
        setEdgeLabel(selectedCriterion.label);
      }

      // Reset the select dropdown
      e.target.value = '';
    }
  };

  const handleRemoveCriterion = (criterionValue: string) => {
    setSelectedCriteria(selectedCriteria.filter(c => c.value !== criterionValue));
  };

  const handleModalClose = useCallback(() => {
    // Update the edge data with the new label and all selected criteria
    setEdges(edges =>
      edges.map(edge =>
        edge.id === id
          ? {
            ...edge,
            data: {
              ...edge.data,
              label: edgeLabel,
              selectedCriteria: selectedCriteria,
              // Keep edgeCriteria for backward compatibility
              edgeCriteria: selectedCriteria[0]?.value || ''
            }
          }
          : edge
      )
    );

    setIsModalOpen(false);
  }, [id, edgeLabel, selectedCriteria, setEdges]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleModalClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, edgeLabel, selectedCriteria, handleModalClose]);

  // Additional effect to refresh criteria options when modal is opened
  useEffect(() => {
    if (isModalOpen) {
      refreshCriteriaOptions();
    }
  }, [isModalOpen, refreshCriteriaOptions]);

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      <EdgeText
        x={labelX}
        y={labelY}
        label={edgeLabel || '(No Answer)'}
        className="edge-label"
        onContextMenu={handleContextMenu}
      />
      {isModalOpen && (
        <foreignObject
          width="300"
          height={200} // Increased height to accommodate pills
          x={labelX - 100}
          y={labelY - 100}
          className="edge-modal"
        >
          <div className="modal-content_edge" ref={modalRef}>
            <input
              type="text"
              value={edgeLabel}
              onChange={handleLabelChange}
              placeholder="Edge label"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalClose();
                }
              }}
            />

            {selectedCriteria.length > 0 && (
              <div className="pill-container">
                {selectedCriteria.map((criterion) => (
                  <div key={criterion.id} className="criterion-pill">
                    <span>{criterion.label}</span>
                    <button
                      onClick={() => handleRemoveCriterion(criterion.value)}
                      className="remove-pill remove_svg_style"
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <select
              value=""
              onChange={handleSelectChange}
              className="edge-criteria-dropdown"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalClose();
                }
              }}
            >
              <option value="">Select Edge Criteria</option>
              {criteriaOptions
                .filter(option => !selectedCriteria.some(c => c.value === option.value))
                .map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>

            <div className="modal-buttons">
              <button onClick={deleteEdge} className='btn-deleteEdge'>
                <Trash2 className="remove_svg_style" size={12} />
              </button>
              <button onClick={handleModalClose} className='btn-confirmEdge'>
                <Check className="remove_svg_style" size={14} />
              </button>
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
}