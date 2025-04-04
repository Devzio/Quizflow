import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

type TextNode = Node<{ label: string }, 'text'>;

export function TextNode({ data, id }: NodeProps<TextNode>) {
  const { deleteElements } = useReactFlow();
  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <button onClick={onDelete} className='btn-delete'>X</button>

      <div className='textNode'>

        <span>{data.label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

