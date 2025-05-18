import { Handle, Position, Node as FlowNode, NodeProps, useReactFlow } from '@xyflow/react';
import { Check, Trash2, X } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { getAllCriteria, NodeCriterion, addChangeListener, removeChangeListener } from '../../utils/nodeCriteriaService';

type TextNode = FlowNode<{
  label: string,
  selectedCriteria?: NodeCriterion[]
}, 'text'>;

export function TextNode({ data, id }: NodeProps<TextNode>) {
  const { deleteElements, setNodes, setEdges, getEdges } = useReactFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeLabel, setNodeLabel] = useState(data.label);
  const [selectedCriteria, setSelectedCriteria] = useState<NodeCriterion[]>(
    Array.isArray(data?.selectedCriteria) ? data.selectedCriteria : []
  );
  const [criteriaOptions, setCriteriaOptions] = useState<NodeCriterion[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const pillContainerRef = useRef<HTMLDivElement>(null);

  // Function to refresh criteria options
  const refreshCriteriaOptions = useCallback(() => {
    console.log('Refreshing criteria options in node');
    setCriteriaOptions(getAllCriteria());
  }, []);
  // Load criteria options when component mounts and set up listener
  useEffect(() => {
    refreshCriteriaOptions();

    // Add listener for criteria changes
    addChangeListener(refreshCriteriaOptions);

    // Clean up listener when component unmounts
    return () => {
      removeChangeListener(refreshCriteriaOptions);
    };
  }, [refreshCriteriaOptions]);

  // Initialize selected criteria from data when mounting or when data changes
  useEffect(() => {
    if (data?.selectedCriteria && Array.isArray(data.selectedCriteria)) {
      setSelectedCriteria(data.selectedCriteria);
    }
  }, [data?.selectedCriteria]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const selectedCriterion = criteriaOptions.find(c => c.value === selectedValue);
    if (selectedCriterion && !selectedCriteria.some(c => c.value === selectedValue)) {
      const newSelectedCriteria = [...selectedCriteria, selectedCriterion];
      setSelectedCriteria(newSelectedCriteria);

      // Reset the select dropdown
      e.target.value = '';
    }
  };
  const handleRemoveCriterion = (criterionValue: string, event?: React.MouseEvent) => {
    // Stop event propagation to prevent the modal from closing
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    setSelectedCriteria(selectedCriteria.filter(c => c.value !== criterionValue));
  };

  const onNodeContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === id
      }))
    );
    setIsModalOpen(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeLabel(e.target.value);
  };
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: nodeLabel,
              selectedCriteria: selectedCriteria
            }
          };
        }
        return node;
      })
    );
  }, [id, nodeLabel, selectedCriteria, setNodes]);

  const onDelete = () => {
    const allEdges = getEdges();

    // 1. Find all edges connected to this node
    const incoming = allEdges.filter(e => e.target === id);
    const outgoing = allEdges.filter(e => e.source === id);

    // 2.  Keep only the edges that are not connected to this node
    const remainingEdges = allEdges.filter(e => e.source !== id && e.target !== id);

    // 3. Automatically reconnect parent → child edges
    const reconnected = incoming.flatMap(parent =>
      outgoing.map(child => ({
        id: `auto-${parent.source}-${child.target}`,
        source: parent.source,
        target: child.target,
        type: 'edgecustom', // ✅ use a registered custom edge type
        animated: true,
        data: {
          label: '(auto reconnected)',
          selectedCriteria: [], // ✅ default value to ensure modal works correctly
        },
      }))
    );

    // 4. edge list update
    setEdges([...remainingEdges, ...reconnected]);

    // 5. delete the selection node
    deleteElements({ nodes: [{ id }] });
  }; useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if clicked element or any of its parents has the classes that should be ignored
      const shouldIgnoreClick = (element: Element | null): boolean => {
        if (!element) return false;
        if (element === modalRef.current || element === nodeRef.current) return true;
        if (element.classList &&
          (element.classList.contains('criterion-pill') ||
            element.classList.contains('remove-pill') ||
            element.classList.contains('remove_svg_style'))) {
          return true;
        }
        return element.parentElement ? shouldIgnoreClick(element.parentElement) : false;
      };

      if (isModalOpen && !shouldIgnoreClick(event.target as Element)) {
        handleModalClose();
      }
    }

    if (isModalOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, handleModalClose]);

  return (
    <div
      ref={nodeRef}
      style={{ width: '100%', height: '100%' }}
      onContextMenu={onNodeContextMenu}
    >
      <Handle type="target" position={Position.Top} />      <div className='textNode'>
        <span>{data.label || "(No Question Set)"}</span>
      </div>      {isModalOpen && (
        <foreignObject
          width="300"
          height={selectedCriteria.length > 0 ? 200 : 120}
          x={-50}
          y={-40}
          className="node-modal"
        >
          <div className="modal-content_node" ref={modalRef}>
            <input
              type="text"
              value={nodeLabel}
              onChange={handleLabelChange}
              placeholder="Node label"
              className="nodrag nopan"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalClose();
                }
              }}
              autoFocus
            />

            {selectedCriteria.length > 0 && (
              <div className="pill-container" ref={pillContainerRef}>
                {selectedCriteria.map((criterion) => (
                  <div key={criterion.id} className="criterion-pill">
                    <span>{criterion.label}</span>                    <button
                      onClick={(e) => handleRemoveCriterion(criterion.value, e)}
                      className="remove-pill remove_svg_style nodrag nopan"
                    >
                      <X size={8} />
                    </button>
                  </div>
                ))}
              </div>
            )}            <select
              value=""
              onChange={handleSelectChange}
              className="node-criteria-dropdown nodrag nopan"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleModalClose();
                }
              }}
            >
              <option value="">Select Node Criteria</option>
              {criteriaOptions
                .filter(option => !selectedCriteria.some(c => c.value === option.value))
                .map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'end' }}>
              <button onClick={onDelete} className='btn-deleteEdge nodrag'>
                <Trash2 className="remove_svg_style" size={12} />
              </button>
              <button onClick={handleModalClose} className='btn-confirmEdge nodrag'>
                <Check className="remove_svg_style" size={14} />
              </button>
            </div>
          </div>
        </foreignObject>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}