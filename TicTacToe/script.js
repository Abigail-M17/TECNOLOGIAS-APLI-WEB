document.addEventListener('DOMContentLoaded', () => {
  const gameModeSelection = document.getElementById('gameModeSelection');
  const gameContainer = document.getElementById('gameContainer');
  const vsPlayerButton = document.getElementById('vsPlayer');
  const vsComputerButton = document.getElementById('vsComputer');
  const gameModeTitle = document.getElementById('gameModeTitle');
  const statusDisplay = document.getElementById('status');
  const restartButton = document.getElementById('restartButton');
  const backToMenuButton = document.getElementById('backToMenuButton');
  const cells = Array.from(document.querySelectorAll('.cell'));

  let boardState = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameActive = false;
  let isVsComputer = false;

  const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function showMenu(){
    gameContainer.classList.add('hidden');
    gameModeSelection.classList.remove('hidden');
  }

  function showGame(){
    gameModeSelection.classList.add('hidden');
    gameContainer.classList.remove('hidden');
  }

  function startGame(vsComputer){
    isVsComputer = vsComputer;
    gameModeTitle.textContent = vsComputer ? 'Modo: Jugador vs Computadora' : 'Modo: Jugador vs Jugador';
    resetGame();
    showGame();
  }

  function resetGame(){
    boardState.fill(null);
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = `Turno del jugador: ${currentPlayer}`;
    cells.forEach(c => {
      c.textContent = '';
      c.classList.remove('x','o','win');
    });
  }

  function updateCell(index, player){
    boardState[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
  }

  function checkResult(){
    for(const combo of winningConditions){
      const [a,b,c] = combo;
      if(boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]){
        cells[a].classList.add('win');
        cells[b].classList.add('win');
        cells[c].classList.add('win');
        statusDisplay.textContent = `¡El jugador ${boardState[a]} ha ganado!`;
        gameActive = false;
        return;
      }
    }
    if(!boardState.includes(null)){
      statusDisplay.textContent = '¡Es un empate!';
      gameActive = false;
    }
  }

  // IA PERFECTA (Minimax)
  function computerMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === null) {
        boardState[i] = 'O';
        let score = minimax(boardState, 0, false);
        boardState[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    updateCell(move, 'O');
    checkResult();
    if (gameActive) {
      currentPlayer = 'X';
      statusDisplay.textContent = `Turno del jugador: ${currentPlayer}`;
    }
  }

  function minimax(board, depth, isMaximizing) {
    let result = evaluateBoard();
    if (result !== null) return result - depth;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          let score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  function evaluateBoard() {
    for (const [a, b, c] of winningConditions) {
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        if (boardState[a] === 'O') return 10;  
        else if (boardState[a] === 'X') return -10;
      }
    }
    if (!boardState.includes(null)) return 0;
    return null;
  }

  function handleCellClick(e){
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    if(!gameActive || boardState[index] !== null) return;

    updateCell(index, currentPlayer);
    checkResult();

    if(!gameActive) return;

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = `Turno del jugador: ${currentPlayer}`;

    if(isVsComputer && currentPlayer === 'O'){
      setTimeout(computerMove, 300);
    }
  }

  cells.forEach(cell => cell.addEventListener('click', handleCellClick));

  restartButton.addEventListener('click', resetGame);
  backToMenuButton.addEventListener('click', () => {
    resetGame();
    gameModeTitle.textContent = '';
    showMenu();
  });

  vsPlayerButton.addEventListener('click', () => startGame(false));
  vsComputerButton.addEventListener('click', () => startGame(true));

  showMenu();
});