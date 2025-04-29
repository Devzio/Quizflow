import React, { useRef, useState } from 'react';
import { convertJson } from '../utils/import'; // 
import { Node, Edge } from '@xyflow/react';

interface ToolBarProps {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>> | ((nodes: Node[]) => void);
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>> | ((edges: Edge[]) => void);
  saveToJsonFile?: (name: string) => void; // Modified to accept questionnaire name
  questionnaireName?: string;
}

const ToolBar: React.FC<ToolBarProps> = ({ setNodes, setEdges, saveToJsonFile, questionnaireName: initialName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionnaireName, setQuestionnaireName] = useState<string>(initialName || "Flow Name");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      } catch (err) {
        alert("❌ JSON parsing error. ❌");
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const buttonStyle = {
    padding: '0.5rem 1rem',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const inputStyle = {
    padding: '0.5rem',
    border: '1px solid #9c9c9c',
    borderRadius: '4px',
    flexGrow: 1,
    marginRight: 'auto',
    maxWidth: '250px',
  };

  const handleSaveFlow = () => {
    if (saveToJsonFile) {
      // Pass the questionnaire name to the parent component
      saveToJsonFile(questionnaireName);
    }
  };

  return (
    <div style={{ padding: '0.5rem', display: 'flex', gap: '10px', borderBottomColor: 'grey', borderBottomWidth: '1px', borderBottomStyle: 'solid' }}>
      <input
        type="text"
        placeholder="Flow name"
        value={questionnaireName}
        onChange={(e) => setQuestionnaireName(e.target.value)}
        style={inputStyle}
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
          backgroundColor: '#2196F3',
        }}
      >
        Open Flow
      </button>

      {saveToJsonFile && (
        <button
          onClick={handleSaveFlow}
          style={{
            ...buttonStyle,
            backgroundColor: '#4CAF50',
          }}
        >
          Save Flow
        </button>
      )}
    </div>
  );
};

export default ToolBar;