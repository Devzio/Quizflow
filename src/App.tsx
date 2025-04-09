import { addEdge, Background, Connection, Controls, Edge, MiniMap, ReactFlowProvider, ReactFlow, useReactFlow, useEdgesState, useNodesState, reconnectEdge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef } from 'react';
import { initialEdges, initialNodes } from './constants';
import { InputNode } from './components/node/InputNode';
import { TextNode } from './components/node/TextNode';
import { StartNode } from './components/node/StartNode';
import StraightEdge from './components/edge/StraightEdge';
import EdgeWithDeleteButton from './components/edge/EdgeWithDeleteButton';
import { useState } from 'react';
import { Moon, Sun, Undo, Redo } from "lucide-react"
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
  const [history, setHistory] = useState<{ nodes: any[]; edges: any[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: any[]; edges: any[] }[]>([]);

  // disable context menu on right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);


  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  type MyEdgeType = Edge;
  const [edges, setEdges, onEdgesChange] = useEdgesState<MyEdgeType>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const updateHistory = useCallback(
    (newNodes: any[], newEdges: any[]) => {
      setHistory((h) => {
        const newHistory = h.slice(0, h.length);
        newHistory.push({ nodes: newNodes, edges: newEdges });
        return newHistory;
      });
      setFuture([]);
    },
    []
  );

  const onNodesChangeWithHistory = useCallback(
    (changes: any[]) => {
      const isPositionChange = changes.some(change => change.type === 'position' && change.dragging);

      if (isPositionChange) {
        // Skip history update during dragging - we'll update when drag ends
        onNodesChange(changes);
      } else {
        // For non-dragging changes or when drag ends, update history
        onNodesChange(changes);
        updateHistory(nodes, edges);
      }
    },
    [nodes, edges, onNodesChange, updateHistory]
  );

  const onEdgesChangeWithHistory = useCallback(
    (changes: any[]) => {
      onEdgesChange(changes);
      updateHistory(nodes, edges);
    },
    [nodes, edges, onEdgesChange, updateHistory]
  );

  const onConnectWithHistory = useCallback(
    (params: Edge | Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            type: "edgedelete",
          },
          eds
        )
      );
      updateHistory(nodes, edges);
    },
    [nodes, edges, setEdges, updateHistory]
  );

  const onNodesDeleteWithHistory = useCallback(
    (deleted: any[]) => {
      setEdges((eds) => {
        const nodeIds = new Set(deleted.map((node) => node.id));
        return eds.filter(
          (edge) => !nodeIds.has(edge.source) && !nodeIds.has(edge.target)
        );
      });
      setNodes((nds) =>
        nds.filter((node) => !deleted.some((delNode) => delNode.id === node.id))
      );
      updateHistory(nodes, edges);
    },
    [nodes, edges, setNodes, setEdges, updateHistory]
  );

  const onDropWithHistory = useCallback(
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
      updateHistory(nodes, edges);
    },
    [screenToFlowPosition, type, nodes, edges, setNodes, updateHistory]
  );

  const undo = useCallback(() => {
    if (history.length > 0) {
      const previous = history[history.length - 1];
      setFuture((f) => [
        {
          nodes: nodes,
          edges: edges,
        },
        ...f,
      ]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      setHistory((h) => h.slice(0, h.length - 1));
    }
  }, [history, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length > 0) {
      const next = future[0];
      setHistory((h) => [
        ...h,
        {
          nodes: nodes,
          edges: edges,
        },
      ]);
      setNodes(next.nodes);
      setEdges(next.edges);
      setFuture((f) => f.slice(1));
    }
  }, [future, nodes, edges, setNodes, setEdges]);


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
      <div className="reactflow-wrapper" ref={reactFlowWrapper}>
        <ReactFlow
          colorMode={colorMode}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeWithHistory}
          onEdgesChange={onEdgesChangeWithHistory}
          onConnect={onConnectWithHistory}
          onReconnect={onReconnect}
          onNodesDelete={onNodesDeleteWithHistory}
          onDrop={onDropWithHistory}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Background gap={12} size={1} />
          <MiniMap zoomable pannable />
          <Controls>
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="react-flow__controls-button"
              title="Undo"
            >
              <Undo className="fill-none" size={14} />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="react-flow__controls-button"
              title="Redo"
            >
              <Redo className="fill-none" size={14} />
            </button>
            <button
              onClick={toggleColorMode}
              className={`color-mode-toggle ${colorMode}`}
            >
              {colorMode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            </button>
          </Controls>
        </ReactFlow>

        {/* <button
          onClick={toggleColorMode}
          className={`color-mode-toggle ${colorMode}`}
        >
          {colorMode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button> */}
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