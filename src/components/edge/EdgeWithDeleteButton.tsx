import { Background, BaseEdge, EdgeProps, EdgeText, getBezierPath } from '@xyflow/react';
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

  // const onEdgeClick = (event: React.MouseEvent, id: string) => {
  //   event.stopPropagation();
  //   // Edge deletion logic will be handled by parent component
  //   console.log(`Edge ${id} clicked for deletion`);
  // };
  const { deleteElements } = useReactFlow();

  const onEdgeClick = () => {
    deleteElements({ edges: [{ id }] });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [edgeLabel, setEdgeLabel] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleLabelDoubleClick = () => {
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
      {/* <foreignObject
        width="20"
        height="20"
        x={labelX - 10}
        y={labelY - 10}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div>
          <button
            className="edgebutton"
            onClick={() => onEdgeClick()}
          >
            ×
          </button>
        </div>
      </foreignObject> */}
      <EdgeText
        x={labelX}
        y={labelY}
        label={edgeLabel || 'No Answer'}
        className="edge-label"
        onClick={handleLabelDoubleClick}
      />
      {isModalOpen && (
        <foreignObject
          width="300"
          height="100"
          x={labelX - 100}
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