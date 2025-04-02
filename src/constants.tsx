

export const initialNodes = [
  {
    id: '1',
    type: 'start',
    data: {
      label: (
        <>
          Node <strong>A</strong>
        </>
      ),
    },
    position: { x: 0, y: 0 },
  },
  {
    id: '2',
    type: 'text',
    data: {
      label: (
        <>
          Question <strong>1</strong>
        </>
      ),
    },
    position: { x: 0, y: 100 },
  },
  {
    id: '3',
    type: 'text',
    data: {
      label: (
        <>
          Question <strong>2A</strong>
        </>
      ),
    },
    position: { x: -150, y: 200 },
    // style: {
    //   background: '#D6D5E6',
    //   color: '#333',
    //   width: 180,
    // },
  },
  {
    id: '4',
    type: 'text',
    data: {
      label: (
        <>
          Question <strong>2B</strong>
        </>
      ),
    },
    position: { x: 150, y: 200 },
  },
  {
    id: '5',
    type: 'text',
    data: {
      label: (
        <>
          Question <strong>3A</strong>
        </>
      ),
    },
    position: { x: -300, y: 300 },
  },
  {
    id: '6',
    type: 'text',
    data: {
      label: (
        <>
          Question <strong>3B</strong>
        </>
      ),
    },
    position: { x: 0, y: 300 },
  },
  {
    id: '7',
    type: 'text',
    data: {
      label: (
        <>
          Question <strong>3C</strong>
        </>
      ),
    },
    position: { x: 300, y: 300 },
  },
];

export const initialEdges = [
  {
    id: 'e1-2',
    type: 'edgedelete',
    animated: true,
    source: '1',
    target: '2',
    label: 'Start',
    reconnectable: true,
  },
  {
    id: 'e2-3',
    type: 'default',
    animated: true,
    source: '2',
    target: '3',
    label: 'No',
    reconnectable: true,
  },
  {
    id: 'e2-4',
    type: 'default',
    animated: true,
    source: '2',
    target: '4',
    label: 'Yes',
  },
  {
    id: 'e3-5',
    type: 'default',
    animated: true,
    source: '3',
    target: '5',
    label: 'Yes',
  },
  {
    id: 'e3-6',
    type: 'default',
    animated: true,
    source: '3',
    target: '6',
    label: 'No',
  },
  {
    id: 'e4-6',
    type: 'default',
    animated: true,
    source: '4',
    target: '6',
    label: 'No',
  },
  {
    id: 'e4-7',
    type: 'default',
    animated: true,
    source: '4',
    target: '7',
    label: 'Yes',
  },
];
