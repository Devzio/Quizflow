// components/edge/StraightEdge.tsx
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from '@xyflow/react';

function StraightEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  label,
  data,
}: any) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const finalLabel = label ?? data?.label;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />
      {finalLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'white',
              padding: 4,
              borderRadius: 4,
              fontSize: 10,
              border: '1px solid #ddd',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {finalLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default StraightEdge;