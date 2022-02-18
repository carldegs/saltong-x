import { Position } from './Position';
import { WordDirection } from './WordDirection';

export interface Cursor {
  dir: WordDirection;
  pos: Position;
  idx: number;
  gridnum: number;
  clueIdx: number;
  letterIdx: number;
}

export enum CursorStatus {
  selectedLetter = 'selectedLetter',
  selectedWord = 'selectedWord',
  notSelected = 'notSelected',
}
