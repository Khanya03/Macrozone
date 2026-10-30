import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  addMeal as addMealToStorage,
  clearMeals as clearMealsInStorage,
  deleteMeal as deleteMealFromStorage,
  getMeals,
  type Meal,
} from './meals';

type NewMeal = Omit<Meal, 'id' | 'createdAt'>;

type MealsContextValue = {
  meals: Meal[];
  addMeal: (meal: NewMeal) => Promise<Meal>;
  deleteMeal: (id: string) => Promise<void>;
  clearMeals: () => Promise<void>;
};

const MealsContext = createContext<MealsContextValue | null>(null);

export function MealsProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  // Keep storage updates in order so a slow initial read cannot overwrite a newer edit.
  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = queue.current.then(task, task) as Promise<T>;
    queue.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }, []);

  useEffect(() => {
    void enqueue(async () => {
      setMeals(await getMeals());
    });
  }, [enqueue]);

  const addMeal = useCallback(
    (meal: NewMeal) =>
      enqueue(async () => {
        const created = await addMealToStorage(meal);
        setMeals(await getMeals());
        return created;
      }),
    [enqueue],
  );

  const deleteMeal = useCallback(
    (id: string) =>
      enqueue(async () => {
        await deleteMealFromStorage(id);
        setMeals(await getMeals());
      }),
    [enqueue],
  );

  const clearMeals = useCallback(
    () =>
      enqueue(async () => {
        await clearMealsInStorage();
        setMeals([]);
      }),
    [enqueue],
  );

  const value = useMemo(
    () => ({ meals, addMeal, deleteMeal, clearMeals }),
    [meals, addMeal, deleteMeal, clearMeals],
  );

  return (
    <MealsContext.Provider value={value}>{children}</MealsContext.Provider>
  );
}

export function useMeals(): MealsContextValue {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMeals must be used within a MealsProvider');
  }
  return context;
}
