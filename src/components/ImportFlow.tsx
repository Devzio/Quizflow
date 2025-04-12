import React from 'react';
import { convertJson } from '../utils/convertJson'; // 변환 함수
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
        const converted = convertJson(raw); // ⚡️ 클라이언트 JSON → JasonJson 변환
        console.log('✅ 노드:', converted.nodes);
        console.log('✅ 엣지 (Yes/No 포함):', converted.edges);

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