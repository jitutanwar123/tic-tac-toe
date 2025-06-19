const board = document.getElementById('board');
const cells = board.querySelectorAll('div');
const turnText = document.getElementById('turn');
const message = document.getElementById('message');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const scoreTie = document.getElementById('scoreTie');
const modeSelect = document.getElementById('mode');
const difficultySelect = document.getElementById('difficulty');

let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0, Tie: 0 };

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

cells.forEach(cell => {
  cell.addEventListener('click', () => handleMove(cell));
});

function handleMove(cell) {
  const index = cell.dataset.index;
  if (boardState[index] !== '' || !gameActive) return;

  boardState[index] = currentPlayer;
  cell.textContent = currentPlayer;
  checkWinner();

  if (gameActive) {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnDisplay();
    if (modeSelect.value === 'ai' && currentPlayer === 'O') {
      setTimeout(aiMove, 300);
    }
  }
}

function checkWinner() {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      endGame(boardState[a]);
      return;
    }
  }

  if (!boardState.includes('')) {
    endGame('Tie');
  }
}

function endGame(winner) {
  gameActive = false;
  if (winner === 'Tie') {
    message.textContent = "It's a Tie!";
    scores.Tie++;
  } else {
    message.textContent = `${winner} Wins!`;
    scores[winner]++;
  }
  updateScores();
}

function updateTurnDisplay() {
  turnText.textContent = `${currentPlayer} TURN`;
  document.querySelectorAll('.icon').forEach(icon => icon.classList.remove('active'));
  document.querySelector(`.icon:nth-child(${currentPlayer === 'X' ? 1 : 2})`).classList.add('active');
}

function updateScores() {
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  scoreTie.textContent = scores.Tie;
}

function resetGame() {
  boardState = ['', '', '', '', '', '', '', '', ''];
  cells.forEach(cell => cell.textContent = '');
  currentPlayer = 'X';
  gameActive = true;
  message.textContent = '';
  updateTurnDisplay();
}

function aiMove() {
  let move;
  const difficulty = difficultySelect.value;

  if (difficulty === 'easy') {
    move = randomMove();
  } else if (difficulty === 'medium') {
    move = findWinningMove('O') || findWinningMove('X') || randomMove();
  } else {
    move = minimax(boardState, 'O').index;
  }

  if (move !== undefined) {
    boardState[move] = 'O';
    cells[move].textContent = 'O';
    checkWinner();
    if (gameActive) {
      currentPlayer = 'X';
      updateTurnDisplay();
    }
  }
}

function randomMove() {
  const empty = boardState.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function findWinningMove(player) {
  for (let i = 0; i < boardState.length; i++) {
    if (boardState[i] === '') {
      boardState[i] = player;
      if (isWinner(player)) {
        boardState[i] = '';
        return i;
      }
      boardState[i] = '';
    }
  }
  return null;
}

function isWinner(player) {
  return winningCombos.some(combo => {
    return combo.every(index => boardState[index] === player);
  });
}

function minimax(newBoard, player) {
  const huPlayer = 'X';
  const aiPlayer = 'O';

  const availSpots = newBoard.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);

  if (isWinner(huPlayer)) return { score: -10 };
  if (isWinner(aiPlayer)) return { score: 10 };
  if (availSpots.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if (player === aiPlayer) {
      const result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      const result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[availSpots[i]] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
