import { Cursor } from '../types/Cursor';
import { MovementDirection } from '../types/MovementDirection';
import { Position } from '../types/Position';
import { Puzzle } from '../types/Puzzle';
import { WordDirection } from '../types/WordDirection';
import {
  isSamePos,
  getIdxFromPos,
  findGridNumber,
  getClueIdx,
  getPosFromIdx,
  isBlock,
  isGridFull,
  isGridWordFull,
  getRootGridnumIdx,
} from './grid';

export function getNextCursor(
  posOrIdx: Position | number,
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid']
): Cursor {
  let pos: Position;
  let idx: number;

  if (isNaN(posOrIdx as any)) {
    pos = posOrIdx as Position;
    idx = getIdxFromPos(pos, size.rows);
  } else {
    idx = posOrIdx as number;
    pos = getPosFromIdx(idx, size.cols);
  }

  const dir = isSamePos(pos, cursor.pos)
    ? cursor.dir === WordDirection.across
      ? WordDirection.down
      : WordDirection.across
    : cursor.dir;

  const { gridnum, letterIdx } = findGridNumber(
    dir,
    idx,
    size.cols,
    gridnums,
    grid
  );
  const clueIdx = getClueIdx(gridnum, dir, clues);

  return {
    pos,
    idx,
    dir,
    gridnum,
    letterIdx,
    clueIdx,
  };
}

export const moveCursorToNextLetter = (
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid'],
  options?: Partial<{
    allowOverwrite: boolean;
  }>
): Cursor => {
  let nextCell =
    cursor.idx + (cursor.dir === WordDirection.across ? 1 : size.cols);

  if (nextCell >= grid.length || isBlock(grid[nextCell])) {
    // go to next gridnum for that direction
    const nextClueIdx = (cursor.clueIdx + 1) % clues[cursor.dir].length;
    const nextGridnum = clues[cursor.dir][nextClueIdx].num;
    nextCell = gridnums.findIndex((gn) => gn === nextGridnum);
  }

  if (!options?.allowOverwrite && !isGridFull(grid)) {
    let loopCount = 0;

    while (grid[nextCell] !== ' ' && loopCount < grid.length) {
      if (nextCell >= grid.length || isBlock(grid[nextCell])) {
        // go to next gridnum for that direction
        const nextClueIdx = (cursor.clueIdx + 1) % clues[cursor.dir].length;
        const nextGridnum = clues[cursor.dir][nextClueIdx].num;
        nextCell = gridnums.findIndex((gn) => gn === nextGridnum);
      } else if (cursor.dir === WordDirection.across) {
        nextCell++;
      } else {
        nextCell += size.cols;
      }

      loopCount++;
    }
  }

  return getNextCursor(nextCell, cursor, size, clues, gridnums, grid);
};

