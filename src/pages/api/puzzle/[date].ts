import createApiHandler from '../../../lib/api/create-api-handler';
import { mockPuzzles } from '../../../mock/mockPuzzle';

const PuzzleHandler = createApiHandler().get((req, res) => {
  const puzzle = mockPuzzles[req.query.date as string];
  res.json(puzzle);
});

export default PuzzleHandler;
