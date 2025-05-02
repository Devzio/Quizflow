import { BaseEdge, EdgeProps, EdgeText, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

// Edge criteria options based on the provided Python enum
const EDGE_CRITERIA_OPTIONS = [
  { value: 'authenticated', label: 'Authenticated' },
  { value: 'unauthenticated', label: 'Unauthenticated' },
  { value: 'bool_yes', label: 'Boolean yes' },
  { value: 'bool_no', label: 'Boolean no' },
  { value: 'gender_female', label: 'Gender is female' },
  { value: 'gender_not_female', label: 'Gender is not female' },
  { value: 'age_gte', label: 'Age greater than or equal' },
  { value: 'age_lt', label: 'Age less than' },
  { value: 'list_value_set', label: 'List value set' },
  { value: 'list_value_not_set', label: 'List value not set' },
  { value: 'bmi_gte', label: 'BMI greater than or equal' },
  { value: 'bmi_lt', label: 'BMI less than' },
];

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
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const { deleteElements } = useReactFlow();

  const deleteEdge = () => {
    deleteElements({ edges: [{ id }] });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [edgeCriteria, setEdgeCriteria] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default context menu
    setIsModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdgeLabel(e.target.value);
  };

  const handleCriteriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEdgeCriteria(e.target.value);
  };

  const handleModalClose = () => {
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
  }, [isModalOpen]);

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
        label={edgeLabel || 'No Answer'}
        className="edge-label"
        onContextMenu={handleContextMenu}
      />
      {isModalOpen && (
        <foreignObject
          width="300"
          height="150"
          x={labelX - 75}
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
              {EDGE_CRITERIA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <button onClick={() => deleteEdge()} className='btn-deleteEdge'>
                <Trash2 className="no-edge-style" size={12} />
              </button>
              <button onClick={handleModalClose} className='btn-confirmEdge'>
                <Check className="no-edge-style" size={14} />
              </button>

            </div>
          </div>
        </foreignObject >
      )
      }
    </>
  );
}