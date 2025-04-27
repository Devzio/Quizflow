import React from 'react';
import { convertJson } from '../utils/import'; // 
import { Node, Edge } from '@xyflow/react';

interface ImportFlowProps {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>> | ((nodes: Node[]) => void);
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>> | ((edges: Edge[]) => void);
}

const ImportFlow: React.FC<ImportFlowProps> = ({ setNodes, setEdges }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        alert("❌ JSON parsing error.");
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <input type="file" accept=".json" onChange={handleFileUpload} />
    </div>
  );
};

export default ImportFlow;