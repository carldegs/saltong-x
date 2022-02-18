import { Puzzle } from '../types/Puzzle';

const generateDefaultDirectionsData = (
  key: 'clue' | 'answer',
  rows: number,
  cols: number
): Puzzle[`${typeof key}s`] =>
  ({
    across: Array(rows)
      .fill('')
      .map((_, i) => ({
        num: i === 0 ? 1 : cols + i,
        [key]: key === 'answer' ? Array(cols).fill('-').join('') : '',
        length: cols,
      })),
    down: Array(cols)
      .fill('')
      .map((_, i) => ({
        num: i + 1,
        [key]: key === 'answer' ? Array(rows).fill('-').join('') : '',
        length: rows,
      })),
  } as any);

export const initializePuzzle = (rows: number, cols: number): Puzzle => {
  const arrLength = rows * cols;
  const grid: string[] = Array(arrLength).fill(' ');
  let numClues = 0;
  const gridnums: number[] = Array(arrLength)
    .fill(0)
    .map((v, i) => {
      if (i < cols || i % cols === 0) {
        numClues += 1;
        return numClues;
      }
      return v;
    });

  return {
    title: '',
    id: '',
    author: '',
    editor: '',
    publisher: '',
    date: '',
    size: {
      rows,
      cols,
    },
    grid,
    gridnums,
    clues: generateDefaultDirectionsData('clue', rows, cols) as Puzzle['clues'],
    answers: generateDefaultDirectionsData(
      'answer',
      rows,
      cols
    ) as Puzzle['answers'],
  };
};
