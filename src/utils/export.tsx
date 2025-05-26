import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from '@xyflow/react';
import {
  ModelQuestionnaireGraph, ModelQuestionnaireGraphFields,
  ModelNode, ModelNodeFields, ModelQuestion, ModelQuestionFields,
  ModelEdge, ModelEdgeFields, ModelEdgeTriggerCriteria, ModelEdgeTriggerCriteriaFields,
  ModelQuestionTag, ModelQuestionTagFields,
  ReactFlowEdge, ReactFlowNode
} from './modelTypes'
import { GenerateRandomPk } from '../utils/utils';
import { EdgeCriterion } from './edgeCriteriaService';
import { NodeCriterion } from './nodeCriteriaService';


enum Model {
  QuestionnaireGraph = "questionnaire.questionnairegraph",
  Node = "questionnaire.node",
  Question = "questionnaire.question",
  Edge = "questionnaire.edge",
  EdgetriggerCriteria = "questionnaire.edgetriggercriteria",
  QuestionTag = "questionnaire.questiontag",

  // not support:
  QuestionLabel = "questionnaire.questionlabel",
  QuestionValidator = "questionnaire.questionvalidator",
  QuestionnaireGraphSubmissionAction = "questionnaire.questionnairegraphsubmissionaction",
}

export function ConvertExport(questionnareName: string, nodes: Node[], edges: Edge[]): string {
  return convertExport(questionnareName, nodes, edges, false);
}
export function ConvertExportWithReactFlowData(questionnareName: string, nodes: Node[], edges: Edge[]): string {
  return convertExport(questionnareName, nodes, edges, true);
}


/**
 * An export function for json export. 
 *
 * @param includeFlowData - whether reactflow data is included
 * @param questionnareName - the questionnaire name
 * @param nodes - a list of Node objects
 * @param edges - a list of Edge objects 
 * @returns a Json string
 */
function convertExport(questionnareName: string, nodes: Node[], edges: Edge[], includeFlowData: boolean = false): string {

  const parentGraph: ModelQuestionnaireGraph = {
    model: Model.QuestionnaireGraph,
    pk: uuidv4(),
    fields: {
      name: questionnareName,
      start: "",
      end: "",
      status: "active"
    } as ModelQuestionnaireGraphFields
  }

  const nodeList: (ModelNode | ModelQuestion | ModelQuestionTag)[] = [];
  nodes.forEach((n: Node) => {
    const ret = convertNode(includeFlowData, parentGraph, n);
    nodeList.push(ret._node, ret._question, ...ret._questionTags);
  });

  const edgeList: (ModelEdge | ModelEdgeTriggerCriteria)[] = [];
  edges.forEach((e: Edge) => {
    const ret = convertEdge(includeFlowData, e)
    if (ret._edgeTC && ret._edgeTC.length > 0) {
      edgeList.push(...ret._edgeTC);
    }

    edgeList.push(ret._edge);
  });

  const data = JSON.stringify([parentGraph, ...nodeList, ...edgeList], null, 2);
  return data
}

/**
 * A funciton for a node conversion.
 *
 * @param parent - a ModelQuestionnaireGraph object
 * @param node - a Node object
 * @returns a ModelNode object, a ModelQuestion object, and a list of ModelQuestionTag objects
 */
function convertNode(includeFlowData: boolean, parent: ModelQuestionnaireGraph, node: Node) {
  const { _question, _questionTags } = convertQuestion(node);

  // convert node
  const _node: ModelNode = {
    model: Model.Node,
    pk: node.id,
    fields: {
      question: _question.pk,
      parent_graph: parent.pk
    } as ModelNodeFields
  }
  const { data } = node
  const fields = (data as { fields: ModelNodeFields })?.fields;
  if (fields) {
    // pass down the rest of the 'fields'
    _node.fields = { ...fields, ..._node.fields }
  }

  // assign start&end nodes
  if (node.type == 'start') {
    parent.fields.start = node.id;
  } else if (node.type == 'end') {
    parent.fields.end = node.id;
  }

  // add reactflow data 
  if (includeFlowData) {
    _node.reactflow = {
      positions: {
        x: node.position.x,
        y: node.position.y,
      },
      // Add selectedCriteria to reactflow data
      // selectedCriteria: node.data?.selectedCriteria || []
    } as ReactFlowNode;
  }

  return { _node, _question, _questionTags }
};


