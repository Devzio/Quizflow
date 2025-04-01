import { addEdge, Background, Connection, Controls, Edge, MiniMap, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';
import { initialEdges, initialNodes } from './constants';
import { InputNode } from './components/node/InputNode';
import { TextNode } from './components/node/TextNode';
import StraightEdge from './components/edge/StraightEdge';
import { useState } from 'react';

const nodeTypes = {
  input: InputNode,
  text: TextNode,
  // output: OutputNode,
  // default: DefaultNode
};

const edgeTypes = {
  'straightEdge': StraightEdge
}

export default function App() {
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // Add this type (or use your existing Edge type if you have one)
  type MyEdgeType = Edge;
  const [edges, setEdges, onEdgesChange] = useEdgesState<MyEdgeType>(initialEdges);

  // Add this delete handler
  const onNodesDelete = useCallback(
    (deleted: any[]) => {
      setEdges((eds) => {
        const nodeIds = new Set(deleted.map((node) => node.id));
        return eds.filter((edge) => !nodeIds.has(edge.source) && !nodeIds.has(edge.target));
      });
      setNodes((nds) => nds.filter((node) => !deleted.some((delNode) => delNode.id === node.id)));
    },
    [setNodes, setEdges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) => addEdge({
        ...params,
        animated: true,
        type: "default"
      }, eds)),
    [setEdges],
  );
  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="wrapper__reactflow">
      <button
        onClick={toggleColorMode}
        className={`color-mode-toggle ${colorMode}`}
      >
        Toggle {colorMode === 'dark' ? 'Light' : 'Dark'} Mode
      </button>

      <ReactFlow
        colorMode={colorMode}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}  // Add this prop
        nodeTypes={nodeTypes}
        fitView
        edgeTypes={edgeTypes}
        style={{ backgroundColor: "#F7F9FB" }}
      >
        <Background gap={12} size={1} />
        <MiniMap zoomable pannable />
        <Controls />
      </ReactFlow>
    </div>
  );
}