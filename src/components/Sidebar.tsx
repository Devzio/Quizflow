import { useDnD } from './DnDContext';


export function Sidebar(colorMode: string) {
  const [, setType] = useDnD();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    setType(nodeType);
  };

  console.log(colorMode)

  return (
    <div className={`sidebar ${colorMode === ' ' ? 'dark' : 'dark'}`}>
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
        Text Node
      </div>

      <div
        className="dndnode input"
        onDragStart={(event) => onDragStart(event, 'input')}
        draggable
      >
        Input Node
      </div>
      <div
        className="dndnode end"
        onDragStart={(event) => onDragStart(event, 'end')}
        draggable
      >
        End Node
      </div>
      {/* <button
        onClick={toggleColorMode}
        className={`color-mode-toggle ${colorMode}`}
      >
        {colorMode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
      </button> */}
    </div>
  );
}