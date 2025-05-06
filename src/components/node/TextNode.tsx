import { Handle, Position, Node, NodeProps, useReactFlow } from '@xyflow/react';
import { Check, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type TextNode = Node<{ label: string }, 'text'>;

export function TextNode({ data, id }: NodeProps<TextNode>) {
  const { deleteElements, setNodes } = useReactFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(data.label);
  const modalRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const onDelete = () => {
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

  const handleModalClose = () => {
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
  };

  // This effect will handle clicks outside the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close if clicking outside both modal and node
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !(nodeRef.current && nodeRef.current.contains(event.target as Node))
      ) {
        handleModalClose();
      }
    }

    // Only add the event listener when the modal is open
    if (isModalOpen) {
      // Add event listeners for both mousedown (right-click) and click (left-click) events
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('click', handleClickOutside);
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isModalOpen]);

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
          <div
            className="modal-content_node"
            ref={modalRef}

          >
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
              <button
                onClick={handleModalClose} className='btn-confirmEdge nodrag'
              >
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

