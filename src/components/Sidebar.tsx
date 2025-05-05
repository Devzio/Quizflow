import { useDnD } from './DnDContext';

interface SidebarProps {
  colorMode: string;
  onOpenCriteriaModal: () => void;
}

export function Sidebar({ colorMode, onOpenCriteriaModal }: SidebarProps) {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setType(nodeType);
  };

  // console.log(colorMode)

  return (
    <div className={`sidebar ${colorMode === 'dark' ? 'dark' : ''}`}>
      <div className="description">You can drag these nodes to the pane on the left.</div>
      <div
        className="dndnode start"
        onDragStart={(event) => onDragStart(event, 'start')}
        draggable
      >
        Start Node
      </div>

      <div
        className="dndnode text"
        onDragStart={(event) => onDragStart(event, 'text')}
        draggable
      >
        Question Node
      </div>

      <div
        className="dndnode end"
        onDragStart={(event) => onDragStart(event, 'end')}
        draggable
      >
        End Node
      </div>

      <div className="sidebar-buttons">
        <button className="sidebar-button" onClick={onOpenCriteriaModal}>
          Manage Edge Criteria
        </button>
      </div>
    </div>
  );
}