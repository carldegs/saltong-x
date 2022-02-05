import { Cursor } from './types/Cursor';
import { Puzzle } from './types/Puzzle';
import { WordDirection } from './types/WordDirection';

export const DEFAULT_CURSOR: Cursor = {
  dir: WordDirection.across,
  pos: {
    x: 0,
    y: 0,
  },
  idx: -1,
  gridnum: 0,
  clueIdx: 0,
  letterIdx: 0,
};

export const DEFAULT_PUZZLE: Puzzle = {
  title: '',
  id: '',
  author: '',
  editor: '',
  publisher: '',
  date: '',
  size: {
    rows: 0,
    cols: 0,
  },
  grid: [],
  gridnums: [],
  clues: {
    across: [],
    down: [],
  },
  answers: {
    across: [],
    down: [],
  },
};

export const LOCAL_DATA_KEY = 'saltong-x-local-data';
