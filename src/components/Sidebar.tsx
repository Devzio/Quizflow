import { useDnD } from './DnDContext';

interface SidebarProps {
  colorMode: string;
  onOpenCriteriaModal: () => void;
  onOpenNodeCriteriaModal?: () => void;
  hasStartNode?: boolean;
}

export function Sidebar({ colorMode, onOpenCriteriaModal, onOpenNodeCriteriaModal, hasStartNode = false }: SidebarProps) {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setType(nodeType);
  };


  return (
    <div className={`sidebar ${colorMode === 'dark' ? 'dark' : ''}`}>
      <div className="description">You can drag these nodes to the pane on the left.</div>
      <div
        className={`dndnode start ${hasStartNode ? 'disabled' : ''}`}
        onDragStart={(event) => {
          if (!hasStartNode) onDragStart(event, 'start');
        }}
        draggable={!hasStartNode}
        title={hasStartNode ? 'A Start Node already exists' : 'Start Node'}
      >
        Start Node {hasStartNode && <span>(Limited to 1)</span>}
      </div>

      <div
        className="dndnode text"
        onDragStart={(event) => onDragStart(event, 'text')}
        draggable
      >
        Question Node
      </div>

      {/* <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'text')}
        draggable
      >
        Input Node
      </div> */}

      <div
        className="dndnode end"
        onDragStart={(event) => onDragStart(event, 'end')}
        draggable
      >
        End Node
      </div>
      <p className="info-temp">
        Right click on a node or edge label to edit its content or delete it.
      </p>      <div className="sidebar-buttons">
        <button className="sidebar-button" onClick={onOpenCriteriaModal}>
          Manage Edge Criteria
        </button>
        {onOpenNodeCriteriaModal && (
          <button className="sidebar-button" onClick={onOpenNodeCriteriaModal}>
            Manage Node Criteria
          </button>
        )}
      </div>
    </div>
  );
}