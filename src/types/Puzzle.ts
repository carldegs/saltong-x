import { Answer } from './Answer';
import { Clue } from './Clue';
import { WordDirection } from './WordDirection';

export interface Puzzle {
  title: string;
  id: string;
  author: string;
  editor?: string;
  publisher?: string;
  date: string;
  size: {
    rows: number;
    cols: number;
  };
  grid: string[];
  gridnums: number[];
  clues: Record<WordDirection, Clue[]>;
  answers: Record<WordDirection, Answer[]>;
}
