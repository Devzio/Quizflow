import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

type EndNode = Node<{ label: string }, 'text'>;

export function EndNode({ id }: NodeProps<EndNode>) {
  const { deleteElements } = useReactFlow();
  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <button onClick={onDelete} className='btn-delete'>X</button>
      <div className='textNode'>
        <span>End</span>
      </div>
    </>
  );
}

