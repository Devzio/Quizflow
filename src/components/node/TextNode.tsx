import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

type TextNode = Node<{ text: string }, 'text'>;

export function TextNode({ data, id }: NodeProps<TextNode>) {
  const { deleteElements } = useReactFlow();
  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className='textNode'>
        <button onClick={onDelete} className='btn-delete'>X</button>

        <span>{data.text}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

