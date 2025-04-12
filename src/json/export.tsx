import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from '@xyflow/react';


type JsonQuestionnaireGraph = {
  model: string ;
  pk: string; 
  fields: JsonQuestionnaireGraphFields;
}

type JsonQuestionnaireGraphFields = {
  name: string;
  start: string;
  end: string;
  status: string;
  // todo: is this field able to be passed down?
}


export function ConvertExport(flowName: string, nodes: Node[], edges: Edge[]): string {
  
  const parentGraph:JsonQuestionnaireGraph = { // this migth need to be generate after import or during the design.
    model: "questionnaire.questionnairegraph",
    pk: uuidv4(),
    fields: {
      name: flowName, 
      start: "",
      end: "",
      status: "active" 
    } as JsonQuestionnaireGraphFields
  }
  
  // convertNode(parentGraph, nodes);
  



  const edgeList:(JsonEdge | JsonEdgeTriggerCriteria)[] = [];
  edges.forEach((e: Edge) => {
    const ret = convertEdge(e)
    if (ret.edgeTC) {
      edgeList.push(ret.edgeTC);
    }
    
    edgeList.push(ret._edge);
  });

  const data = JSON.stringify({ edgeList }, null, 2);


  return data
}



function convertNode(nodes: Node) {
    
  };


type JsonEdge = {
  model: string ;
  pk: number | string; // need further confirmation.
  fields: JsonEdgeFields;
  
}

type JsonEdgeFields = {
  start: string;
  end: string;
}

function convertEdge(edge: Edge) {
  const _edge:JsonEdge  = {
    model: "questionnaire.edge",
    pk: edge.id,
    fields: {
      start: edge.source,
      end: edge.target,
    } as JsonEdgeFields
  };

  let edgeTC = null;
  if (edge.label && edge.label != "") {
    edgeTC = convertEdgeTriggerCriteria(edge);
  }
  
  return {_edge, edgeTC: edgeTC ?? null};
};

type JsonEdgeTriggerCriteria = {
  model: string,
  pk: number | string; // need further confirmation.
  fields: JsonEdgeTriggerCriteriaFields;
}

type JsonEdgeTriggerCriteriaFields = {
  edge: number | string; // need further confirmation.
  choice?: string;
  [key: string]: any;
}

const convertEdgeTriggerCriteria = (edge: Edge, ) => {
  const edgeTC: JsonEdgeTriggerCriteria = {
    model: "questionnaire.edgetriggercriteria",
    pk: edge.id,
    fields: {
      edge: edge.id,
      ...(edge.label && {choice: edge.label.toString()}),
    } as JsonEdgeTriggerCriteriaFields
  } 

  if (edge.data?.fields) {
    const orgFields = edge.data.fields 
    edgeTC.fields = { ...edgeTC.fields, ...orgFields}; // pass down the original fields from import
  }

  return edgeTC
}