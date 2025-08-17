import { Chess, Move } from 'chess.js';

const pieceValues: Record<string, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

function evaluateBoard(game: Chess): number {
  return game.board().reduce((sum, row) =>
    sum + row.reduce((rowSum, piece) => {
      if (!piece) return rowSum;
      const value = pieceValues[piece.type];
      return rowSum + (piece.color === 'w' ? value : -value);
    }, 0), 0);
}

function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluateBoard(game);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of game.moves({ verbose: true })) {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      const evalScore = minimax(newGame, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of game.moves({ verbose: true })) {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      const evalScore = minimax(newGame, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function calculateBestMove(game: Chess, depth: number): Move | null {
  let bestMove: Move | null = null;
  let bestValue = -Infinity;
  for (const move of game.moves({ verbose: true })) {
    const newGame = new Chess(game.fen());
    newGame.move(move);
    const value = minimax(newGame, depth - 1, -Infinity, Infinity, false);
    if (value > bestValue) {
      bestValue = value;
      bestMove = move as Move;
    }
  }
  return bestMove;
}
