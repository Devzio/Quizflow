// src/types/index.ts

export type JasonNode = {
    id: string;
    type: string;
    data: { label: string };
    position: { x: number; y: number };
  };
  
  export type JasonEdge = {
    id: string;
    source: string;
    target: string;
    type: string;
    data?: { label?: string }; // label을 위한 필드
  };