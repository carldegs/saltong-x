import { LOCAL_DATA_KEY } from '../constants';
import LocalData from '../types/LocalData';
import { Puzzle } from '../types/Puzzle';

export const getLocalStorage = <T>(key: string) =>
  JSON.parse(localStorage.getItem(key) || '{}') as T;

export const setLocalStorage = <T>(key: string, state: T) =>
  localStorage.setItem(key, JSON.stringify(state));

export const getLocalDataGrid = (puzzleId: string) => {
  const localData = getLocalStorage<LocalData>(LOCAL_DATA_KEY);
  return localData.puzzles[puzzleId];
};

export const setLocalDataGrid = (puzzleId: string, grid: Puzzle['grid']) => {
  const localStorage = getLocalStorage<LocalData>(LOCAL_DATA_KEY);
  setLocalStorage<LocalData>(LOCAL_DATA_KEY, {
    ...localStorage,
    puzzles: {
      ...localStorage.puzzles,
      [puzzleId]: grid,
    },
  });
};
