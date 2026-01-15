import React from 'react';

const GameStatus = ({ isGameOver, isGameWon }) => {
  if (!isGameOver) return null;

  const message = isGameWon 
    ? '¡Felicidades! ¡Has ganado! 🎉' 
    : '¡Game Over! Inténtalo de nuevo. 💥';

  return (
    <div 
      className="game-status"
      style={{
        padding: '10px',
        margin: '10px 0',
        borderRadius: '4px',
        backgroundColor: isGameWon ? '#4caf50' : '#f44336',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
      }}
    >
      {message}
    </div>
  );
};

export default GameStatus;
