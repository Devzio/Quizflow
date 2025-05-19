import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export default function CurvedEdge({
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
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.6, // Increase the curve (default is 0.25)
  });

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
    // style={{ 
    //   ...style,
    //   strokeWidth: 2,
    //   stroke: 'rgba(64, 64, 200, 0.8)',
    // }}
    />
  );
}