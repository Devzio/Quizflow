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
import CustomEdge from './edge/CustomEdge';
import CurvedEdge from './edge/CurvedEdge';
import { Moon, Sun, Undo, Redo } from "lucide-react";
import { Sidebar } from './Sidebar';
import { useDnD } from './DnDContext';
import { EndNode } from './node/EndNode';
import React, { ReactNode } from 'react';
import { ConvertExport, ConvertExportWithReactFlowData } from '../utils/export'
import { GenerateRandomPk, SaveJsonFile } from '../utils/utils';
import EdgeCriteriaModal from './EdgeCriteriaModal';
import NodeCriteriaModal from './NodeCriteriaModal';

// Define custom node and edge types
const nodeTypes: NodeTypes = {
  input: InputNode,
  text: TextNode,
  start: StartNode,
  end: EndNode,
};

const edgeTypes: EdgeTypes = {
  'straightEdge': StraightEdge,
  'edgecustom': CustomEdge,
  'curved': CurvedEdge
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
  const [colorMode, setColorMode] = useState<'light' | 'dark'>('light'); const [history, setHistory] = useState<{ nodes: CustomNode[]; edges: CustomEdge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: CustomNode[]; edges: CustomEdge[] }[]>([]);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);
  const [showNodeCriteriaModal, setShowNodeCriteriaModal] = useState(false);
  const reactFlowInstance = useReactFlow();

  const [nodes, setNodes] = useNodesState<Node>(initialNodes);

  // Check if a start node already exists
  const hasStartNode = nodes.some(node => node.type === 'start');

  // disable context menu on right click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);
  const [edges, setEdges] = useEdgesState<Edge>(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  // Function to fit view - can be passed to child components
  const fitViewToContents = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: false });
  }, [reactFlowInstance]);

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
        // Get the source node to determine if it's a start node
        const sourceNode = nodes.find(node => node.id === params.source);
        const isStartNode = sourceNode?.type === 'start';

        const newEdges = addEdge(
          {
            ...params,
            id: GenerateRandomPk().toString(),
            animated: true,
            // Use curved edge type if connection is from a start node, otherwise use custom edge
            type: isStartNode ? "curved" : "edgecustom",
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
            label: type === 'text' ? '' : ""
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

  // const saveToJsonFile = (name: string) => {
  //   const exportdata = ConvertExport(name, nodes, edges);
  //   SaveJsonFile(name, exportdata)
  // };



  const saveToJsonFile = (name: string) => {
    // Save File
    const exportdata = ConvertExportWithReactFlowData(name, nodes, edges);
    SaveJsonFile(name + ".flow", exportdata)
  }
  const exportToJsonFile = (name: string) => {
    // Export File
    const exportdata = ConvertExport(name, nodes, edges);
    SaveJsonFile(name, exportdata)
  }
  const handleOpenCriteriaModal = () => {
    setShowCriteriaModal(true);
  };

  const handleCloseCriteriaModal = () => {
    setShowCriteriaModal(false);
  };

  const handleOpenNodeCriteriaModal = useCallback(() => {
    setShowNodeCriteriaModal(true);
  }, []);

  const handleCloseNodeCriteriaModal = useCallback(() => {
    setShowNodeCriteriaModal(false);
  }, []);

  // Function to update edge types based on source nodes
  const updateEdgeTypes = useCallback(() => {
    setEdges(prevEdges => {
      let edgesChanged = false;

      const updatedEdges = prevEdges.map(edge => {
        // Find the source node
        const sourceNode = nodes.find(node => node.id === edge.source);
        const isStartNode = sourceNode?.type === 'start';

        // If this is an edge from a start node and it's not already a curved edge
        if (isStartNode && edge.type !== 'curved') {
          edgesChanged = true;
          return {
            ...edge,
            type: 'curved'
          };
        }

        return edge;
      });

      // Only return the new array if changes were made
      return edgesChanged ? updatedEdges : prevEdges;
    });
  }, [nodes, setEdges]);

  // Call updateEdgeTypes when nodes change
  useEffect(() => {
    updateEdgeTypes();
  }, [nodes, updateEdgeTypes]);

  return (
    <div className="dndflow">
      <div className='reactflow-layout'>
        <ToolBar
          setNodes={setNodes}
          setEdges={setEdges}
          saveToJsonFile={saveToJsonFile}
          exportToJsonFile={exportToJsonFile}
          colorMode={colorMode}
          fitView={fitViewToContents} // Pass the fitView function to ToolBar
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
        </div>      </div>
      <Sidebar
        colorMode={colorMode}
        onOpenCriteriaModal={handleOpenCriteriaModal}
        onOpenNodeCriteriaModal={handleOpenNodeCriteriaModal}
        hasStartNode={hasStartNode}
      />

      {/* Edge Criteria Modal */}
      <EdgeCriteriaModal
        isOpen={showCriteriaModal}
        onClose={handleCloseCriteriaModal}
      />

      {/* Node Criteria Modal */}
      <NodeCriteriaModal
        isOpen={showNodeCriteriaModal}
        onClose={handleCloseNodeCriteriaModal}
      />
    </div>
  );
};

export default DnDFlow;