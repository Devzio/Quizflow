import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from '@xyflow/react';
import { ModelQuestionnaireGraph, ModelQuestionnaireGraphFields, 
  ModelNode, ModelNodeFields, ModelQuestion, ModelQuestionFields,
  ModelEdge, ModelEdgeFields, ModelEdgeTriggerCriteria, ModelEdgeTriggerCriteriaFields} from './modelTypes'


enum Model {
  QuestionnaireGraph = "questionnaire.questionnairegraph",
  Node = "questionnaire.node",
  Question = "questionnaire.question",
  Edge = "questionnaire.edge",
  EdgetriggerCriteria = "questionnaire.edgetriggercriteria"
}


/**
 * An export function for json export. 
 *
 * @param questionnareName - the questionnaire name
 * @param nodes - a list of Node objects
 * @param edges - a list of Edge objects 
 * @returns a Json string
 */
export function ConvertExport(questionnareName: string, nodes: Node[], edges: Edge[]): string {
  
  const parentGraph:ModelQuestionnaireGraph = { 
    model: Model.QuestionnaireGraph,
    pk: uuidv4(),
    fields: {
      name: questionnareName || `quizflow_questionnaire`, 
      start: "",
      end: "",
      status: "active" 
    } as ModelQuestionnaireGraphFields
  }

  const nodeList:(ModelNode | ModelQuestion)[] = [];
  nodes.forEach((n: Node) => {
    const ret = convertNode(parentGraph, n);
    nodeList.push(ret._node, ret._question)
  });
  
  const edgeList:(ModelEdge | ModelEdgeTriggerCriteria)[] = [];
  edges.forEach((e: Edge) => {
    const ret = convertEdge(e)
    if (ret.edgeTC) { 
      edgeList.push(ret.edgeTC);
    }
    
    edgeList.push(ret._edge);
  });

  const data = JSON.stringify([ parentGraph, ...nodeList, ...edgeList ], null, 2);
  return data
}

/**
 * A funciton for a node conversion.
 * It composes a new ModelNode object if there is nothing to be passed down from import.
 *
 * @param parent - a ModelQuestionnaireGraph object
 * @param node - a Node object
 * @returns a ModelNode object and a ModelQuestion object  
 */
function convertNode(parent: ModelQuestionnaireGraph, node: Node) {
  
  const _question = convertQuestion(node)
  
  // convert node
  const _node:ModelNode = {
    model: Model.Node,
    pk: node.id 
  }
  const {data} = node
  const fields = (data as { fields: ModelNodeFields })?.fields;
  if (fields) {
    // pass down
    _node.fields = {...fields}
  } else {
    // create a new one
    _node.fields = {
      question: _question.pk,
      parent_graph: parent.pk
    }
  }

  // assign start&end nodes
  if (node.type == 'start') {
    parent.fields.start = node.id;
  } else if (node.type == 'end') {
    parent.fields.end = node.id;
  }
    
  return { _node, _question}
};


/**
 * A funciton for a question conversion.
 * It composes a new ModelQuestion object if there is nothing to be passed down from import.
 *
 * @param node - a Node object
 * @returns a ModelQuestion object  
 */
function convertQuestion(node:Node) {
  const { data } = node;
  const question = (data as { question: ModelQuestion })?.question;

  let _question:ModelQuestion;
  if ( question) { 
    // pass down
    _question = {...question};
    _question.fields.title = data?.label || _question.fields.title;
  } else {
    // create a new one
    _question = {
      model: Model.Question,
      pk: uuidv4(), 
      fields: {
        title: data?.label || "",
        required: true,
        type: "boolean",
        auto_next: true, 
      } as ModelQuestionFields
    }
  }

  // update end node
  if (node.type == "end") { 
    _question.fields.auto_next = false 
    _question.fields.type = "dead_end"
  }

  return _question;
}


/**
 * A funciton for an edge conversion.
 *
 * @param edge - a Edge object
 * @returns a ModelEdge object and optionally a ModelEdgeTriggerCriteria object 
 */
function convertEdge(edge: Edge) {
  const _edge:ModelEdge  = {
    model: Model.Edge,
    pk: edge.id,
    fields: {
      start: edge.source,
      end: edge.target,
    } as ModelEdgeFields
  };

  let edgeTC = null;
  if (edge.label) {
    edgeTC = convertEdgeTriggerCriteria(edge);
  }
  
  return {_edge, edgeTC: edgeTC ?? null};
};


/**
 * A funciton for an edgeTriggerCriteria conversion.
 *
 * @param nodes - a Edge object
 * @returns a ModelEdgeTriggerCriteria object 
 */
const convertEdgeTriggerCriteria = (edge: Edge, ) => {
  const edgeTC: ModelEdgeTriggerCriteria = {
    model: Model.EdgetriggerCriteria,
    pk: edge.id,
    fields: {
      edge: edge.id,
      ...(edge.label && {choice: edge.label.toString()}),
    } as ModelEdgeTriggerCriteriaFields
  } 

  if (edge.data?.fields) {
    const orgFields = edge.data.fields 
    edgeTC.fields = { ...edgeTC.fields, ...orgFields}; // pass down 
  }

  return edgeTC
}