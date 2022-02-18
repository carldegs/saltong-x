import axios from 'axios';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { useQuery } from 'react-query';

import { DEFAULT_CURSOR, DEFAULT_PUZZLE, LOCAL_DATA_KEY } from '../constants';
import { Cursor, CursorStatus } from '../types/Cursor';
import LocalData from '../types/LocalData';
import { MovementDirection } from '../types/MovementDirection';
import { Position } from '../types/Position';
import { Puzzle } from '../types/Puzzle';
import { WordDirection } from '../types/WordDirection';
import {
  moveCursorToNextLetter,
  getNextCursor,
  moveCursorToPrevLetter,
  moveCursorToNextWord,
  moveCursorToPrevWord,
  moveCursorToAdjacentCell,
  toggleDirection,
} from '../utils/cursor';
import {
  findGridNumber,
  getClueIdx,
  getFirstGridNumber,
  getPosFromIdx,
  isSamePos,
} from '../utils/grid';
import {
  getLocalDataGrid,
  getLocalStorage,
  setLocalDataGrid,
  setLocalStorage,
} from '../utils/localData';

interface UsePuzzleProps {
  puzzle: Puzzle;
  setSize(dimensions: Partial<Puzzle['size']>): void;
  setClue(num: number, clue: string): void;
  setAnswerLetter(value: string): void;
  setCellValue(value: string, idx?: number): void;
  getPos(idx: number): Position;

  cursor: Cursor;
  setCursor(posOrIdx: Position | number): void;
  toggleCursorDirection(): void;
  // TODO: Also allow pos
  getCursorStatus(idx: number): CursorStatus;
  moveToNextLetter(
    options?: Partial<{
      allowOverwrite: boolean;
    }>
  ): void;
  moveToNextWord(
    options?: Partial<{
      allowOverwrite: boolean;
    }>
  ): void;
  moveToPrevLetter(
    options?: Partial<{
      allowOverwrite: boolean;
    }>
  ): Cursor;
  moveToPrevWord(
    options?: Partial<{
      allowOverwrite: boolean;
    }>
  ): void;
  moveToDirection(mdir: MovementDirection): void;
  isFetchingPuzzle: boolean;
}

