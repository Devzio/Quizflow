import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { useState } from 'react';

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

  const handleLabelDoubleClick = () => {
    setIsModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEdgeLabel(e.target.value);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

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
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="edge-label"
        onDoubleClick={handleLabelDoubleClick}
      >
        {edgeLabel || 'No Answer'}
      </text>
      {isModalOpen && (
        <foreignObject
          width="200"
          height="100"
          x={labelX - 100}
          y={labelY - 50}
          className="edge-modal"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="modal-content">
            <input
              type="text"
              value={edgeLabel}
              onChange={handleLabelChange}
              placeholder="Edge label"
            />
            <button onClick={handleModalClose}>Save</button>
            <button
              onClick={() => onEdgeClick()}
            >
              Delete
            </button>
          </div>
        </foreignObject>
      )}
    </>
  );
}