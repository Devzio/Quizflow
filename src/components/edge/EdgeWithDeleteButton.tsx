import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

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

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
      />
      <foreignObject
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
            // onClick={(event) => onEdgeClick(event, id)}
            onClick={() => onEdgeClick()}
          >
            ×
          </button>
        </div>
      </foreignObject>
    </>
  );
}