/**
 * A funciton for a question conversion.
 *
 * @param node - a Node object
 * @returns a ModelQuestion object and a list of ModelQuestionTag objects
 */
function convertQuestion(node: Node) {
  const { data } = node;
  const question = (data as { question: ModelQuestion })?.question;

  let _question: ModelQuestion;
  if (question) {
    // pass down
    _question = { ...question };
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

  // add question tag 
  const tag_choices = (data as { selectedCriteria: NodeCriterion[] }).selectedCriteria;
  const _questionTags: ModelQuestionTag[] = [];
  if (tag_choices && tag_choices.length > 0) {
    let qt: ModelQuestionTag;
    tag_choices.forEach(tag => {
      qt = {
        model: Model.QuestionTag,
        pk: GenerateRandomPk(),
        fields: {
          choice: tag.label,
          question: _question.pk,
        } as ModelQuestionTagFields
      }
      _questionTags.push(qt);
    });
  }

  // update end node
  if (node.type == "end") {
    _question.fields.auto_next = false
    _question.fields.type = "dead_end"
  }

  return { _question, _questionTags };
}


/**
 * A function for an edge conversion.
 *
 * @param edge - a Edge object
 * @returns a ModelEdge object and optionally an array of ModelEdgeTriggerCriteria objects 
 */
function convertEdge(includeFlowData: boolean, edge: Edge) {

  const _edge: ModelEdge = {
    model: Model.Edge,
    pk: Number.isNaN(+edge.id) ? edge.id : +edge.id,
    fields: {
      start: edge.source,
      end: edge.target,
      label: edge.label || edge.data?.label || ''
    } as ModelEdgeFields
  }

  if (edge.data?.fields) {
    // pass down the rest of the 'fields'
    _edge.fields = { ...edge.data?.fields, ..._edge.fields }
  }

  let _edgeTC: ModelEdgeTriggerCriteria[] = [];

  if (edge.data?.selectedCriteria) {
    _edgeTC = convertEdgeTriggerCriteria(edge);
  }

  // add reactflow data 
  if (includeFlowData) {
    _edge.reactflow = {
      animated: edge.animated,
      type: edge.type,
    } as ReactFlowEdge;
  }

  return { _edge, _edgeTC };
};


/**
 * A function for an edgeTriggerCriteria conversion.
 *
 * @param edge - a Edge object
 * @returns an array of ModelEdgeTriggerCriteria objects 
 */
const convertEdgeTriggerCriteria = (edge: Edge) => {
  const selectedCriteria = edge.data?.selectedCriteria as EdgeCriterion[];
  const edgetriggercriteria = edge.data?.edgetriggercriteria as ModelEdgeTriggerCriteria;
  const result: ModelEdgeTriggerCriteria[] = [];

  // If we have the new format with multiple selected criteria
  if (Array.isArray(selectedCriteria) && selectedCriteria.length > 0) {
    // Create a criteria object for each selected criterion
    selectedCriteria.forEach((criterion) => {
      const _edgeTC: ModelEdgeTriggerCriteria = {
        model: Model.EdgetriggerCriteria,
        pk: GenerateRandomPk(),
        fields: {
          edge: parseInt(edge.id),
          choice: criterion.label || "",
          value: criterion.value || "",
          criterionId: criterion.id || "",
        } as ModelEdgeTriggerCriteriaFields
      };
      result.push(_edgeTC);
    });

    return result;
  }
  // Fallback to single criterion logic for backward compatibility
  else if (edgetriggercriteria) {
    // pass down all existing criteria data
    const _edgeTC = { ...edgetriggercriteria };

    // Ensure the edge ID is correctly linked
    _edgeTC.fields.edge = parseInt(edge.id);

    // Only update the choice if it's a criterion, not just an edge label
    if (edge.data?.selectedCriteria && edge.data?.label && _edgeTC.fields.choice !== edge.data?.label.toString()) {
      _edgeTC.fields.choice = edge.data.label.toString();
    }

    result.push(_edgeTC);
    return result;
  }

  // DO NOT automatically create edge criteria from labels
  // This was causing edge labels to be converted to criteria on import

  return result;
};

