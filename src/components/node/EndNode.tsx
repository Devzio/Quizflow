import { Handle, Position, Node, NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';

type EndNode = Node<{ label: string }, 'text'>;

export function EndNode({ id }: NodeProps<EndNode>) {
  const { deleteElements } = useReactFlow();
  const onDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <button onClick={onDelete} className='remove-pill btn-delete'>
        <X size={16} />
      </button>
      <div className='textNode end-node'>
        <span>End</span>
      </div>
    </>
  );
}