const usePuzzle = (): UsePuzzleProps => {
  const router = useRouter();
  const { date } = router.query;
  const [puzzle, setPuzzle] = useState(DEFAULT_PUZZLE);
  const { data, isLoading: isFetchingPuzzle } = useQuery(
    ['puzzle', date as string],
    async () => {
      const { data } = await axios.get<Puzzle>(`/api/puzzle/${date}`);
      return data;
    }
  );

  const [cursor, setCursorState] = useState<Cursor>(DEFAULT_CURSOR);

  const setSize = useCallback(() => undefined, []);

  const setClue = useCallback(() => undefined, []);

  const setAnswerLetter = useCallback(
    (value: string) => {
      const otherDir =
        cursor.dir === WordDirection.across
          ? WordDirection.down
          : WordDirection.across;

      const { gridnum: otherGridNum, letterIdx: otherLetterIdx } =
        findGridNumber(
          otherDir,
          cursor.idx,
          puzzle.size.cols,
          puzzle.gridnums,
          puzzle.grid
        );
      const otherClueIdx = getClueIdx(otherGridNum, otherDir, puzzle.clues);
      setPuzzle((curr) => {
        const resp = {
          ...curr,
          answers: {
            ...curr.answers,
            [cursor.dir]: Object.assign([], curr.answers[cursor.dir], {
              [cursor.clueIdx]: {
                ...curr.answers[cursor.dir][cursor.clueIdx],
                answer: Object.assign(
                  [],
                  curr.answers[cursor.dir][cursor.clueIdx].answer,
                  { [cursor.letterIdx]: value }
                ),
              },
            }),
            [otherDir]: Object.assign([], curr.answers[otherDir], {
              [otherClueIdx]: {
                ...curr.answers[otherDir][otherClueIdx],
                answer: Object.assign(
                  [],
                  curr.answers[otherDir][otherClueIdx].answer,
                  { [otherLetterIdx]: value }
                ),
              },
            }),
          },
        };

        return resp;
      });
    },
    [
      cursor.clueIdx,
      cursor.dir,
      cursor.idx,
      cursor.letterIdx,
      puzzle.clues,
      puzzle.grid,
      puzzle.gridnums,
      puzzle.size.cols,
    ]
  );

  const setCellValue = useCallback(
    (value: string, idx?: number) => {
      setPuzzle((curr) => ({
        ...curr,
        grid: Object.assign([], curr.grid, { [idx || cursor.idx]: value }),
      }));
    },
    [cursor.idx]
  );

  const setCursor = useCallback(
    (posOrIdx: Position | number) => {
      setCursorState((cursor) => {
        return getNextCursor(
          posOrIdx,
          cursor,
          puzzle.size,
          puzzle.clues,
          puzzle.gridnums,
          puzzle.grid
        );
      });
    },
    [puzzle.size, puzzle.gridnums, puzzle.grid, puzzle.clues]
  );

  const toggleCursorDirection = useCallback(() => {
    setCursorState((cursor) => {
      return toggleDirection(
        cursor,
        puzzle.size,
        puzzle.clues,
        puzzle.gridnums,
        puzzle.grid
      );
    });
  }, [puzzle.clues, puzzle.grid, puzzle.gridnums, puzzle.size]);

  const moveToNextLetter = useCallback(
    (
      options: Partial<{
        allowOverwrite: boolean;
      }>
    ) => {
      setCursorState((cursor) => {
        return moveCursorToNextLetter(
          cursor,
          puzzle.size,
          puzzle.clues,
          puzzle.gridnums,
          puzzle.grid,
          options
        );
      });
    },
    [puzzle.size, puzzle.clues, puzzle.gridnums, puzzle.grid]
  );

  const moveToNextWord = useCallback(
    (
      options: Partial<{
        allowOverwrite: boolean;
      }>
    ) => {
      setCursorState((cursor) => {
        return moveCursorToNextWord(
          cursor,
          puzzle.size,
          puzzle.clues,
          puzzle.answers,
          puzzle.gridnums,
          puzzle.grid,
          options
        );
      });
    },
    [puzzle.size, puzzle.clues, puzzle.answers, puzzle.gridnums, puzzle.grid]
  );

  const moveToPrevWord = useCallback(
    (
      options: Partial<{
        allowOverwrite: boolean;
      }>
    ) => {
      setCursorState((cursor) => {
        return moveCursorToPrevWord(
          cursor,
          puzzle.size,
          puzzle.clues,
          puzzle.answers,
          puzzle.gridnums,
          puzzle.grid,
          options
        );
      });
    },
    [puzzle.size, puzzle.clues, puzzle.answers, puzzle.gridnums, puzzle.grid]
  );

  const moveToPrevLetter = useCallback(
    (
      options: Partial<{
        allowOverwrite: boolean;
      }>
    ) => {
      const newCursor = moveCursorToPrevLetter(
        cursor,
        puzzle.size,
        puzzle.clues,
        puzzle.answers,
        puzzle.gridnums,
        puzzle.grid,
        options
      );
      setCursorState(newCursor);
      return newCursor;
    },
    [
      cursor,
      puzzle.size,
      puzzle.clues,
      puzzle.gridnums,
      puzzle.grid,
      puzzle.answers,
    ]
  );

  const getPos = useCallback(
    (idx: number): Position => getPosFromIdx(idx, puzzle.size.cols),
    [puzzle.size.cols]
  );

  const getCursorStatus = useCallback(
    (idx: number) => {
      const { gridnum } = findGridNumber(
        cursor.dir,
        idx,
        puzzle.size.cols,
        puzzle.gridnums,
        puzzle.grid
      );
      const pos = getPosFromIdx(idx, puzzle.size.cols);

      if (isSamePos(pos, cursor.pos)) {
        return CursorStatus.selectedLetter;
      } else if (gridnum === cursor.gridnum) {
        return CursorStatus.selectedWord;
      }

      return CursorStatus.notSelected;
    },
    [
      cursor.dir,
      puzzle.size.cols,
      puzzle.gridnums,
      puzzle.grid,
      cursor.pos,
      cursor.gridnum,
    ]
  );

  useEffect(() => {
    if (!isFetchingPuzzle && data?.id === puzzle.id) {
      setLocalDataGrid(puzzle.id, puzzle.grid);
    }
  }, [puzzle.grid, isFetchingPuzzle, puzzle.id, data?.id]);

  useEffect(() => {
    if (!getLocalStorage<LocalData>(LOCAL_DATA_KEY)?.version) {
      setLocalStorage<LocalData>(LOCAL_DATA_KEY, {
        version: 'v0.0.1',
        puzzles: {},
      });
      return;
    }

    if (!isFetchingPuzzle && data?.id) {
      const savedPuzzleGrid = getLocalDataGrid(data.id);
      let newData = { ...data };

      if (savedPuzzleGrid) {
        newData = {
          ...data,
          grid: savedPuzzleGrid,
        };
      }

      setPuzzle(newData);
      setCursorState({
        dir: WordDirection.across,
        ...getFirstGridNumber(data.gridnums, data.size.rows, data.size.cols),
        gridnum: 1,
        clueIdx: 0,
        letterIdx: 0,
      });
    }
  }, [data, isFetchingPuzzle]);

  const moveToDirection = useCallback(
    (mdir: MovementDirection) => {
      setCursorState((cursor) => {
        return moveCursorToAdjacentCell(
          mdir,
          cursor,
          puzzle.size,
          puzzle.clues,
          puzzle.gridnums,
          puzzle.grid
        );
      });
    },
    [puzzle.clues, puzzle.grid, puzzle.gridnums, puzzle.size]
  );

  return {
    puzzle,
    setSize,
    setClue,
    setAnswerLetter,
    getPos,
    setCursor,
    cursor,
    getCursorStatus,
    setCellValue,
    moveToNextLetter,
    moveToNextWord,
    moveToPrevLetter,
    moveToPrevWord,
    toggleCursorDirection,
    isFetchingPuzzle,
    moveToDirection,
  };
};

export default usePuzzle;
