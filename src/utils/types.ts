// src/types/index.ts

export type JsonNode = {
    id: string;
    type: string;
    data: { label: string };
    position: { x: number; y: number };
  };
  
  export type JsonEdge = {
    id: string;
    source: string;
    target: string;
    type: string;
    data?: { label?: string }; // 
  };