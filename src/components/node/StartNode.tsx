import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

type StartNode = Node<{ label: string }, 'text'>;

export function StartNode({ id }: NodeProps<StartNode>) {
  const { deleteElements } = useReactFlow();
  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };
  return (
    <>
      <button onClick={onDelete} className='btn-delete'>X</button>
      <div className='textNode'>
        <span>Start</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

