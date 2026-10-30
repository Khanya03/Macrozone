import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addMeal,
  clearAllMeals,
  clearMeals,
  deleteMeal,
  getMeals,
  type Meal,
} from '../meals';

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

const sampleMeal = {
  name: 'Greek yogurt',
  calories: 180,
  protein: 15,
  carbs: 12,
  fat: 5,
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

describe('meal storage', () => {
  beforeEach(() => {
    resetStorage();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-30T15:04:05.000Z'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns an empty list when nothing is stored', async () => {
    await expect(getMeals()).resolves.toEqual([]);
  });

  it('returns stored meals', async () => {
    const existing: Meal[] = [
      {
        id: '1',
        name: 'Oats',
        calories: 300,
        protein: 10,
        carbs: 50,
        fat: 6,
        createdAt: '2026-10-29T12:00:00.000Z',
      },
    ];
    storage.store.set('meals', JSON.stringify(existing));

    await expect(getMeals()).resolves.toEqual(existing);
  });

  it('returns an empty list when stored JSON is invalid', async () => {
    storage.store.set('meals', '{');

    await expect(getMeals()).resolves.toEqual([]);
  });

  it('returns an empty list when stored data is not an array', async () => {
    storage.asyncStorage.getItem.mockResolvedValueOnce('{"name":"nope"}');

    await expect(getMeals()).resolves.toEqual([]);
  });

  it('returns an empty list when storage throws', async () => {
    storage.asyncStorage.getItem.mockRejectedValueOnce(new Error('read failed'));

    await expect(getMeals()).resolves.toEqual([]);
  });

  it('prepends a meal with an id and timestamp', async () => {
    const existing: Meal = {
      id: 'existing',
      name: 'Oats',
      calories: 300,
      protein: 10,
      carbs: 50,
      fat: 6,
      createdAt: '2026-10-29T12:00:00.000Z',
    };
    storage.store.set('meals', JSON.stringify([existing]));

    const created = await addMeal(sampleMeal);

    expect(created).toEqual({
      ...sampleMeal,
      id: String(new Date('2026-10-30T15:04:05.000Z').getTime()),
      createdAt: '2026-10-30T15:04:05.000Z',
    });
    await expect(getMeals()).resolves.toEqual([created, existing]);
    expect(storage.asyncStorage.setItem).toHaveBeenCalledWith(
      'meals',
      JSON.stringify([created, existing]),
    );
  });

  it('does not emit a mealsChanged window event', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });

    await addMeal(sampleMeal);

    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('does not overwrite meals when the current list cannot be read', async () => {
    storage.store.set('meals', JSON.stringify([{ id: 'keep' }]));
    storage.asyncStorage.getItem.mockRejectedValueOnce(new Error('read failed'));

    await expect(addMeal(sampleMeal)).rejects.toThrow('read failed');
    expect(storage.asyncStorage.setItem).not.toHaveBeenCalled();
    expect(storage.store.get('meals')).toBe(JSON.stringify([{ id: 'keep' }]));
  });

  it('does not overwrite meals when stored data is corrupt', async () => {
    storage.store.set('meals', '{"not":"an array"}');
    storage.asyncStorage.getItem.mockResolvedValueOnce('{"not":"an array"}');

    await expect(addMeal(sampleMeal)).rejects.toThrow('Stored meals are not an array');
    expect(storage.asyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('throws when saving a meal fails', async () => {
    storage.asyncStorage.setItem.mockRejectedValueOnce(new Error('write failed'));

    await expect(addMeal(sampleMeal)).rejects.toThrow('write failed');
  });

  it('removes a meal by id and keeps the rest', async () => {
    const first: Meal = {
      id: '1',
      ...sampleMeal,
      createdAt: '2026-10-29T12:00:00.000Z',
    };
    const second: Meal = {
      id: '2',
      name: 'Chicken',
      calories: 400,
      protein: 40,
      carbs: 0,
      fat: 12,
      createdAt: '2026-10-29T18:00:00.000Z',
    };
    storage.store.set('meals', JSON.stringify([first, second]));

    await deleteMeal('1');

    await expect(getMeals()).resolves.toEqual([second]);
  });

  it('leaves meals unchanged when deleting an unknown id', async () => {
    const existing: Meal[] = [
      {
        id: '1',
        ...sampleMeal,
        createdAt: '2026-10-29T12:00:00.000Z',
      },
    ];
    storage.store.set('meals', JSON.stringify(existing));

    await deleteMeal('missing');

    await expect(getMeals()).resolves.toEqual(existing);
  });

  it('does not write when deleting and the current list cannot be read', async () => {
    storage.store.set('meals', JSON.stringify([{ id: 'keep' }]));
    storage.asyncStorage.getItem.mockRejectedValueOnce(new Error('read failed'));

    await expect(deleteMeal('keep')).rejects.toThrow('read failed');
    expect(storage.asyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('clears every meal', async () => {
    await addMeal(sampleMeal);

    await clearMeals();

    await expect(getMeals()).resolves.toEqual([]);
    expect(storage.asyncStorage.removeItem).toHaveBeenCalledWith('meals');
  });

  it('clearAllMeals removes the stored list', async () => {
    await addMeal(sampleMeal);

    await clearAllMeals();

    await expect(getMeals()).resolves.toEqual([]);
  });

  it('throws when clearing meals fails', async () => {
    storage.asyncStorage.removeItem.mockRejectedValueOnce(new Error('remove failed'));

    await expect(clearMeals()).rejects.toThrow('remove failed');
  });
});
