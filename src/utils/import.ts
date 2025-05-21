type JsonNode = {
  id: string;
  type: string;
  data: {
    label: string;
    fields?: any;
    question?: any;
    selectedCriteria?: NodeCriterion[];
  };
  position: {
    x: number;
    y: number;
  };
};

// Type for edge criterion in selectedCriteria array
type EdgeCriterion = {
  id: string;
  value: string;
  label: string;
};

// Type for node criterion in selectedCriteria array
type NodeCriterion = {
  id: string;
  value: string;
  label: string;
};

// Type for edge trigger criteria data structure
type EdgeTriggerCriteria = {
  model: string;
  pk: string | number;
  fields: {
    edge: string | number;
    choice?: string;
    value?: string;
    criterionId?: string;
    [key: string]: unknown;
  };
};

// Type for node trigger criteria data structure
type NodeTriggerCriteria = {
  model: string;
  pk: string | number;
  fields: {
    node: string;
    choice?: string;
    value?: string;
    criterionId?: string;
    [key: string]: unknown;
  };
};

// Type for JsonEdge with improved typing for edgetriggercriteria
type JsonEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  label?: string;
  data: {
    label: string;
    fields?: Record<string, unknown>;
    edgetriggercriteria?: EdgeTriggerCriteria | null;
    selectedCriteria?: EdgeCriterion[];
  };
};

type JsonJson = {
  model: string;
  pk: string;
  fields: any;
  nodes: JsonNode[];
  edges: JsonEdge[];
};

