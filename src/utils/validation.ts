const DECIMAL = /^(?:\d+)(?:\.\d{1,2})?$/;

export const MEAL_NAME_MAX = 80;
export const MEAL_CALORIE_MAX = 10000;
export const MEAL_MACRO_MAX = 1000;
export const GOAL_CALORIE_MAX = 20000;
export const GOAL_MACRO_MAX = 2000;

export type MealDraft = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export type MealField = keyof MealDraft;

export type ParsedMealInput = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type GoalsDraft = {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export type GoalField = keyof GoalsDraft;

export type ParsedGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type AmountResult =
  | { ok: true; value: number }
  | { ok: false; reason: 'required' | 'invalid' | 'max' | 'positive' };

function formatLimit(max: number): string {
  return String(max).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function capitalize(label: string): string {
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function parseAmount(
  raw: string,
  options: { required: boolean; max: number; positive?: boolean },
): AmountResult {
  const trimmed = raw.trim();

  if (!trimmed) {
    if (options.required) return { ok: false, reason: 'required' };
    return { ok: true, value: 0 };
  }

  if (!DECIMAL.test(trimmed)) return { ok: false, reason: 'invalid' };

  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { ok: false, reason: 'invalid' };
  if (options.positive && value <= 0) return { ok: false, reason: 'positive' };
  if (value > options.max) return { ok: false, reason: 'max' };

  return { ok: true, value };
}

function amountMessage(
  result: AmountResult,
  label: string,
  max: number,
): string | undefined {
  if (result.ok) return undefined;
  if (result.reason === 'required') return `Enter ${label}.`;
  if (result.reason === 'max') {
    return `${capitalize(label)} must be ${formatLimit(max)} or less.`;
  }
  if (result.reason === 'positive') {
    return `${capitalize(label)} must be greater than 0.`;
  }
  return `Enter a valid number for ${label}.`;
}

export function validateMealDraft(
  draft: MealDraft,
):
  | { ok: true; value: ParsedMealInput }
  | { ok: false; errors: Partial<Record<MealField, string>> } {
  const errors: Partial<Record<MealField, string>> = {};
  const name = draft.name.trim();

  if (!name) {
    errors.name = 'Enter a meal name.';
  } else if (name.length > MEAL_NAME_MAX) {
    errors.name = `Meal name must be ${MEAL_NAME_MAX} characters or fewer.`;
  }

  const calories = parseAmount(draft.calories, {
    required: true,
    max: MEAL_CALORIE_MAX,
  });
  const protein = parseAmount(draft.protein, {
    required: false,
    max: MEAL_MACRO_MAX,
  });
  const carbs = parseAmount(draft.carbs, {
    required: false,
    max: MEAL_MACRO_MAX,
  });
  const fat = parseAmount(draft.fat, {
    required: false,
    max: MEAL_MACRO_MAX,
  });

  const caloriesError = amountMessage(calories, 'calories', MEAL_CALORIE_MAX);
  const proteinError = amountMessage(protein, 'protein', MEAL_MACRO_MAX);
  const carbsError = amountMessage(carbs, 'carbs', MEAL_MACRO_MAX);
  const fatError = amountMessage(fat, 'fat', MEAL_MACRO_MAX);

  if (caloriesError) errors.calories = caloriesError;
  if (proteinError) errors.protein = proteinError;
  if (carbsError) errors.carbs = carbsError;
  if (fatError) errors.fat = fatError;

  if (errors.name || !calories.ok || !protein.ok || !carbs.ok || !fat.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      calories: calories.value,
      protein: protein.value,
      carbs: carbs.value,
      fat: fat.value,
    },
  };
}

export function validateGoalsDraft(
  draft: GoalsDraft,
):
  | { ok: true; value: ParsedGoals }
  | { ok: false; errors: Partial<Record<GoalField, string>> } {
  const errors: Partial<Record<GoalField, string>> = {};

  const calories = parseAmount(draft.calories, {
    required: true,
    max: GOAL_CALORIE_MAX,
    positive: true,
  });
  const protein = parseAmount(draft.protein, {
    required: true,
    max: GOAL_MACRO_MAX,
    positive: true,
  });
  const carbs = parseAmount(draft.carbs, {
    required: true,
    max: GOAL_MACRO_MAX,
    positive: true,
  });
  const fat = parseAmount(draft.fat, {
    required: true,
    max: GOAL_MACRO_MAX,
    positive: true,
  });

  const caloriesError = amountMessage(calories, 'calories', GOAL_CALORIE_MAX);
  const proteinError = amountMessage(protein, 'protein', GOAL_MACRO_MAX);
  const carbsError = amountMessage(carbs, 'carbs', GOAL_MACRO_MAX);
  const fatError = amountMessage(fat, 'fat', GOAL_MACRO_MAX);

  if (caloriesError) errors.calories = caloriesError;
  if (proteinError) errors.protein = proteinError;
  if (carbsError) errors.carbs = carbsError;
  if (fatError) errors.fat = fatError;

  if (!calories.ok || !protein.ok || !carbs.ok || !fat.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      calories: calories.value,
      protein: protein.value,
      carbs: carbs.value,
      fat: fat.value,
    },
  };
}
