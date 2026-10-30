import AsyncStorage from '@react-native-async-storage/async-storage';

export type MacroGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export const DEFAULT_GOALS: MacroGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

const GOALS_KEY = 'macroGoals';

const GOAL_FIELDS = ['calories', 'protein', 'carbs', 'fat'] as const;

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function coerceGoals(value: unknown): MacroGoals {
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};

  return {
    calories: isPositiveNumber(source.calories)
      ? source.calories
      : DEFAULT_GOALS.calories,
    protein: isPositiveNumber(source.protein)
      ? source.protein
      : DEFAULT_GOALS.protein,
    carbs: isPositiveNumber(source.carbs) ? source.carbs : DEFAULT_GOALS.carbs,
    fat: isPositiveNumber(source.fat) ? source.fat : DEFAULT_GOALS.fat,
  };
}

export function formatGoalNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';

  const negative = value < 0;
  const rounded = Math.round(Math.abs(value) * 100) / 100;
  const [whole, fraction] = rounded.toFixed(2).split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const body =
    fraction === '00'
      ? withCommas
      : `${withCommas}.${fraction.replace(/0$/, '')}`;

  return negative ? `-${body}` : body;
}

export const getGoals = async (): Promise<MacroGoals> => {
  try {
    const data = await AsyncStorage.getItem(GOALS_KEY);
    if (!data) return { ...DEFAULT_GOALS };
    return coerceGoals(JSON.parse(data));
  } catch (error) {
    console.error('getGoals AsyncStorage error:', error);
    return { ...DEFAULT_GOALS };
  }
};

function assertGoals(goals: MacroGoals): MacroGoals {
  const normalized = {} as MacroGoals;

  for (const field of GOAL_FIELDS) {
    const value = goals?.[field];
    if (!isPositiveNumber(value)) {
      throw new Error(`Invalid ${field} goal`);
    }
    normalized[field] = value;
  }

  return normalized;
}

export const saveGoals = async (goals: MacroGoals): Promise<MacroGoals> => {
  const normalized = assertGoals(goals);

  try {
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error('saveGoals AsyncStorage error:', error);
    throw error;
  }

  return normalized;
};
