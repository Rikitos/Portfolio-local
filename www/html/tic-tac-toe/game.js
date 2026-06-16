const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let board, currentPlayer, gameOver;

const cells = document.querySelectorAll('.ttt__cell');
const status = document.getElementById('status');
document.getElementById('restart').addEventListener('click', init);

function init() {
  board = Array(9).fill('');
  currentPlayer = 'X';
  gameOver = false;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'ttt__cell';
  });
  status.textContent = `Player X's turn`;
}

function checkWinner() {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every(cell => cell !== '')) return { winner: null, line: [] };
  return null;
}

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const i = parseInt(cell.dataset.index);
    if (gameOver || board[i]) return;

    board[i] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(`ttt__cell--${currentPlayer.toLowerCase()}`);

    const result = checkWinner();
    if (result) {
      gameOver = true;
      if (result.winner) {
        result.line.forEach(idx => cells[idx].classList.add('ttt__cell--winner'));
        status.textContent = `Player ${result.winner} wins!`;
      } else {
        status.textContent = `It's a draw!`;
      }
      cells.forEach(c => c.classList.add('ttt__cell--disabled'));
      return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Player ${currentPlayer}'s turn`;
  });
});

init();
