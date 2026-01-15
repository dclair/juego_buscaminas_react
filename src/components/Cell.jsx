import React from 'react';

const Cell = ({ 
  cell, 
  onClick, 
  onContextMenu 
}) => {
  const getCellContent = () => {
    if (!cell.isRevealed) {
      return cell.isFlagged ? '🚩' : '';
    }
    
    if (cell.isMine) {
      return '💣';
    }
    
    return cell.adjacentMines > 0 ? cell.adjacentMines : '';
  };

  const getCellClassName = () => {
    let className = 'cell';
    
    if (cell.isRevealed) {
      className += ' revealed';
      if (cell.isMine) {
        className += ' mine';
      } else if (cell.adjacentMines > 0) {
        className += ` adjacent-${cell.adjacentMines}`;
      }
    } else if (cell.isFlagged) {
      className += ' flagged';
    }
    
    return className;
  };

  // Manejar el clic derecho para evitar el menú contextual
  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu(e);
  };

  // Función para accesibilidad
  function getAriaLabel() {
    if (!cell.isRevealed) {
      return cell.isFlagged ? 'Celda con bandera' : 'Celda sin revelar';
    }
    
    if (cell.isMine) {
      return 'Mina';
    }
    
    return cell.adjacentMines > 0 
      ? `Celda con ${cell.adjacentMines} minas adyacentes`
      : 'Celda vacía';
  }
  return (
    <div
      className={getCellClassName()}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      role="gridcell"
      aria-label={getAriaLabel()}
    >
      <span
        className={
          cell.isMine
            ? 'mine-emoji'
            : cell.isFlagged
            ? 'flag-emoji'
            : cell.adjacentMines > 0
            ? `number number-${cell.adjacentMines}`
            : ''
        }
      >
        {getCellContent()}
      </span>
    </div>
  );

  
};

export default React.memo(Cell);
