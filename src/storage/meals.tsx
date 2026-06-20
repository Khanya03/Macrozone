import AsyncStorage from '@react-native-async-storage/async-storage';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

const MEALS_KEY = 'meals';

export const getMeals = async (): Promise<Meal[]> => {
  try {
    const data = await AsyncStorage.getItem(MEALS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('getMeals AsyncStorage error:', error);
    return [];
  }
};

export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const meals = await getMeals();
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  try {
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...meals]));
    try {
      if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
        window.dispatchEvent(new CustomEvent('mealsChanged'));
      }
    } catch {}
  } catch (error) {
    console.error('addMeal AsyncStorage error:', error);
    throw error;
  }
  return newMeal;
};

export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await getMeals();
  const filtered = meals.filter((meal) => meal.id !== id);
  await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
  try {
    if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
      window.dispatchEvent(new CustomEvent('mealsChanged'));
    }
  } catch {}
};

export const clearMeals = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MEALS_KEY);
    if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
      window.dispatchEvent(new CustomEvent('mealsChanged'));
    }
  } catch (error) {
    console.error('clearMeals AsyncStorage error:', error);
    throw error;
  }
};

// backward-compatible alias for callers expecting `clearAllMeals`
export const clearAllMeals = clearMeals;