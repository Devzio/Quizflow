import { ReactFlowProvider } from '@xyflow/react';
import { DnDProvider } from './components/DnDContext';
import DnDFlow from './components/DnDFlow';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => (
  <ReactFlowProvider>
    <DnDProvider>
      <DnDFlow />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </DnDProvider>
  </ReactFlowProvider>
);

export default App;