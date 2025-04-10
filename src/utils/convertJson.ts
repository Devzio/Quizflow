type JsonNode = {
  id: string;
  type: string;
  data: {
    label: string;
    fields?: any;
  };
  position: {
    x: number;
    y: number;
  };
};

type JsonEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  data: {
    label: string;
  };
};

type JsonJson = {
  nodes: JsonNode[];
  edges: JsonEdge[];
};

export function convertJson(input: any): JsonJson {
  if (input.nodes && input.edges) {
    const edges = input.edges.map((e: any) => ({
      ...e,
      type: e.type || 'straightEdge',
      animated: e.animated ?? true,
      data: { label: e.data?.label ?? e.label ?? '' },
    }));
    return { nodes: input.nodes, edges };
  }

  const questions = input.filter((item: any) => item.model === 'questionnaire.question');
  const nodesRaw = input.filter((item: any) => item.model === 'questionnaire.node');
  const edgesRaw = input.filter((item: any) => item.model === 'questionnaire.edge');
  const criteria = input.filter((item: any) => item.model === 'questionnaire.edgetriggercriteria');

  const questionMap = new Map<string, any>();
  questions.forEach((q: any) => {
    questionMap.set(q.pk, q.fields);
  });

  const labelMap = new Map<number, string>();
  criteria.forEach((c: any) => {
    labelMap.set(c.fields.edge, c.fields.choice.replace('Boolean ', ''));
  });

  const childMap = new Map<string, string[]>();
  const edgeMap = new Map<string, string>();
  edgesRaw.forEach((e: any) => {
    const start = e.fields.start;
    const end = e.fields.end;
    if (!childMap.has(start)) childMap.set(start, []);
    childMap.get(start)?.push(end);
    edgeMap.set(`${start}->${end}`, labelMap.get(e.pk) || '');
  });

  const positioned = new Set<string>();
  const nodeMap = new Map<string, JsonNode>();
  const spacingX = 300;
  const spacingY = 200;

  function placeNode(id: string, x: number, y: number) {
    if (positioned.has(id)) return;
    const raw = nodesRaw.find((n: any) => n.pk === id);
    const fields = questionMap.get(raw?.fields?.question);
    const label = fields?.title || 'No label';

    const node: JsonNode = {
      id,
      type: nodeMap.size === 0 ? 'start' : 'text',
      position: { x, y },
      data: { label, fields },
    };
    nodeMap.set(id, node);
    positioned.add(id);

    const children = childMap.get(id) || [];
    if (children.length === 1) {
      placeNode(children[0], x, y + spacingY);
    } else if (children.length === 2) {
      const left = edgeMap.get(`${id}->${children[0]}`) === 'No' ? children[0] : children[1];
      const right = edgeMap.get(`${id}->${children[0]}`) === 'Yes' ? children[0] : children[1];
      placeNode(left, x - spacingX, y + spacingY);
      placeNode(right, x + spacingX, y + spacingY);
    } else {
      children.forEach((childId, i) => {
        placeNode(childId, x + i * spacingX, y + spacingY);
      });
    }
  }

  const startNode = nodesRaw.find((n: any) => {
    const question = questionMap.get(n.fields.question);
    return question?.title?.toLowerCase()?.includes('start') ||
           question?.title?.toLowerCase()?.includes('welcome');
  }) || nodesRaw[0];

  placeNode(startNode.pk, 0, 0);

  const edges: JsonEdge[] = edgesRaw.map((e: any) => ({
    id: e.pk.toString(),
    source: e.fields.start,
    target: e.fields.end,
    type: 'straightEdge',
    animated: true,
    data: { label: labelMap.get(e.pk) ?? '' },
  }));

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}