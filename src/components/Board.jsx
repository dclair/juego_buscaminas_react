import { useEffect, useState, useCallback } from 'react';
import Cell from './Cell';

// Niveles de dificultad
const DIFFICULTY_LEVELS = {
  beginner: { rows: 8, cols: 8, mines: 10 },
  intermediate: { rows: 12, cols: 12, mines: 30 },
  expert: { rows: 16, cols: 16, mines: 60 }
};

const Board = () => {
  // Configuración del juego
  const [config, setConfig] = useState({
    ...DIFFICULTY_LEVELS.beginner,
    difficulty: 'beginner',
    customRows: 8,
    customCols: 8,
    customMines: 10
  });

  const [board, setBoard] = useState([]);
  const [gameState, setGameState] = useState({
    isGameOver: false,
    isGameStarted: false,
    isGameWon: false,
    seconds: 0,
    flagsPlaced: 0,
    revealedCount: 0,
    bestTime: localStorage.getItem(`bestTime_${config.difficulty}`) || null
  });

  // Crear tablero vacío
  const createEmptyBoard = useCallback(() => {
    return Array.from({ length: config.rows }, (_, i) =>
      Array.from({ length: config.cols }, (_, j) => ({
        row: i,
        col: j,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        adjacentMines: 0
      }))
    );
  }, [config.rows, config.cols]);

  // Inicializar juego
  const initializeBoard = useCallback(() => {
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    setGameState(prev => ({
      ...prev,
      isGameOver: false,
      isGameStarted: false,
      isGameWon: false,
      seconds: 0,
      flagsPlaced: 0,
      revealedCount: 0
    }));
  }, [createEmptyBoard]);

  useEffect(() => {
    // Wrap in a function to avoid direct setState in effect
    const initGame = () => {
      const newBoard = createEmptyBoard();
      setBoard(newBoard);
      setGameState(prev => ({
        ...prev,
        isGameOver: false,
        isGameStarted: false,
        isGameWon: false,
        seconds: 0,
        flagsPlaced: 0,
        revealedCount: 0
      }));
    };
    
    initGame();
  }, [config.rows, config.cols, config.mines, createEmptyBoard]); // Include createEmptyBoard in dependencies

  // Generar posiciones de minas
  const generateMinePositions = useCallback((firstClickRow, firstClickCol) => {
    const positions = [];
    const totalCells = config.rows * config.cols;
    const mineIndices = new Set();
    
    const getRandomIndex = (max) => Math.floor(Math.random() * max);

    while (mineIndices.size < config.mines) {
      const index = getRandomIndex(totalCells);
      const row = Math.floor(index / config.cols);
      const col = index % config.cols;

      if (Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1) continue;

      mineIndices.add(index);
    }

    mineIndices.forEach(index => {
      positions.push({ row: Math.floor(index / config.cols), col: index % config.cols });
    });

    return positions;
  }, [config.rows, config.cols, config.mines]);

  // Calcular minas adyacentes
  const calculateAdjacentMines = (boardCopy) => {
    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        if (!boardCopy[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue;
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < config.rows && nj >= 0 && nj < config.cols && boardCopy[ni][nj].isMine) {
                count++;
              }
            }
          }
          boardCopy[i][j].adjacentMines = count;
        }
      }
    }
  };

  // Colocar minas después del primer clic
  const placeMines = (row, col, boardCopy) => {
    const newBoard = boardCopy || JSON.parse(JSON.stringify(board));
    const minePositions = generateMinePositions(row, col);
    minePositions.forEach(({ row, col }) => newBoard[row][col].isMine = true);
    calculateAdjacentMines(newBoard);
    return newBoard;
  };

  // Revelado recursivo de celdas
  const revealAdjacentCells = (row, col, boardCopy) => {
    if (row < 0 || row >= config.rows || col < 0 || col >= config.cols) return boardCopy;
    const cell = boardCopy[row][col];
    if (cell.isRevealed || cell.isFlagged) return boardCopy;

    boardCopy[row][col].isRevealed = true;

    if (cell.adjacentMines === 0 && !cell.isMine) {
      for (let i = Math.max(0, row - 1); i <= Math.min(config.rows - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(config.cols - 1, col + 1); j++) {
          if (i !== row || j !== col) {
            boardCopy = revealAdjacentCells(i, j, boardCopy);
          }
        }
      }
    }

    return boardCopy;
  };

  // Finalizar juego
  const endGame = (isWin, boardParam) => {
    const newBoard = boardParam ? JSON.parse(JSON.stringify(boardParam)) : JSON.parse(JSON.stringify(board));

    for (let i = 0; i < config.rows; i++) {
      for (let j = 0; j < config.cols; j++) {
        const cell = newBoard[i][j];
        if (!isWin && cell.isMine) newBoard[i][j].isRevealed = true;
        if (isWin && cell.isMine) newBoard[i][j].isFlagged = true;
      }
    }

    setBoard(newBoard);
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      isGameWon: isWin,
      isGameStarted: false,
      flagsPlaced: isWin ? config.mines : prev.flagsPlaced
    }));

    if (isWin) {
      const key = `bestTime_${config.difficulty}`;
      const bestTime = localStorage.getItem(key);
      if (!bestTime || gameState.seconds < parseInt(bestTime)) localStorage.setItem(key, gameState.seconds.toString());
    }
  };

  // Manejar clic en celda
  const handleCellClick = (row, col) => {
    if (gameState.isGameOver || board[row][col].isFlagged) return;
    let newBoard = JSON.parse(JSON.stringify(board));

    if (!gameState.isGameStarted) {
      newBoard = placeMines(row, col, newBoard);
      setGameState(prev => ({ ...prev, isGameStarted: true }));
    }

    newBoard = revealAdjacentCells(row, col, newBoard);
    const revealedCount = newBoard.flat().filter(c => c.isRevealed).length;

    setBoard(newBoard);
    setGameState(prev => ({ ...prev, revealedCount }));

    if (newBoard[row][col].isMine) endGame(false, newBoard);
    else if (revealedCount === config.rows * config.cols - config.mines) endGame(true, newBoard);
  };

  // Clic derecho (bandera)
  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameState.isGameOver || board[row][col].isRevealed) return;

    const newBoard = JSON.parse(JSON.stringify(board));
    const cell = newBoard[row][col];

    if (cell.isFlagged) {
      cell.isFlagged = false;
      setGameState(prev => ({ ...prev, flagsPlaced: prev.flagsPlaced - 1 }));
    } else if (gameState.flagsPlaced < config.mines) {
      cell.isFlagged = true;
      setGameState(prev => ({ ...prev, flagsPlaced: prev.flagsPlaced + 1 }));
    }

    setBoard(newBoard);
  };

  // Temporizador
  useEffect(() => {
    let interval;
    if (gameState.isGameStarted && !gameState.isGameOver) {
      interval = setInterval(() => setGameState(prev => ({ ...prev, seconds: prev.seconds + 1 })), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isGameStarted, gameState.isGameOver]);

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // Nuevo juego
  const handleNewGame = () => initializeBoard();

  // Cambiar dificultad
  const handleDifficultyChange = (difficulty) => {
    if (difficulty === 'custom') {
      setConfig(prev => ({ ...prev, difficulty: 'custom', rows: prev.customRows, cols: prev.customCols, mines: prev.customMines }));
    } else {
      const { rows, cols, mines } = DIFFICULTY_LEVELS[difficulty];
      setConfig(prev => ({ ...prev, difficulty, rows, cols, mines }));
    }
    handleNewGame();
  };

  return (
    <div className="minesweeper">
      <h1>Buscaminas</h1>
      <div className="controls">
        <div className="difficulty">
          {['beginner','intermediate','expert','custom'].map(level => (
            <button
              key={level}
              className={config.difficulty===level ? 'active':''}
              onClick={() => handleDifficultyChange(level)}
            >
              {level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedio' : level==='expert'?'Experto':'Personalizado'}
            </button>
          ))}
        </div>

        {config.difficulty === 'custom' && (
  <div className="custom-settings">
    <div>
      <label>Filas: </label>
      <input 
        type="number" 
        min="5" 
        max="20" 
        value={config.customRows} 
        onChange={(e) => setConfig(prev => ({
          ...prev,
          customRows: parseInt(e.target.value) || 5,
          rows: parseInt(e.target.value) || 5,
          // Ajustar minas máximas si filas cambian
          mines: Math.min(prev.customMines, Math.floor((parseInt(e.target.value)||5) * prev.customCols * 0.35))
        }))}
      />
    </div>
    <div>
      <label>Columnas: </label>
      <input 
        type="number" 
        min="5" 
        max="30" 
        value={config.customCols} 
        onChange={(e) => setConfig(prev => ({
          ...prev,
          customCols: parseInt(e.target.value) || 5,
          cols: parseInt(e.target.value) || 5,
          mines: Math.min(prev.customMines, Math.floor(prev.customRows * (parseInt(e.target.value)||5) * 0.35))
        }))}
      />
    </div>
    <div>
      <label>Minas: </label>
      <input 
        type="number" 
        min="1" 
        max={Math.floor(config.customRows * config.customCols * 0.35)} 
        value={config.customMines} 
        onChange={(e) => setConfig(prev => ({
          ...prev,
          customMines: parseInt(e.target.value) || 1,
          mines: Math.min(parseInt(e.target.value)||1, Math.floor(prev.customRows * prev.customCols * 0.35))
        }))}
      />
      <span className="max-mines">(Máx: {Math.floor(config.customRows * config.customCols * 0.35)})</span>
    </div>
  </div>
)}


        <div className="game-info">
          <div>💣 {config.mines - gameState.flagsPlaced}</div>
          <button className="new-game-btn" onClick={handleNewGame}>Nuevo Juego</button>
          <div>⏱️ {formatTime(gameState.seconds)}</div>
        </div>
      </div>

      <div className="board" style={{ '--rows': config.rows, '--cols': config.cols }}>
        {board.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => {
              const cellClasses = ['cell'];
              let content = '';
              let spanClass = '';

              if (cell.isRevealed) {
                cellClasses.push('revealed');
                if (cell.isMine) { 
                  cellClasses.push('mine'); 
                  content = '💣'; 
                  spanClass = 'mine-emoji'; 
                } else if (cell.adjacentMines > 0) { 
                  content = cell.adjacentMines.toString();
                  cellClasses.push(`adjacent-${cell.adjacentMines}`);
                  spanClass = `number number-${cell.adjacentMines}`;
                }
              } else if (cell.isFlagged) {
                cellClasses.push('flagged'); 
                content = '🚩'; 
                spanClass = 'flag-emoji';
              }

              // Aplicar estilos en línea para asegurar visibilidad
              const cellStyle = {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                fontSize: '1.5em',
                fontWeight: 'bold',
                color: cell.isRevealed && cell.adjacentMines > 0 ? 
                  ['blue', 'green', 'red', 'purple', 'maroon', 'teal', 'black', 'gray'][cell.adjacentMines - 1] : 'inherit'
              };

              return (
                <div 
                  key={`${i}-${j}`} 
                  className={cellClasses.join(' ')} 
                  onClick={()=>handleCellClick(i,j)} 
                  onContextMenu={(e)=>handleRightClick(e,i,j)}
                >
                  <span style={cellStyle} className={spanClass}>
                    {content}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameState.isGameOver && (
        <div className={`message ${gameState.isGameWon ? 'won':'lost'}`}>
          {gameState.isGameWon ? `¡Felicidades! 🎉 Tiempo: ${formatTime(gameState.seconds)}` : '¡Game Over! 💥'}
        </div>
      )}
    </div>
  );
};

export default Board;
