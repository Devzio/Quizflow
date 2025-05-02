import { v4 as uuidv4 } from 'uuid';
import { Node, Edge } from '@xyflow/react';
import {
  ModelQuestionnaireGraph, ModelQuestionnaireGraphFields,
  ModelNode, ModelNodeFields, ModelQuestion, ModelQuestionFields,
  ModelEdge, ModelEdgeFields, ModelEdgeTriggerCriteria, ModelEdgeTriggerCriteriaFields,
  ModelQuestionTag, ModelQuestionTagFields,
} from './modelTypes'
import { GenerateRandomPk } from '../utils/utils';


enum Model {
  QuestionnaireGraph = "questionnaire.questionnairegraph",
  Node = "questionnaire.node",
  Question = "questionnaire.question",
  Edge = "questionnaire.edge",
  EdgetriggerCriteria = "questionnaire.edgetriggercriteria",
  QuestionTag = "questionnaire.questiontag"
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
    const ret = convertNode(parentGraph, n);
    nodeList.push(ret._node, ret._question, ...ret._questionTags)
  });

  const edgeList: (ModelEdge | ModelEdgeTriggerCriteria)[] = [];
  edges.forEach((e: Edge) => {
    const ret = convertEdge(e)
    if (ret._edgeTC) {
      edgeList.push(ret._edgeTC);
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
function convertNode(parent: ModelQuestionnaireGraph, node: Node) {

  const { _question, _questionTags } = convertQuestion(node)

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
  const tag_choices = (data as {tag_choices: string[]}).tag_choices;
  const _questionTags: ModelQuestionTag[] = [];
  if (tag_choices && tag_choices.length > 0) {
    let qt:ModelQuestionTag;
    tag_choices.forEach(tag => {
      qt = {
        model: Model.QuestionTag,
        pk: GenerateRandomPk(99),
        fields: {
          choice: tag,
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

  return { _question,  _questionTags};
}


/**
 * A funciton for an edge conversion.
 *
 * @param edge - a Edge object
 * @returns a ModelEdge object and optionally a ModelEdgeTriggerCriteria object 
 */
function convertEdge(edge: Edge) {

  const _edge: ModelEdge = {
    model: Model.Edge,
    pk: Number.isNaN(+edge.id) ? edge.id : +edge.id,
    fields: {
      start: edge.source,
      end: edge.target
    } as ModelEdgeFields
  }

  if (edge.data?.fields) {
    // pass down the rest of the 'fields'
    _edge.fields = { ...edge.data?.fields, ..._edge.fields }
  }

  let _edgeTC = null;

  if (edge.data?.label) {
    _edgeTC = convertEdgeTriggerCriteria(edge);
  }
  
  return { _edge, _edgeTC: _edgeTC ?? null };
};


/**
 * A funciton for an edgeTriggerCriteria conversion.
 *
 * @param nodes - a Edge object
 * @returns a ModelEdgeTriggerCriteria object 
 */
const convertEdgeTriggerCriteria = (edge: Edge,) => {

  const edgetriggercriteria = edge.data?.edgetriggercriteria as ModelEdgeTriggerCriteria

  let _edgeTC: ModelEdgeTriggerCriteria;
  if (edgetriggercriteria) {
    // pass down
    _edgeTC = { ...edgetriggercriteria }
  } else {
    _edgeTC = {
      model: Model.EdgetriggerCriteria,
      pk: GenerateRandomPk(),
      fields: {
        edge: edge.id,
      } as ModelEdgeTriggerCriteriaFields
    }
  }

  // update choice 
  // ReactFlow edge's "label" is the same as "choice" in edgetriggercriteria model
  _edgeTC.fields.choice = edge.data?.label ? edge.data?.label.toString() : "";

  return _edgeTC
}