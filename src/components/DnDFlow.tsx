import { addEdge, Background, Connection, Controls, Edge, MiniMap, ReactFlow, useReactFlow, useEdgesState, useNodesState, reconnectEdge, Node, NodeChange, EdgeChange, XYPosition, NodeTypes, EdgeTypes, applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import ToolBar from './ToolBar';
import { v4 as uuidv4 } from 'uuid';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef, useState, useEffect } from 'react';
import { initialEdges, initialNodes } from '../constants';
import { InputNode } from './node/InputNode';
import { TextNode } from './node/TextNode';
import { StartNode } from './node/StartNode';
import StraightEdge from './edge/StraightEdge';
import EdgeWithDeleteButton from './edge/EdgeWithDeleteButton';
import { Moon, Sun, Undo, Redo } from "lucide-react";
import { Sidebar } from './Sidebar';
import { useDnD } from './DnDContext';
import { EndNode } from './node/EndNode';
import React, { ReactNode } from 'react';
import { ConvertExport } from '../utils/export'
import { GenerateRandomPk } from '../utils/utils';


// Define custom node and edge types
const nodeTypes: NodeTypes = {
  input: InputNode,
  text: TextNode,
  start: StartNode,
  end: EndNode,
};

const edgeTypes: EdgeTypes = {
  'straightEdge': StraightEdge,
  'edgedelete': EdgeWithDeleteButton
};

// Define more specific node type for our app
type CustomNode = {
  id: string;
  type: string;
  position: XYPosition;
  data: { label: string | ReactNode };
};

// Define more specific edge type for our app
type CustomEdge = Edge & {
  animated?: boolean;
  type?: string;
};

