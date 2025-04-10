import { ReactFlowProvider } from '@xyflow/react';
import { DnDProvider } from './components/DnDContext';
import DnDFlow from './components/DnDFlow';

const App = () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
    </DnDProvider>
  </ReactFlowProvider>
);

export default App;