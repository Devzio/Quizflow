import { BaseEdge, EdgeProps, EdgeText, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { Check, Trash2 } from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { getAllCriteria, EdgeCriterion, addChangeListener, removeChangeListener } from '../../utils/edgeCriteriaService';

export default function EdgeWithDeleteButton({
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
  const [edgeLabel, setEdgeLabel] = useState(data?.label || '');
  const [edgeCriteria, setEdgeCriteria] = useState('');
  const [criteriaOptions, setCriteriaOptions] = useState<EdgeCriterion[]>([]);
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

  // Sync edge label with data.label whenever it changes
  useEffect(() => {
    if (data?.label) {
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

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setEdgeCriteria(selectedValue);

    // Find the selected criterion to get its label
    const selectedCriterion = criteriaOptions.find(c => c.value === selectedValue);
    if (selectedCriterion) {
      // Automatically set the edge label to the criterion label
      setEdgeLabel(selectedCriterion.label);
    }
  };

  const handleModalClose = () => {
    // Update the edge data with the new label
    setEdges(edges =>
      edges.map(edge =>
        edge.id === id
          ? {
            ...edge,
            data: {
              ...edge.data,
              label: edgeLabel,
              edgeCriteria: edgeCriteria
            }
          }
          : edge
      )
    );

    setIsModalOpen(false);
  };

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
  }, [isModalOpen, edgeLabel, edgeCriteria]);

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
          height="150"
          x={labelX - 87}
          y={labelY - 90}
          className="edge-modal"
        >
          <div className="modal-content_edge" ref={modalRef}>
            <input
              type="text"
              value={edgeLabel}
              onChange={handleLabelChange}
              placeholder="Edge label"
            />
            <select
              value={edgeCriteria}
              onChange={handleCriteriaChange}
              className="edge-criteria-dropdown"
            >
              <option value="">Select Edge Criteria</option>
              {criteriaOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <button onClick={deleteEdge} className='btn-deleteEdge' >
                <Trash2 className="remove_svg_style" size={12} />
              </button>
              <button
                onClick={handleModalClose} className='btn-confirmEdge'
              >
                <Check className="remove_svg_style" size={14} />
              </button>
            </div>
          </div>
        </foreignObject >
      )}
    </>
  );
}