import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getGoals,
  saveGoals as saveGoalsToStorage,
  type MacroGoals,
} from './goals';

type GoalsContextValue = {
  goals: MacroGoals | null;
  saveGoals: (goals: MacroGoals) => Promise<MacroGoals>;
};

const GoalsContext = createContext<GoalsContextValue | null>(null);

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<MacroGoals | null>(null);

  useEffect(() => {
    let active = true;

    getGoals().then((stored) => {
      if (active) setGoals(stored);
    });

    return () => {
      active = false;
    };
  }, []);

  const saveGoals = useCallback(async (next: MacroGoals) => {
    const saved = await saveGoalsToStorage(next);
    setGoals(saved);
    return saved;
  }, []);

  const value = useMemo(() => ({ goals, saveGoals }), [goals, saveGoals]);

  return (
    <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>
  );
}

export function useGoals(): GoalsContextValue {
  const context = useContext(GoalsContext);
  if (!context) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
