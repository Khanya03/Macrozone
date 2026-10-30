import { describe, expect, it } from 'vitest';
import {
  MEAL_CALORIE_MAX,
  MEAL_NAME_MAX,
  validateGoalsDraft,
  validateMealDraft,
} from '../validation';

describe('validateMealDraft', () => {
  it('accepts a name and calories and treats empty macros as zero', () => {
    expect(
      validateMealDraft({
        name: '  Chicken rice  ',
        calories: '540',
        protein: '',
        carbs: ' 40 ',
        fat: '0',
      }),
    ).toEqual({
      ok: true,
      value: {
        name: 'Chicken rice',
        calories: 540,
        protein: 0,
        carbs: 40,
        fat: 0,
      },
    });
  });

  it('accepts macro amounts with up to two decimal places', () => {
    const result = validateMealDraft({
      name: 'Shake',
      calories: '180.5',
      protein: '30.25',
      carbs: '8.5',
      fat: '2',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Shake',
        calories: 180.5,
        protein: 30.25,
        carbs: 8.5,
        fat: 2,
      },
    });
  });

  it('reports every invalid field at once', () => {
    const result = validateMealDraft({
      name: '   ',
      calories: '',
      protein: '-5',
      carbs: '10.555',
      fat: String(1001),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors.name).toBe('Enter a meal name.');
    expect(result.errors.calories).toBe('Enter calories.');
    expect(result.errors.protein).toBe('Enter a valid number for protein.');
    expect(result.errors.carbs).toBe('Enter a valid number for carbs.');
    expect(result.errors.fat).toBe('Fat must be 1,000 or less.');
  });

  it('rejects a name that is too long and calories above the meal limit', () => {
    const result = validateMealDraft({
      name: 'a'.repeat(MEAL_NAME_MAX + 1),
      calories: String(MEAL_CALORIE_MAX + 1),
      protein: '1e2',
      carbs: '12abc',
      fat: '.',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors.name).toBe(
      `Meal name must be ${MEAL_NAME_MAX} characters or fewer.`,
    );
    expect(result.errors.calories).toBe('Calories must be 10,000 or less.');
    expect(result.errors.protein).toMatch(/valid number/);
    expect(result.errors.carbs).toMatch(/valid number/);
    expect(result.errors.fat).toMatch(/valid number/);
  });
});

describe('validateGoalsDraft', () => {
  it('accepts positive daily targets', () => {
    expect(
      validateGoalsDraft({
        calories: '2200',
        protein: '160.5',
        carbs: '210',
        fat: '70',
      }),
    ).toEqual({
      ok: true,
      value: {
        calories: 2200,
        protein: 160.5,
        carbs: 210,
        fat: 70,
      },
    });
  });

  it('requires every goal and rejects zero', () => {
    const result = validateGoalsDraft({
      calories: '',
      protein: '0',
      carbs: '-1',
      fat: '2001',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.errors.calories).toBe('Enter calories.');
    expect(result.errors.protein).toBe('Protein must be greater than 0.');
    expect(result.errors.carbs).toBe('Enter a valid number for carbs.');
    expect(result.errors.fat).toBe('Fat must be 2,000 or less.');
  });
});
