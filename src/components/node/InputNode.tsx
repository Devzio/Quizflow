import { Handle, Position, useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';
// test push code
// const handleStyle = { left: 10 };

export function InputNode() {
  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);

  const [input, setInput] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLabel, setNodeLabel] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const { setNodes } = useReactFlow();

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
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className='inputNode'>
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
          <div className="modal-content" ref={modalRef} style={{ position: 'absolute', zIndex: 100 }}>
            <input
              type="text"
              value={nodeLabel}
              onChange={(e) => setNodeLabel(e.target.value)}
              placeholder="Node label"
            />
            <button onClick={() => {
              setIsModalOpen(false);
              setInput(nodeLabel);
            }}>
              <Check className="no-edge-style" size={16} />
            </button>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
      {/* <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} /> */}
    </>
  );
}