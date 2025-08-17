import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { calculateBestMove } from './chessAI';

const difficultyDepth: Record<string, number> = {
  low: 1,
  medium: 2,
  hard: 3,
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyDepth>('low');

  const handleDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare) return false;
    const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
    if (move) {
      setGame(new Chess(game.fen()));
      window.setTimeout(() => {
        const depth = difficultyDepth[difficulty];
        const bestMove = calculateBestMove(game, depth);
        if (bestMove) {
          game.move(bestMove);
          setGame(new Chess(game.fen()));
        }
      }, 200);
      return true;
    }
    return false;
  };

  const onReset = () => setGame(new Chess());

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <h1>Chess Game</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Difficulty: 
          <select value={difficulty} onChange={e => setDifficulty(e.target.value as keyof typeof difficultyDepth)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <button onClick={onReset} style={{ marginLeft: '1rem' }}>Reset</button>
      </div>
      <Chessboard options={{ position: game.fen(), onPieceDrop: handleDrop, id: 'Board' }} />
    </div>
  );
}
