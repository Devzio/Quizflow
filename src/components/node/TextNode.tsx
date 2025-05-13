import { Handle, Position, Node as FlowNode, NodeProps, useReactFlow } from '@xyflow/react';
import { Check, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

type TextNode = FlowNode<{ label: string }, 'text'>;

export function TextNode({ data, id }: NodeProps<TextNode>) {
  const { deleteElements, setNodes, setEdges, getEdges } = useReactFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(data.label);
  const modalRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const onDelete = () => {
    const allEdges = getEdges();

    // 1. Find all edges connected to this node
    const incoming = allEdges.filter(e => e.target === id);
    const outgoing = allEdges.filter(e => e.source === id);

    // 2.  Keep only the edges that are not connected to this node
    const remainingEdges = allEdges.filter(e => e.source !== id && e.target !== id);

    // 3. Automatically reconnect parent → child edges
    const reconnected = incoming.flatMap(parent =>
      outgoing.map(child => ({
        id: `auto-${parent.source}-${child.target}`,
        source: parent.source,
        target: child.target,
        type: 'edgecustom', // ✅ use a registered custom edge type
        animated: true,
        data: {
          label: '(auto reconnected)',
          selectedCriteria: [], // ✅ default value to ensure mordal works correctly
        },
      }))
    );

    // 4. edge list update
    setEdges([...remainingEdges, ...reconnected]);

    // 5. delete the selection node
    deleteElements({ nodes: [{ id }] });
  };

  const onNodeContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === id
      }))
    );
    setIsModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeLabel(e.target.value);
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeLabel
            }
          };
        }
        return node;
      })
    );
  }, [id, nodeLabel, setNodes]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !(nodeRef.current && nodeRef.current.contains(event.target as Node))
      ) {
        handleModalClose();
      }
    }

    if (isModalOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isModalOpen, handleModalClose]);

  return (
    <div
      ref={nodeRef}
      style={{ width: '100%', height: '100%' }}
      onContextMenu={onNodeContextMenu}
    >
      <Handle type="target" position={Position.Top} />

      <div className='textNode'>
        <span>{data.label || "(No Question Set)"}</span>
      </div>

      {isModalOpen && (
        <foreignObject
          width="300"
          height="100"
          x={-50}
          y={-40}
          className="node-modal"
        >
          <div className="modal-content_node" ref={modalRef}>
            <input
              type="text"
              value={nodeLabel}
              onChange={handleLabelChange}
              placeholder="Node label"
              className="nodrag nopan"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalClose();
                }
              }}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <button onClick={onDelete} className='btn-deleteEdge nodrag'>
                <Trash2 className="remove_svg_style" size={12} />
              </button>
              <button onClick={handleModalClose} className='btn-confirmEdge nodrag'>
                <Check className="remove_svg_style" size={14} />
              </button>
            </div>
          </div>
        </foreignObject>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}