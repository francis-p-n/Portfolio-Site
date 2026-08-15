/* Picks one of the puzzles at random and opens it as a window. Each game
   module exposes the same shape — `meta` for the window chrome and `start`
   to mount itself into the window body — so adding another is a one-line
   change here. */
import * as sudoku from './sudoku.js';
import * as wordle from './wordle.js';
import * as connections from './connections.js';

const GAMES = [sudoku, wordle, connections];

export function openRandomPuzzle() {
  const game = GAMES[Math.floor(Math.random() * GAMES.length)];
  const { id, title, icon, w, h } = game.meta;

  /* mkWin replaces any existing window with this id, so re-opening the same
     game deals a fresh puzzle rather than stacking a second copy. */
  window.mkWin(id, title, icon, w, h, 0, 0, '');
  const root = document.getElementById('wb-' + id);
  if (root) game.start(root);
  return id;
}
