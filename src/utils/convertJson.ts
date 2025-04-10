type JasonNode = {
  id: string;
  type: string;
  data: { label: string };
  position: { x: number; y: number };
};

type JasonEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
  data: { label: string };
};

type JasonJson = {
  nodes: JasonNode[];
  edges: JasonEdge[];
};

export function convertJson(input: any): JasonJson {
  // ✅ Jason 포맷이면 그대로 사용 (단, label만 보정)
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
  const graph = input.find((item: any) => item.model === 'questionnaire.questionnairegraph');
  const startNodeId = graph?.fields?.start;

  const questionMap = new Map<string, string>();
  questions.forEach((q: any) => {
    questionMap.set(q.pk, q.fields.title);
  });

  const labelMap = new Map<number, string>();
  criteria.forEach((c: any) => {
    labelMap.set(c.fields.edge, c.fields.choice.replace('Boolean ', ''));
  });

  const visited = new Set<string>();
  const positionMap = new Map<string, { x: number; y: number }>();
  const nodes: JasonNode[] = [];
  const edges: JasonEdge[] = [];

  const dx = 300;
  const dy = 180;

  function traverse(nodeId: string, x: number, y: number) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const nodeRaw = nodesRaw.find((n: any) => n.pk === nodeId);
    if (!nodeRaw) return;

    const isStart = nodeId === startNodeId;
    const label = questionMap.get(nodeRaw.fields.question) || 'No label';

    nodes.push({
      id: nodeId,
      type: isStart ? 'start' : 'text',
      data: { label },
      position: { x, y },
    });

    positionMap.set(nodeId, { x, y });

    const outgoingEdges = edgesRaw.filter((e: any) => e.fields.start === nodeId);
    let branchOffset = -((outgoingEdges.length - 1) / 2) * dx;

    outgoingEdges.forEach((e: any) => {
      const target = e.fields.end;
      const label = labelMap.get(e.pk) ?? '';
      const nextX = x + branchOffset;
      const nextY = y + dy;

      edges.push({
        id: String(e.pk),
        source: nodeId,
        target,
        type: 'straightEdge',
        animated: true,
        data: { label },
      });

      branchOffset += dx;
      traverse(target, nextX, nextY);
    });
  }

  if (startNodeId) {
    traverse(startNodeId, 0, 0);
  }

  return { nodes, edges };
}