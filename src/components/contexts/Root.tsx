import { createContext, ReactNode, useContext, useState } from 'react';

type RootOptions = {
  anchor: string;
};

type RootContextType = {
  state: RootOptions;
  setState: React.Dispatch<React.SetStateAction<RootOptions>>;
};

const RootContext = createContext<RootContextType | undefined>(undefined);

export const RootProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<RootOptions>({
    anchor: '',
  });

  return (
    <RootContext.Provider value={{ state, setState }}>
      {children}
    </RootContext.Provider>
  );
};

export const useRoot = () => {
  const context = useContext(RootContext);
  if (context === undefined) {
    throw new Error('useRoot must be used within a RootProvider');
  }
  return context;
};
