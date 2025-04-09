import React from 'react';

interface ImportFlowProps {
  setNodes: (nodes: any[]) => void;
  setEdges: (edges: any[]) => void;
}

const ImportFlow: React.FC<ImportFlowProps> = ({ setNodes, setEdges }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.nodes || !data.edges) {
          alert("Invalid JSON structure. 'nodes' and 'edges' are required.");
          return;
        }
        setNodes(data.nodes);
        setEdges(data.edges);
      } catch (err) {
        alert("Failed to read JSON file.");
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