const DnDFlow = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light');
  const [history, setHistory] = useState<{ nodes: CustomNode[]; edges: CustomEdge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: CustomNode[]; edges: CustomEdge[] }[]>([]);

  // disable context menu on right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const [nodes, setNodes] = useNodesState<Node>(initialNodes);
  const [edges, setEdges] = useEdgesState<Edge>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const updateHistory = useCallback(
    (newNodes: CustomNode[], newEdges: CustomEdge[]) => {
      setHistory((h) => {
        const newHistory = h.slice(0, h.length);
        newHistory.push({
          nodes: JSON.parse(JSON.stringify(newNodes)),
          edges: JSON.parse(JSON.stringify(newEdges))
        });
        return newHistory;
      });
      setFuture([]);
    },
    []
  );

  const onNodesChangeWithHistory = useCallback(
    (changes: NodeChange[]) => {
      const isPositionChange = changes.some(change => change.type === 'position' && ('dragging' in change) && change.dragging);

      if (isPositionChange) {
        // Skip history update during dragging - we'll update when drag ends
        // Use applyNodeChanges to safely apply changes to nodes
        setNodes(prevNodes => applyNodeChanges(changes as unknown as NodeChange<typeof prevNodes[0]>[], prevNodes));
      } else {
        // For non-dragging changes or when drag ends, update history
        setNodes(prevNodes => {
          const result = applyNodeChanges(changes as unknown as NodeChange<typeof prevNodes[0]>[], prevNodes);
          // Schedule a history update after the state updates
          setTimeout(() => updateHistory(result as unknown as CustomNode[], edges as unknown as CustomEdge[]), 0);
          return result;
        });
      }
    },
    [edges, setNodes, updateHistory]
  );

  const onEdgesChangeWithHistory = useCallback(
    (changes: EdgeChange[]) => {
      setEdges(prevEdges => {
        const updatedEdges = applyEdgeChanges(changes as unknown as EdgeChange<typeof prevEdges[0]>[], prevEdges);
        // Schedule a history update after the state updates
        setTimeout(() => updateHistory(nodes as unknown as CustomNode[], updatedEdges as unknown as CustomEdge[]), 0);
        return updatedEdges;
      });
    },
    [nodes, setEdges, updateHistory]
  );

  const onConnectWithHistory = useCallback(
    (params: Edge | Connection) => {
      setEdges(prevEdges => {
        const newEdges = addEdge(
          {
            ...params,
            id: GenerateRandomPk().toString(),
            animated: true,
            type: "edgedelete",
          },
          prevEdges
        ) as typeof prevEdges;

        // Schedule a history update after the state updates
        setTimeout(() => updateHistory(nodes as CustomNode[], newEdges as CustomEdge[]), 0);
        return newEdges;
      });
    },
    [nodes, setEdges, updateHistory]
  );

  const onNodesDeleteWithHistory = useCallback(
    (deleted: Node[]) => {
      setEdges(prevEdges => {
        const nodeIds = new Set(deleted.map((node) => node.id));
        const newEdges = prevEdges.filter(
          (edge) => !nodeIds.has(edge.source) && !nodeIds.has(edge.target)
        );
        return newEdges;
      });

      setNodes(prevNodes => {
        const newNodes = prevNodes.filter((node) => !deleted.some((delNode) => delNode.id === node.id));
        // Schedule a history update after both state updates
        setTimeout(() => {
          setEdges(currentEdges => {
            updateHistory(newNodes as CustomNode[], currentEdges as CustomEdge[]);
            return currentEdges;
          });
        }, 0);
        return newNodes;
      });
    },
    [updateHistory, setNodes, setEdges]
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
        data: { label: type === 'text' ? 'New Text' : "" },
      };

      setNodes(prevNodes => {
        // Cast the newNode to the same type as prevNodes[0] to ensure type compatibility
        const typedNewNode = {
          ...newNode,
          data: {
            label: type === 'text' ? 'New Text' : ""
          }
        } as typeof prevNodes[0];

        const newNodes = [...prevNodes, typedNewNode];
        // Schedule a history update after the state updates
        setTimeout(() => updateHistory(newNodes as unknown as CustomNode[], edges as unknown as CustomEdge[]), 0);
        return newNodes;
      });
    },
    [screenToFlowPosition, type, edges, updateHistory, setNodes]
  );

  const undo = useCallback(() => {
    if (history.length > 0) {
      const previous = history[history.length - 1];

      setFuture(prevFuture => [
        {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        },
        ...prevFuture,
      ]);

      // Use type assertions with specific types instead of any
      setNodes(previous.nodes as CustomNode[] as typeof nodes);
      setEdges(previous.edges as CustomEdge[] as typeof edges);
      setHistory(prevHistory => prevHistory.slice(0, prevHistory.length - 1));
    }
  }, [history, nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (future.length > 0) {
      const next = future[0];

      setHistory(prevHistory => [
        ...prevHistory,
        {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        },
      ]);

      // Use type assertions with specific types instead of any
      setNodes(next.nodes as CustomNode[] as typeof nodes);
      setEdges(next.edges as CustomEdge[] as typeof edges);
      setFuture(prevFuture => prevFuture.slice(1));
    }
  }, [future, nodes, edges, setNodes, setEdges]);

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) =>
      setEdges(els => reconnectEdge(oldEdge, newConnection, els) as typeof els),
    [setEdges],
  );

  const toggleColorMode = () => {
    setColorMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const saveToJsonFile = (name: string) => {
    // Use the provided questionnaire name from ToolBar
    const exportdata = ConvertExport(name, nodes, edges);
    const data = JSON.stringify(JSON.parse(exportdata), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Use the provided name for the downloaded file
    const safeFileName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeFileName}.json`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="dndflow">
      <div className='reactflow-layout'>
        <ToolBar
          setNodes={setNodes}
          setEdges={setEdges}
          saveToJsonFile={saveToJsonFile}
          colorMode={colorMode}
        />
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
        </div>
      </div>
      <Sidebar colorMode={colorMode} />
    </div>
  );
};

export default DnDFlow;