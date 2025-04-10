import { addEdge, Background, Connection, Controls, Edge, MiniMap, ReactFlowProvider, ReactFlow, useReactFlow, useEdgesState, useNodesState, reconnectEdge } from '@xyflow/react';
import ImportFlow from './components/ImportFlow';
import { v4 as uuidv4 } from 'uuid';

import '@xyflow/react/dist/style.css';
import { useCallback, useRef } from 'react';
import { initialEdges, initialNodes } from './constants';
import { InputNode } from './components/node/InputNode';
import { TextNode } from './components/node/TextNode';
import { StartNode } from './components/node/StartNode';
import StraightEdge from './components/edge/StraightEdge';
import EdgeWithDeleteButton from './components/edge/EdgeWithDeleteButton';
import { useState } from 'react';
import { Moon, Sun } from "lucide-react"
import { Sidebar } from './components/Sidebar';
import { DnDProvider, useDnD } from './components/DnDContext';
import { EndNode } from './components/node/EndNode';



const nodeTypes = {
  input: InputNode,
  text: TextNode,
  start: StartNode,
  end: EndNode
  // output: OutputNode,
  // default: DefaultNode
};

const edgeTypes = {
  'straightEdge': StraightEdge,
  'edgedelete': EdgeWithDeleteButton
}

const DnDFlow = () => {
  const reactFlowWrapper = useRef(null);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  type MyEdgeType = Edge;
  const [edges, setEdges, onEdgesChange] = useEdgesState<MyEdgeType>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [],
  );


  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
        id: uuidv4(),
        animated: true,
        type: "edgedelete"
      }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: uuidv4(),
        type,
        position,
        data: { label: type === 'text' ? 'New Text' : '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type]
  );

  return (
    <div className="dndflow">
      <ImportFlow setNodes={setNodes} setEdges={setEdges} />
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          colorMode={colorMode}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onNodesDelete={onNodesDelete}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Background gap={12} size={1} />
          <MiniMap zoomable pannable />
          <Controls />
        </ReactFlow>
        <button
          onClick={toggleColorMode}
          className={`color-mode-toggle ${colorMode}`}
        >
          {colorMode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>
      <Sidebar colorMode={colorMode} />
    </div>
  );
};

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);