type JsonNode = {
  id: string;
  type: string;
  data: {
    label: string;
    fields?: any;
    question?: any;
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
  label?: string;
  data: {
    label: string;
    fields?: any;
    edgetriggercriteria?: any;
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
  const criteria = input.filter((item: any) => item.model === 'questionnaire.edgetriggercriteria');

  const questionMap = new Map<string, any>();
  questions.forEach((q: any) => {
    questionMap.set(q.pk, q.fields);
  });

  const labelMap = new Map<string, string>();  // 🔧 number → string
  criteria.forEach((c: any) => {
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

  const positioned = new Set<string>();
  const nodeMap = new Map<string, JsonNode>();
  const spacingX = 300;
  const spacingY = 200;

  function placeNode(id: string, x: number, y: number) {
    if (positioned.has(id)) return;
    const raw = nodesRaw.find((n: any) => n.pk === id);
    const fields = raw.fields;
    const label = questionMap.get(raw?.fields?.question)?.title || 'No label';
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
    const label = labelMap.get(String(e.pk)) ?? '';
    return {
      id: e.pk.toString(),
      source: e.fields.start,
      target: e.fields.end,
      type: e.reactflow?.type || 'straightEdge',
      animated: e.reactflow?.animated ?? true,
      label,  // ✅ 이 부분이 화면에 직접 보이는 라벨
      data: {
        label,
        fields: { ...e.fields },
        edgetriggercriteria: criteria.find((c: any) => String(c.fields.edge) === String(e.pk)) || null,
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