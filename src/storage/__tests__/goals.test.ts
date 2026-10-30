import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_GOALS,
  formatGoalNumber,
  getGoals,
  saveGoals,
  type MacroGoals,
} from '../goals';

const storage = vi.hoisted(() => {
  const store = new Map<string, string>();
  const asyncStorage = {
    getItem: vi.fn(async (key: string) => (store.has(key) ? store.get(key)! : null)),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
  return { store, asyncStorage };
});

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: storage.asyncStorage,
}));

const customGoals: MacroGoals = {
  calories: 1800,
  protein: 140,
  carbs: 190,
  fat: 60,
};

function resetStorage() {
  storage.store.clear();
  storage.asyncStorage.getItem.mockReset();
  storage.asyncStorage.setItem.mockReset();
  storage.asyncStorage.removeItem.mockReset();
  storage.asyncStorage.getItem.mockImplementation(async (key: string) =>
    storage.store.has(key) ? (storage.store.get(key) ?? null) : null,
  );
  storage.asyncStorage.setItem.mockImplementation(async (key: string, value: string) => {
    storage.store.set(key, value);
  });
  storage.asyncStorage.removeItem.mockImplementation(async (key: string) => {
    storage.store.delete(key);
  });
}

describe('goal storage', () => {
  beforeEach(() => {
    resetStorage();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns the default goals when nothing is stored', async () => {
    await expect(getGoals()).resolves.toEqual(DEFAULT_GOALS);
  });

  it('returns a copy of the defaults so callers cannot mutate them', async () => {
    const goals = await getGoals();
    goals.calories = 1;

    await expect(getGoals()).resolves.toEqual(DEFAULT_GOALS);
  });

  it('returns stored goals', async () => {
    storage.store.set('macroGoals', JSON.stringify(customGoals));

    await expect(getGoals()).resolves.toEqual(customGoals);
  });

  it('fills invalid fields from the defaults', async () => {
    storage.store.set(
      'macroGoals',
      JSON.stringify({
        calories: 0,
        protein: '140',
        carbs: 180,
        fat: Number.POSITIVE_INFINITY,
      }),
    );

    await expect(getGoals()).resolves.toEqual({
      calories: DEFAULT_GOALS.calories,
      protein: DEFAULT_GOALS.protein,
      carbs: 180,
      fat: DEFAULT_GOALS.fat,
    });
  });

  it('returns defaults when stored JSON is invalid', async () => {
    storage.store.set('macroGoals', '{');

    await expect(getGoals()).resolves.toEqual(DEFAULT_GOALS);
  });

  it('returns defaults when storage throws', async () => {
    storage.asyncStorage.getItem.mockRejectedValueOnce(new Error('read failed'));

    await expect(getGoals()).resolves.toEqual(DEFAULT_GOALS);
  });

  it('saves goals and reads them back', async () => {
    await expect(saveGoals(customGoals)).resolves.toEqual(customGoals);
    expect(storage.asyncStorage.setItem).toHaveBeenCalledWith(
      'macroGoals',
      JSON.stringify(customGoals),
    );
    await expect(getGoals()).resolves.toEqual(customGoals);
  });

  it('rejects a non-positive goal without writing', async () => {
    await expect(
      saveGoals({ ...customGoals, protein: 0 }),
    ).rejects.toThrow('Invalid protein goal');
    expect(storage.asyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric goal without writing', async () => {
    await expect(
      saveGoals({ ...customGoals, fat: Number.NaN }),
    ).rejects.toThrow('Invalid fat goal');
    expect(storage.asyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('throws when saving fails', async () => {
    storage.asyncStorage.setItem.mockRejectedValueOnce(new Error('write failed'));

    await expect(saveGoals(customGoals)).rejects.toThrow('write failed');
  });
});

describe('formatGoalNumber', () => {
  it('formats integers with thousands separators', () => {
    expect(formatGoalNumber(2000)).toBe('2,000');
    expect(formatGoalNumber(150)).toBe('150');
  });

  it('keeps up to two decimal places and trims a trailing zero', () => {
    expect(formatGoalNumber(150.5)).toBe('150.5');
    expect(formatGoalNumber(150.25)).toBe('150.25');
  });

  it('formats negatives and non-finite values', () => {
    expect(formatGoalNumber(-1200)).toBe('-1,200');
    expect(formatGoalNumber(Number.NaN)).toBe('0');
  });
});
