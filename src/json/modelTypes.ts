

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


export type ModelEdge = {
  model: string ;
  pk: number | string; // need further confirmation.
  fields: ModelEdgeFields;
  
}

export type ModelEdgeFields = {
  start: string;
  end: string;
}


export type ModelEdgeTriggerCriteria = {
  model: string,
  pk: number | string; // need further confirmation.
  fields: ModelEdgeTriggerCriteriaFields;
}

export type ModelEdgeTriggerCriteriaFields = {
  edge: number | string; // need further confirmation.
  choice?: string;
  [key: string]: any;
}
