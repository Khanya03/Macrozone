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

const readMeals = async (): Promise<Meal[]> => {
  const data = await AsyncStorage.getItem(MEALS_KEY);
  if (data == null) return [];

  const parsed: unknown = JSON.parse(data);
  if (!Array.isArray(parsed)) {
    throw new Error('Stored meals are not an array');
  }

  return parsed as Meal[];
};

export const getMeals = async (): Promise<Meal[]> => {
  try {
    return await readMeals();
  } catch (error) {
    console.error('getMeals AsyncStorage error:', error);
    return [];
  }
};

export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const meals = await readMeals();
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  try {
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify([newMeal, ...meals]));
  } catch (error) {
    console.error('addMeal AsyncStorage error:', error);
    throw error;
  }

  return newMeal;
};

export const deleteMeal = async (id: string): Promise<void> => {
  const meals = await readMeals();
  const filtered = meals.filter((meal) => meal.id !== id);

  try {
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('deleteMeal AsyncStorage error:', error);
    throw error;
  }
};

export const clearMeals = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(MEALS_KEY);
  } catch (error) {
    console.error('clearMeals AsyncStorage error:', error);
    throw error;
  }
};

// backward-compatible alias for callers expecting `clearAllMeals`
export const clearAllMeals = clearMeals;