export function convertJson(input: any): JsonJson {
  if (input.nodes && input.edges) {
    const edges = input.edges.map((e: any) => ({
      ...e,
      type: e.type || 'straightEdge',
      animated: e.animated ?? true,
      label: e.data?.label ?? e.label ?? '',
      data: {
        ...e.data,
        label: e.data?.label ?? e.label ?? '',
      },
    }));
    return {
      model: 'questionnairegraph',
      pk: '',
      fields: {},
      nodes: input.nodes,
      edges,
    };
  }

  const graphInfo = input.find((item: any) => item.model === 'questionnaire.questionnairegraph');

  const questions = input.filter((item: any) => item.model === 'questionnaire.question');
  const nodesRaw = input.filter((item: any) => item.model === 'questionnaire.node');
  const edgesRaw = input.filter((item: any) => item.model === 'questionnaire.edge');
  const edgeCriteria = input.filter((item: any) => item.model === 'questionnaire.edgetriggercriteria');
  const nodeCriteria = input.filter((item: any) => item.model === 'questionnaire.nodetriggercriteria');

  const questionMap = new Map<string, any>();
  questions.forEach((q: any) => {
    questionMap.set(q.pk, q.fields);
  });

  const labelMap = new Map<string, string>();  // 🔧 number → string
  edgeCriteria.forEach((c: any) => {
    labelMap.set(String(c.fields.edge), c.fields.choice?.replace('Boolean ', '') ?? '');
  });

  const childMap = new Map<string, string[]>();
  const edgeMap = new Map<string, string>();
  edgesRaw.forEach((e: any) => {
    const start = e.fields.start;
    const end = e.fields.end;
    if (!childMap.has(start)) childMap.set(start, []);
    childMap.get(start)?.push(end);
    edgeMap.set(`${start}->${end}`, labelMap.get(String(e.pk)) || '');
  });

  // Create a map to store node criteria by node id
  const nodeCriteriaMap = new Map<string, NodeCriterion[]>();
  nodeCriteria.forEach((c: any) => {
    const nodeId = String(c.fields.node);
    if (!nodeCriteriaMap.has(nodeId)) {
      nodeCriteriaMap.set(nodeId, []);
    }
    nodeCriteriaMap.get(nodeId)?.push({
      id: c.fields.criterionId || c.pk.toString(),
      value: c.fields.value || c.fields.choice || '',
      label: c.fields.choice || ''
    });
  });

  const positioned = new Set<string>();
  const nodeMap = new Map<string, JsonNode>();
  const spacingX = 300;
  const spacingY = 200;

  function placeNode(id: string, x: number, y: number) {
    if (positioned.has(id)) return;
    const raw = nodesRaw.find((n: any) => n.pk === id);
    const fields = raw.fields;
    const label = questionMap.get(raw?.fields?.question)?.title || '';
    const questionObject = questions.find((q: any) => q.pk === raw?.fields?.question);
    const isDeadEnd = questionObject?.fields?.type === 'dead_end';

    const pos = raw.reactflow?.positions ?? { x, y };

    const node: JsonNode = {
      id,
      type: isDeadEnd ? 'end' : nodeMap.size === 0 ? 'start' : 'text',
      position: pos,
      data: {
        label,
        fields,
        question: questionObject || null,
        // Add node criteria if available
        selectedCriteria: nodeCriteriaMap.get(id) || []
      },
    };

    nodeMap.set(id, node);
    positioned.add(id);

    const children = childMap.get(id) || [];
    if (children.length === 1) {
      placeNode(children[0], pos.x, pos.y + spacingY);
    } else if (children.length === 2) {
      const left = edgeMap.get(`${id}->${children[0]}`) === 'No' ? children[0] : children[1];
      const right = edgeMap.get(`${id}->${children[0]}`) === 'Yes' ? children[0] : children[1];
      placeNode(left, pos.x - spacingX, pos.y + spacingY);
      placeNode(right, pos.x + spacingX, pos.y + spacingY);
    } else {
      children.forEach((childId, i) => {
        placeNode(childId, pos.x + i * spacingX, pos.y + spacingY);
      });
    }
  }

  const startNode = nodesRaw.find((n: any) => {
    const question = questionMap.get(n.fields.question);
    return question?.title?.toLowerCase()?.includes('start') ||
           question?.title?.toLowerCase()?.includes('welcome');
  }) || nodesRaw[0];

  placeNode(startNode.pk, 0, 0);

  nodesRaw.forEach((n: any, index: number) => {
    if (!positioned.has(n.pk)) {
      const pos = n.reactflow?.positions;
      if (pos) {
        placeNode(n.pk, pos.x, pos.y);
      } else {
        const offsetX = (index % 5) * spacingX;
        const offsetY = Math.floor(index / 5) * spacingY + 600;
        placeNode(n.pk, offsetX, offsetY);
      }
    }
  });

  const edges: JsonEdge[] = edgesRaw.map((e: any) => {
    // Find all matching edge trigger criteria for this edge (there could be multiple for multi-select)
    const edgeCriteriaList = edgeCriteria.filter((c: any) => String(c.fields.edge) === String(e.pk));
    
    // Create selectedCriteria array from the criteria objects - only if there are actual criteria
    const selectedCriteria: EdgeCriterion[] = edgeCriteriaList.length > 0 
      ? edgeCriteriaList.map((c: any) => ({
          id: c.fields.criterionId || c.pk.toString(),
          value: c.fields.value || c.fields.choice || '',
          label: c.fields.choice || ''
        }))
      : [];
    
    // Use the edge's saved label if available, or create a default one
    const customLabel = e.reactflow?.label || '';
    
    return {
      id: e.pk.toString(),
      source: e.fields.start,
      target: e.fields.end,
      type: e.reactflow?.type || 'straightEdge',
      animated: e.reactflow?.animated ?? true,
      // Use the custom label if available
      label: customLabel,
      data: {
        // Ensure label is consistent
        label: customLabel,
        fields: { ...e.fields },
        // Store the first edge trigger criteria object for backward compatibility
        edgetriggercriteria: edgeCriteriaList[0] || null,
        // Only include selectedCriteria if we actually have criteria
        selectedCriteria: selectedCriteria.length > 0 ? selectedCriteria : undefined,
      },
    };
  });

  return {
    model: 'questionnairegraph',
    pk: graphInfo?.pk,
    fields: graphInfo?.fields || {},
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}