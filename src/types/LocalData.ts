import { Puzzle } from './Puzzle';

interface LocalData {
  puzzles: Record<string, Puzzle['grid']>;
  version: string;
}

export default LocalData;
