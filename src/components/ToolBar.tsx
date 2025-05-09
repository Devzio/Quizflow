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
  fitView?: () => void; // Add fitView function prop
}

type SaveFunction = (name: string) => void;

const ToolBar: React.FC<ToolBarProps> = ({
  setNodes,
  setEdges,
  saveToJsonFile,
  exportToJsonFile,
  colorMode = 'light',
  fitView // Destructure the fitView prop
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionnaireName, setQuestionnaireName] = useState<string>("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the original questionnaire name to restore it in case of an error
    const originalName = questionnaireName;

    // Store the file name to use in success message
    const fileName = file.name;

    // Extract filename without extension to use as questionnaire name
    if (file.name && file.name.endsWith('.json')) {
      const nameWithoutExtension = file.name.substring(0, file.name.length - 5);
      if (nameWithoutExtension) {
        setQuestionnaireName(nameWithoutExtension);
      }
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = JSON.parse(event.target?.result as string);
        const converted = convertJson(raw);
        console.log('✅ node:', converted.nodes);
        console.log('✅ edge:', converted.edges);
        console.log('✅ graph:', {
          model: converted.model,
          pk: converted.pk,
          ...converted.fields
        });

        setNodes(converted.nodes);
        setEdges(converted.edges);

        // Trigger fitView after setting nodes and edges
        if (fitView) {
          setTimeout(() => fitView(), 100); // Small delay to ensure nodes are rendered
        }

        toast.success(`Flow "${fileName}" successfully opened`);
      } catch (err) {
        // Restore the original questionnaire name on error
        setQuestionnaireName(originalName);
        toast.error("Error opening flow");
        console.error(err);
      }
    };

    reader.readAsText(file);

    // Reset the file input so the same file can be selected again
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
    // Validate that the questionnaire name is not empty
    if (!questionnaireName || questionnaireName.trim() === "") {
      toast.error("Please set a flow name before saving");
      return;
    }

    if (saveFn == saveToJsonFile) {
      saveToJsonFile(questionnaireName);
      toast.success(`Flow saved as ${questionnaireName}.json`);
    }
    if (saveFn == exportToJsonFile) {
      exportToJsonFile(questionnaireName);
      toast.success(`Flow saved as ${questionnaireName}.flow.json`);
    }
  };

  return (
    <div
      className={`toolbar ${colorMode === 'dark' ? 'dark' : ''}`}
      style={{
        padding: '0.5rem',
        display: 'flex',
        gap: '10px',
        borderBottomColor: colorMode === 'dark' ? '#444' : 'grey',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        backgroundColor: colorMode === 'dark' ? '#222' : '#fff',
        alignItems: 'center',
      }}
    >
      <span className={`${colorMode === 'dark' ? 'dark' : ''}`} style={{ fontWeight: 'bold', color: colorMode === 'dark' ? '#fff' : '#222', }}>Flow Name:</span>
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