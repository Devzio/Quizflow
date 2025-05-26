import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

type StartNode = Node<{ label: string }, 'text'>;

export function StartNode({ id }: NodeProps<StartNode>) {
  const { deleteElements } = useReactFlow();
  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };
  return (
    <>
      <button onClick={onDelete} className='remove-pill btn-delete'>
        <X size={16} />
      </button>
      <div className='textNode start-node'>
        <span>Start</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
}

