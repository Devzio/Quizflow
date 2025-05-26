import React, { useRef, useState } from 'react';
import { convertJson } from '../utils/import';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'react-toastify';

interface ToolBarProps {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>> | ((nodes: Node[]) => void);
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>> | ((edges: Edge[]) => void);
  saveToJsonFile?: (name: string) => void;
  exportToJsonFile?: (name: string) => void;
  colorMode?: 'light' | 'dark';
  fitView?: () => void;
  hasStartNode?: boolean;
}

type SaveFunction = (name: string) => void;

const ToolBar: React.FC<ToolBarProps> = ({
  setNodes,
  setEdges,
  saveToJsonFile,
  exportToJsonFile,
  colorMode = 'light',
  fitView,
  hasStartNode = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionnaireName, setQuestionnaireName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const originalName = questionnaireName;
    const fileName = file.name;

    if (file.name && file.name.endsWith('.json')) {
      const nameWithoutExtension = file.name.endsWith('.flow.json') ? file.name.substring(0, file.name.length - 10) : file.name.substring(0, file.name.length - 5);
      if (nameWithoutExtension) {
        setQuestionnaireName(nameWithoutExtension);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        const converted = convertJson(raw);

        // ✅ Begin patch: enforce edge type and default selectedCriteria
        const convertedEdgesWithType = converted.edges.map(e => ({
          ...e,
          type: 'edgecustom', // ✅ Force edge type to 'edgecustom'
          data: {
            ...e.data as Record<string, unknown>,
            selectedCriteria: (e.data && (e.data as Record<string, unknown>).selectedCriteria) ?? [], // ✅ Ensure default selectedCriteria value
          },
        }));

        setNodes(converted.nodes);
        setEdges(convertedEdgesWithType); // ✅ Use patched edge data

        if (fitView) {
          setTimeout(() => fitView(), 100);
        }

        toast.success(`Flow "${fileName}" successfully opened`);
      } catch (err) {
        setQuestionnaireName(originalName);
        toast.error("Error opening flow");
        console.error(err);
      }
    };

    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    color: colorMode === 'dark' ? '#f0f0f0' : 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const inputStyle = {
    padding: '0.5rem',
    border: colorMode === 'dark' ? '1px solid #666' : '1px solid #9c9c9c',
    borderRadius: '4px',
    flexGrow: 1,
    marginRight: 'auto',
    maxWidth: '300px',
    backgroundColor: colorMode === 'dark' ? '#333' : '#fff',
    color: colorMode === 'dark' ? '#f0f0f0' : 'inherit',
  };

  const handleSaveFlow = (saveFn: SaveFunction) => {
    if (!questionnaireName || questionnaireName.trim() === "") {
      toast.error("Please set a flow name before saving");
      return;
    }
    if (!hasStartNode) {
      toast.warn("You must have at least one Start Node in your flow to save or export.");
      return;
    }
    if (saveFn == saveToJsonFile) {
      saveToJsonFile(questionnaireName);
      toast.success(`Flow saved as ${questionnaireName}.flow.json`);
    }
    if (saveFn == exportToJsonFile) {
      exportToJsonFile(questionnaireName);
      toast.success(`Flow saved as ${questionnaireName}.json`);
    }
  };

  return (
    <div
      className={`toolbar ${colorMode === 'dark' ? 'dark' : ''}`}
    >
      <span style={{ fontWeight: 'bold', color: colorMode === 'dark' ? '#fff' : '#222' }}>
        Flow Name:
      </span>
      <input
        type="text"
        placeholder="Enter flow name..."
        value={questionnaireName}
        onChange={(e) => setQuestionnaireName(e.target.value)}
        style={inputStyle as React.CSSProperties}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      <button
        onClick={triggerFileInput}
        style={{
          ...buttonStyle,
          backgroundColor: colorMode === 'dark' ? '#9d9f00' : '#cbc818',
        } as React.CSSProperties}
      >
        Open Flow
      </button>

      {saveToJsonFile && (
        <button
          onClick={() => handleSaveFlow(saveToJsonFile)}
          style={{
            ...buttonStyle,
            backgroundColor: colorMode === 'dark' ? '#388e3c' : '#4CAF50',
          } as React.CSSProperties}
        >
          Save Flow
        </button>
      )}

      {exportToJsonFile && (
        <button
          onClick={() => handleSaveFlow(exportToJsonFile)}
          style={{
            ...buttonStyle,
            backgroundColor: colorMode === 'dark' ? '#1976d2' : '#2196F3',
          } as React.CSSProperties}
        >
          Export Flow
        </button>
      )}
    </div>
  );
};

export default ToolBar;