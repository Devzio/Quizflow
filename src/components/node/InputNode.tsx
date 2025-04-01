import { Handle, Position, useReactFlow } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useState } from 'react';
// test push code
// const handleStyle = { left: 10 };

export function InputNode() {
  // const onChange = useCallback((evt) => {
  //   console.log(evt.target.value);
  // }, []);

  const [input, setInput] = useState("")
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
        />
        <button onClick={addNode}>Add</button>
      </div>
      <Handle type="source" position={Position.Bottom} />
      {/* <Handle type="source" position={Position.Bottom} id="b" style={handleStyle} /> */}
    </>
  );
}