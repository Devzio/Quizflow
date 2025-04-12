import { createContext, useContext, useState } from 'react';
import ImportFlow from '../components/ImportFlow';

type DnDContextType = {
  type: string | null;
  setType: (type: string | null) => void;
};

export const DnDContext = createContext<DnDContextType>({
  type: null,
  setType: () => { },
});

export function DnDProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<string | null>(null);
  return (
    <DnDContext.Provider value={{ type, setType }}>
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const { type, setType } = useContext(DnDContext);
  return [type, setType] as const;
}