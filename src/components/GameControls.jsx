import React from 'react';

const GameControls = ({ 
  difficulty, 
  onDifficultyChange, 
  onNewGame, 
  minesLeft, 
  time 
}) => {
  return (
    <div className="game-controls">
      <div className="difficulty-selector">
        <label htmlFor="difficulty">Dificultad: </label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          style={{
            padding: '5px',
            margin: '0 10px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="beginner">Principiante</option>
          <option value="intermediate">Intermedio</option>
          <option value="expert">Experto</option>
        </select>
      </div>
      
      <div className="game-info" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        margin: '10px 0',
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px'
      }}>
        <div className="mines-left">
          💣: {minesLeft}
        </div>
        <button 
          onClick={onNewGame}
          style={{
            padding: '5px 15px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Nuevo Juego
        </button>
        <div className="timer">
          ⏱️: {time}s
        </div>
      </div>
    </div>
  );
};

export default GameControls;