export const moveCursorToPrevLetter = (
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  answers: Puzzle['answers'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid'],
  options?: Partial<{
    allowOverwrite: boolean;
  }>
): Cursor => {
  let prevCell =
    cursor.idx - (cursor.dir === WordDirection.across ? 1 : size.cols);

  if (prevCell < 0 || isBlock(grid[prevCell])) {
    // go to prev gridnum for that direction
    const prevClueIdx =
      cursor.clueIdx === 0 ? clues[cursor.dir].length - 1 : cursor.clueIdx - 1;
    const prevGridnum = clues[cursor.dir][prevClueIdx].num;
    const prevAnswerLength =
      (answers[cursor.dir][prevClueIdx]?.length ||
        answers[cursor.dir][prevClueIdx].answer.length) - 1;

    prevCell =
      gridnums.findIndex((gn) => gn === prevGridnum) +
      prevAnswerLength * (cursor.dir === WordDirection.across ? 1 : size.cols);
  }

  if (!options?.allowOverwrite && !isGridFull(grid)) {
    let loopCount = 0;

    while (grid[prevCell] !== ' ' && loopCount < grid.length) {
      if (prevCell >= grid.length || isBlock(grid[prevCell])) {
        // go to prev gridnum for that direction
        const prevClueIdx =
          cursor.clueIdx === 0
            ? clues[cursor.dir].length - 1
            : cursor.clueIdx - 1;
        const prevGridnum = clues[cursor.dir][prevClueIdx].num;
        const prevAnswerLength =
          (answers[cursor.dir][prevClueIdx]?.length ||
            answers[cursor.dir][prevClueIdx].answer.length) - 1;

        prevCell =
          gridnums.findIndex((gn) => gn === prevGridnum) +
          prevAnswerLength *
            (cursor.dir === WordDirection.across ? 1 : size.cols);
      } else if (cursor.dir === WordDirection.across) {
        prevCell--;
      } else {
        prevCell -= size.cols;
      }

      loopCount++;
    }
  }

  return getNextCursor(prevCell, cursor, size, clues, gridnums, grid);
};

export const moveCursorToNextWord = (
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  answers: Puzzle['answers'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid'],
  options?: Partial<{
    allowOverwrite: boolean;
  }>
) => {
  const { allowOverwrite } = options || {};
  const answerLength = answers[cursor.dir][cursor.clueIdx].answer.length;

  let nextClueIdx = (cursor.clueIdx + 1) % clues[cursor.dir].length;
  let nextAnswerLength = answers[cursor.dir][nextClueIdx].answer.length;
  let nextClueGridnum = clues[cursor.dir][nextClueIdx].num;
  let nextIdx = getRootGridnumIdx(gridnums, nextClueGridnum);

  while (nextClueIdx !== cursor.clueIdx) {
    if (
      !isGridWordFull(nextIdx, cursor.dir, size.cols, answerLength, grid) ||
      allowOverwrite
    ) {
      break;
    }

    nextClueIdx = (nextClueIdx + 1) % clues[cursor.dir].length;
    nextAnswerLength = answers[cursor.dir][nextClueIdx].answer.length;
    nextClueGridnum = clues[cursor.dir][nextClueIdx].num;
    nextIdx = getRootGridnumIdx(gridnums, nextClueGridnum);
  }

  if (nextClueIdx === cursor.clueIdx) {
    nextClueIdx = (nextClueIdx + 1) % clues[cursor.dir].length;
    nextClueGridnum = clues[cursor.dir][nextClueIdx].num;
    nextIdx = getRootGridnumIdx(gridnums, nextClueGridnum);
    return getNextCursor(nextIdx, cursor, size, clues, gridnums, grid);
  }

  if (!allowOverwrite) {
    let n = 0;
    while (n < nextAnswerLength) {
      if (grid[nextIdx + n] === ' ') {
        nextIdx += n;
        break;
      }
      n++;
    }
  }

  return getNextCursor(nextIdx, cursor, size, clues, gridnums, grid);
};

export const moveCursorToPrevWord = (
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  answers: Puzzle['answers'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid'],
  options?: Partial<{
    allowOverwrite: boolean;
  }>
) => {
  const { allowOverwrite } = options || {};
  const answerLength = answers[cursor.dir][cursor.clueIdx].answer.length;

  let nextClueIdx =
    cursor.clueIdx - 1 < 0 ? clues[cursor.dir].length - 1 : cursor.clueIdx - 1;
  let nextAnswerLength = answers[cursor.dir][nextClueIdx].answer.length;
  let nextClueGridnum = clues[cursor.dir][nextClueIdx].num;
  let nextIdx = getRootGridnumIdx(gridnums, nextClueGridnum);

  while (nextClueIdx !== cursor.clueIdx) {
    if (
      !isGridWordFull(nextIdx, cursor.dir, size.cols, answerLength, grid) ||
      allowOverwrite
    ) {
      break;
    }

    nextClueIdx =
      nextClueIdx - 1 < 0 ? clues[cursor.dir].length - 1 : nextClueIdx - 1;
    nextAnswerLength = answers[cursor.dir][nextClueIdx].answer.length;
    nextClueGridnum = clues[cursor.dir][nextClueIdx].num;
    nextIdx = getRootGridnumIdx(gridnums, nextClueGridnum);
  }

  if (nextClueIdx === cursor.clueIdx) {
    nextClueIdx =
      nextClueIdx - 1 < 0 ? clues[cursor.dir].length - 1 : nextClueIdx - 1;
    nextClueGridnum = clues[cursor.dir][nextClueIdx].num;
    nextIdx = getRootGridnumIdx(gridnums, nextClueGridnum);
    return getNextCursor(nextIdx, cursor, size, clues, gridnums, grid);
  }

  if (!allowOverwrite) {
    let n = 0;
    while (n < nextAnswerLength) {
      if (grid[nextIdx + n] === ' ') {
        nextIdx += n;
        break;
      }
      n++;
    }
  }

  return getNextCursor(nextIdx, cursor, size, clues, gridnums, grid);
};

export const toggleDirection = (
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid']
) => {
  const dir =
    cursor.dir === WordDirection.across
      ? WordDirection.down
      : WordDirection.across;
  const { gridnum, letterIdx } = findGridNumber(
    dir,
    cursor.idx,
    size.cols,
    gridnums,
    grid
  );
  const clueIdx = getClueIdx(gridnum, dir, clues);

  return {
    ...cursor,
    dir,
    gridnum,
    letterIdx,
    clueIdx,
  };
};

const isMovementSameWordDirection = (
  mdir: MovementDirection,
  dir: WordDirection
) => {
  return (
    ((mdir === MovementDirection.ArrowDown ||
      mdir === MovementDirection.ArrowUp) &&
      dir === WordDirection.down) ||
    ((mdir === MovementDirection.ArrowRight ||
      mdir === MovementDirection.ArrowLeft) &&
      dir === WordDirection.across)
  );
};

export const moveCursorToAdjacentCell = (
  mdir: MovementDirection,
  cursor: Cursor,
  size: Puzzle['size'],
  clues: Puzzle['clues'],
  gridnums: Puzzle['gridnums'],
  grid: Puzzle['grid']
) => {
  let newIdx = cursor.idx;

  switch (mdir) {
    case MovementDirection.ArrowUp:
      newIdx = cursor.idx - size.cols;
      break;
    case MovementDirection.ArrowDown:
      newIdx = cursor.idx + size.cols;
      break;
    case MovementDirection.ArrowRight:
      newIdx = cursor.idx + 1;
      break;
    case MovementDirection.ArrowLeft:
      newIdx = cursor.idx - 1;
      break;
  }

  let isOutOfBounds = false;

  switch (mdir) {
    case MovementDirection.ArrowUp:
      isOutOfBounds = cursor.pos.x === 0;
      break;
    case MovementDirection.ArrowDown:
      isOutOfBounds = cursor.pos.x === size.rows - 1;
      break;
    case MovementDirection.ArrowRight:
      isOutOfBounds = cursor.pos.y === size.cols - 1;
      break;
    case MovementDirection.ArrowLeft:
      isOutOfBounds = cursor.pos.y === 0;
      break;
  }

  if (grid[newIdx] === '.' || isOutOfBounds) {
    return cursor;
  }

  if (!isMovementSameWordDirection(mdir, cursor.dir)) {
    return toggleDirection(cursor, size, clues, gridnums, grid);
  }

  return getNextCursor(newIdx, cursor, size, clues, gridnums, grid);
};
