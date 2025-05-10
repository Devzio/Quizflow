import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, Trash2 } from 'lucide-react';
// test push code
// const handleStyle = { left: 10 };

export function InputNode({ id }: NodeProps) {
  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);

  const [input, setInput] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLabel, setNodeLabel] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { setNodes, deleteElements } = useReactFlow();

  function addNode() {
    setNodes((prevNodes) => [
      ...prevNodes,
      {
        id: nanoid(),
        type: 'text',
        position: { x: 0, y: 80 },
        data: {
          text: input
        },
      },
    ]);
    setInput("");
  }

  const onNodeContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === id
      }))
    );
    setIsModalOpen(true);
    setNodeLabel(input);
  };

  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeLabel(e.target.value);
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setInput(nodeLabel);
  }, [nodeLabel]);

  // This effect will handle clicks outside the modal
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only close if clicking outside both modal and node
      if (
        isModalOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as unknown as Node) &&
        !(nodeRef.current && nodeRef.current.contains(event.target as unknown as Node | null))
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
  }, [isModalOpen, handleModalClose]);

  // Auto-focus the input when modal opens
  useEffect(() => {
    if (isModalOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isModalOpen]);

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div
        className='inputNode'
        ref={nodeRef}
        onContextMenu={onNodeContextMenu}
      >
        {/* <label htmlFor="text">Text:</label> */}
        <input
          id="text"
          name="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="nodrag"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addNode();
            }
          }}
          onClick={() => {
            setIsModalOpen(true);
            setNodeLabel(input);
          }}
        />
        <button onClick={addNode}>Add</button>

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
                ref={inputRef}
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
      </div>
      <Handle type="source" position={Position.Bottom} />
      {/* <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} /> */}
    </>
  );
}