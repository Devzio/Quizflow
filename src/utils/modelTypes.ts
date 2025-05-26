export type ModelQuestionnaireGraph = {
  model: string ;
  pk: string; 
  fields: ModelQuestionnaireGraphFields;
}
  
export type ModelQuestionnaireGraphFields = {
  name: string;
  start: string;
  end: string;
  status: string;
}

export type ModelNode = {
  model: string;
  pk: string;
  fields?: ModelNodeFields;
  reactflow?: ReactFlowNode;
}

export type ReactFlowNode = {
  positions: {
    x: number,
    y: number
  },
  selectedCriteria?: {
    id: string;
    value: string;
    label: string;
  }[]
}
  
export type ModelNodeFields = {
  question: string;
  parent_graph: string;
  [key: string]: any;
}


export type ModelQuestion = {
  model: string;
  pk: string;
  fields: ModelQuestionFields
}

export type ModelQuestionFields = {
  title: string | object
  type: string // (boolean / deadend)
  required: boolean
  auto_next: boolean
  [key: string]: any;
}

export type ModelQuestionTag = {
  model: string,
  pk: number
  fields?: ModelQuestionTagFields;
}

export type ModelQuestionTagFields = {
  choice: string,
  question: string,
  [key: string]: any;
}

export type ModelEdge = {
  model: string ;
  pk: number | string; 
  fields?: ModelEdgeFields;
  reactflow?: ReactFlowEdge;
}

export type ReactFlowEdge = {
  animated?: boolean;
  type?: string;
}

export type ModelEdgeFields = {
  start?: string;
  end?: string;
  [key: string]: any;
}


export type ModelEdgeTriggerCriteria = {
  model: string,
  pk: number | string; 
  fields: ModelEdgeTriggerCriteriaFields;
}

export type ModelEdgeTriggerCriteriaFields = {
  edge: number | string; 
  choice?: string;
  [key: string]: any;
}
