import { BaseEdge, EdgeProps, EdgeText, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { Check, Trash2, X } from 'lucide-react';
import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
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

  const { deleteElements, setEdges, getZoom } = useReactFlow();

  const deleteEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState<string>(typeof data?.label === 'string' ? data.label : '');
  const [selectedCriteria, setSelectedCriteria] = useState<EdgeCriterion[]>(
    Array.isArray(data?.selectedCriteria) ? data.selectedCriteria : []
  );
  const [criteriaOptions, setCriteriaOptions] = useState<EdgeCriterion[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Add reference for the input field
  const pillContainerRef = useRef<HTMLDivElement>(null); // Add reference for the pill container

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
    // Only use selectedCriteria if it's explicitly defined - don't auto-create from label
    if (data?.selectedCriteria && Array.isArray(data.selectedCriteria)) {
      setSelectedCriteria(data.selectedCriteria);
    } else if (data?.edgeCriteria) {
      // For backward compatibility with the old single-criteria format
      const criterion = criteriaOptions.find(c => c.value === data.edgeCriteria);
      if (criterion) {
        setSelectedCriteria([criterion]);
      }
    }
  }, [data?.selectedCriteria, data?.edgeCriteria, criteriaOptions]);

  // Sync edge label with data.label whenever it changes
  // Important: This ensures we keep the user-defined label during import
  useEffect(() => {
    if (data?.label && typeof data.label === 'string') {
      setEdgeLabel(data.label);
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
            label: edgeLabel, // Set the label at the top level too
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

  // Add effect to focus and select text in input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isModalOpen]);

  // Adjust modal position based on pill container height and zoom level
  const [modalYOffset, setModalYOffset] = useState(0);
  useLayoutEffect(() => {
    if (isModalOpen && pillContainerRef.current) {
      setTimeout(() => {
        if (pillContainerRef.current) {
          const zoom = getZoom();

          const pillContainerHeight = pillContainerRef.current.getBoundingClientRect().height;
          const baseHeight = 19.5; // Baseline height for single line of pills

          // Only apply offset when height significantly increases (more than 8px)
          if (pillContainerHeight > baseHeight + 8) {
            // Calculate additional height with a zoom-sensitive factor
            const additionalHeight = Math.max(0, pillContainerHeight - baseHeight);

            // Apply a non-linear zoom compensation that increases dramatically at lower zoom levels
            // This gives better results across the entire zoom range (0.5 to 2.0)
            let zoomFactor;
            if (zoom >= 1) {
              // When zoomed in (1.0+), use more moderate scaling
              zoomFactor = 1.2 / zoom;
            } else {
              // When zoomed out (<1.0), use more aggressive scaling
              // The 1/zoom² creates a stronger effect at lower zoom levels
              zoomFactor = 1.2 * (1 / (zoom * zoom));
            }

            // Calculate the final offset with the dynamic zoom factor
            const dampedOffset = Math.floor(additionalHeight * zoomFactor);

            console.log('Pill container height:', pillContainerHeight, 'Base height:', baseHeight,
              'Zoom:', zoom, 'Zoom factor:', zoomFactor, 'Adjusted offset:', dampedOffset);
            setModalYOffset(dampedOffset);
          } else {
            // Add a minimum offset based on zoom level to ensure there's always some space
            // This ensures the modal never sits right on the edge label, even with no pills
            const minOffset = zoom < 1 ? Math.floor(15 / zoom) : 15;
            setModalYOffset(minOffset);
          }
        }
      }, 0);
    }
  }, [isModalOpen, selectedCriteria, getZoom]); // React to any changes in selectedCriteria or zoom level

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
          height={200 + modalYOffset} // Adjusted height based on pills
          x={labelX - 90}
          y={labelY - 105 - modalYOffset} // Move modal down by the full amount of extra height
          className="edge-modal"
        >
          <div className="modal-content_edge" ref={modalRef}>
            <input
              type="text"
              value={edgeLabel}
              onChange={handleLabelChange}
              placeholder="Edge label"
              ref={inputRef} // Attach the input reference
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalClose();
                }
              }}
            />

            {selectedCriteria.length > 0 && (
              <div className="pill-container" ref={pillContainerRef}>
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