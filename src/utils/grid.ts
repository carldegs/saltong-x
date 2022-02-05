import { Position } from '../types/Position';
import { Puzzle } from '../types/Puzzle';
import { WordDirection } from '../types/WordDirection';

export const isBlock = (value: string) => value === '.';

export const isSamePos = (posA: Position, posB: Position) =>
  posA.x === posB.x && posA.y === posB.y;

export const getPosFromIdx = (idx: number, cols: number): Position => ({
  x: Math.floor(idx / cols),
  y: idx % cols,
});

export const getIdxFromPos = (pos: Position, rows: number): number =>
  pos.x * rows + pos.y;

export const findGridNumber = (
  dir: WordDirection,
  idx: number,
  cols: number,
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid']
) =>
  dir === WordDirection.across
    ? findAcrossGridNumber(idx, cols, gridnums, grid)
    : findDownGridNumber(idx, cols, gridnums, grid);

export const findAcrossGridNumber = (
  idx: number,
  cols: number,
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid']
) => {
  for (let i = idx; i >= 0; i--) {
    if ((i % cols === 0 || isBlock(grid[i - 1])) && gridnums[i]) {
      return { gridnum: gridnums[i], letterIdx: idx - i };
    }
  }

  return { gridnum: 0, letterIndex: 0 };
};

export const getWord = (
  idx: number,
  dir: WordDirection,
  cols: number,
  answerLength: number,
  grid: Puzzle['grid']
) => {
  if (dir === WordDirection.across) {
    return grid.slice(idx, idx + answerLength);
  }

  let i = idx;
  let word: string[] = [];

  while (i < grid.length && i < cols * answerLength + idx && grid[i] !== '.') {
    word = [...word, grid[i]];
    i += cols;
  }

  return word;
};

export const findDownGridNumber = (
  idx: number,
  cols: number,
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid']
) => {
  for (let i = idx; i >= 0; i -= cols) {
    if ((i < cols || isBlock(grid[i - cols])) && gridnums[i]) {
      return { gridnum: gridnums[i], letterIdx: (idx - i) / cols };
    }
  }

  return { gridnum: 0, letterIndex: 0 };
};

export const getFirstGridNumber = (
  gridnums: Puzzle['gridnums'],
  rows: number,
  cols: number
): { pos: Position; idx: number } => {
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      const idx = getIdxFromPos({ x, y }, rows);
      if (gridnums[idx] === 1) {
        return {
          pos: { x, y },
          idx,
        };
      }
    }
  }

  return {
    pos: { x: 0, y: 0 },
    idx: 0,
  };
};

export const getClueIdx = (
  gridnum: number,
  dir: WordDirection,
  clues: Puzzle['clues']
) => clues[dir].findIndex(({ num }) => num === gridnum);

export const findNextEmptyCell = (
  idx: number,
  dir: WordDirection,
  cols: number,
  grid: Puzzle['grid'],
  options?: Partial<{
    allowOverwrite: boolean;
  }>
) => {
  let loopCount = 0;
  let i = idx + (dir === WordDirection.across ? 1 : cols);

  if (i >= grid.length) {
    if (dir === WordDirection.across) {
      i = 0;
    } else {
      const mod = i % cols;
      if (mod >= cols - 1) {
        i = 0;
      } else {
        i = mod + 1;
      }
    }
  }

  while (
    (options?.allowOverwrite ? grid[i] === '.' : grid[i] !== ' ') &&
    loopCount < grid.length
  ) {
    if (i >= grid.length) {
      if (dir === WordDirection.across) {
        i = 0;
      } else {
        const mod = i % cols;
        if (mod >= cols - 1) {
          i = 0;
        } else {
          i = mod + 1;
        }
      }
    } else if (dir === WordDirection.across) {
      i++;
    } else {
      i += cols;
    }

    loopCount++;
  }

  return i;
};

export const getRootGridnumIdx = (gridnums: Puzzle['gridnums'], rootnum) => {
  return gridnums.findIndex((gridnum) => gridnum === rootnum);
};

export const isGridFull = (grid: Puzzle['grid']) =>
  !grid.find((g) => g === ' ');

export const isGridWordFull = (
  idx: number,
  dir: WordDirection,
  cols: number,
  answerLength: number,
  grid: Puzzle['grid']
) => {
  const word = getWord(idx, dir, cols, answerLength, grid);
  return !word.find((g) => g === ' ');
};
