import { BaseEdge, EdgeProps, EdgeText, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { Check, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';

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

  const onEdgeClick = () => {
    deleteElements({ edges: [{ id }] });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default context menu
    setIsModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdgeLabel(e.target.value);
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
          height="100"
          x={labelX - 75}
          y={labelY - 50}
          className="edge-modal"
        >
          <div className="modal-content" ref={modalRef}>
            <input
              type="text"
              value={edgeLabel}
              onChange={handleLabelChange}
              placeholder="Edge label"
            />
            <button onClick={handleModalClose} >
              <Check className="no-edge-style" size={16} />
            </button>
            <button
              onClick={() => onEdgeClick()}
            >
              <Trash2 className="no-edge-style" size={14} />
            </button>
          </div>
        </foreignObject >
      )
      }
    </>
  );
}