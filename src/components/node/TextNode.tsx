import { Handle, Position, Node, NodeProps, useReactFlow } from '@xyflow/react';
import { Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type TextNode = Node<{ label: string }, 'text'>;

export function TextNode({ data, id, selected }: NodeProps<TextNode>) {
  const { deleteElements, setNodes, addNodes } = useReactFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(data.label);
  const modalRef = useRef<HTMLDivElement>(null);

  const onEdit = () => {
    setIsModalOpen(true);
  };

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

    const contextMenu = document.createElement('div');
    contextMenu.style.position = 'absolute';
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.zIndex = '1000';
    contextMenu.style.backgroundColor = 'white';
    contextMenu.style.padding = '8px';
    contextMenu.style.borderRadius = '4px';
    contextMenu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

    const editOption = document.createElement('div');
    editOption.textContent = 'Edit';
    editOption.style.padding = '4px 8px';
    editOption.style.cursor = 'pointer';
    editOption.onclick = onEdit;

    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete';
    deleteOption.style.padding = '4px 8px';
    deleteOption.style.cursor = 'pointer';
    deleteOption.onclick = onDelete;

    contextMenu.appendChild(editOption);
    contextMenu.appendChild(deleteOption);
    document.body.appendChild(contextMenu);

    const closeMenu = () => {
      document.body.removeChild(contextMenu);
      document.removeEventListener('click', closeMenu);
    };

    document.addEventListener('click', closeMenu);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleModalClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <>
      <Handle type="target" position={Position.Top} />

      <div className='textNode' onContextMenu={onNodeContextMenu}>
        <span>{data.label}</span>
      </div>

      {isModalOpen && (
        <div className="modal-content" ref={modalRef} >
          <input
            type="text"
            value={nodeLabel}
            onChange={handleLabelChange}
            placeholder="Node label"
          />
          <button onClick={handleModalClose}>
            <Check className="no-edge-style" size={16} />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

