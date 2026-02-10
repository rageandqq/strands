import { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

const GRID = [
  ['N', 'E', 'R', 'E', 'M', 'A'],
  ['T', 'I', 'T', 'N', 'E', 'S'],
  ['L', 'U', 'L', 'E', 'A', 'A'],
  ['I', 'P', 'A', 'C', 'A', 'N'],
  ['V', 'O', 'L', 'V', 'T', 'N'],
  ['I', 'E', 'Y', 'D', 'P', 'U'],
  ['D', 'S', 'M', 'I', 'P', 'U'],
  ['D', 'H', 'I', 'E', 'B', 'C']
];

const THEME_WORDS = ['SAMEER', 'SIDDHI', 'TULIP', 'CUPID', 'PUNTACANA', 'LOVE'];
const SPANGRAM = 'BEMYVALENTINE';
const ALL_WORDS = [...THEME_WORDS, SPANGRAM];

export default function StrandsGame() {
  const [introPhase, setIntroPhase] = useState('rising');
  const [showRadialPulse, setShowRadialPulse] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [cellStates, setCellStates] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [shake, setShake] = useState(false);
  const [foundPaths, setFoundPaths] = useState([]);
  const [tempPath, setTempPath] = useState([]);
  const gridRef = useRef(null);

  // Intro animation sequence
  useEffect(() => {
    if (introPhase === 'rising') {
      const timer = setTimeout(() => {
        setIntroPhase('spiraling');
      }, 500);
      return () => clearTimeout(timer);
    }
    
    if (introPhase === 'spiraling') {
      const timer = setTimeout(() => {
        setIntroPhase('hovering');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [introPhase]);

  const handleEnvelopeClick = () => {
    if (introPhase === 'hovering') {
      setShowRadialPulse(true);
      setIntroPhase('transitioning');
      
      setTimeout(() => {
        setIntroPhase('complete');
      }, 600);
    }
  };

  const getCellKey = (row, col) => `${row},${col}`;

  const isAdjacent = (r1, c1, r2, c2) => {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0);
  };

  const getWordFromCells = (cells) => {
    return cells.map(([row, col]) => GRID[row][col]).join('');
  };

  const handleCellEnter = useCallback((row, col) => {
    if (!isDragging) return;
    
    setSelectedCells(prev => {
      const lastCell = prev[prev.length - 1];
      
      // If going back to previous cell, remove last
      if (prev.length >= 2) {
        const prevCell = prev[prev.length - 2];
        if (prevCell[0] === row && prevCell[1] === col) {
          const newSelection = prev.slice(0, -1);
          setCurrentWord(getWordFromCells(newSelection));
          setTempPath(newSelection);
          return newSelection;
        }
      }
      
      // Check if already selected
      const alreadySelected = prev.some(([r, c]) => r === row && c === col);
      if (alreadySelected) return prev;
      
      // Check adjacency
      if (lastCell && !isAdjacent(lastCell[0], lastCell[1], row, col)) {
        return prev;
      }
      
      const newSelection = [...prev, [row, col]];
      setCurrentWord(getWordFromCells(newSelection));
      setTempPath(newSelection);
      return newSelection;
    });
  }, [isDragging]);

  const handleCellDown = useCallback((row, col) => {
    setIsDragging(true);
    setSelectedCells([[row, col]]);
    setTempPath([[row, col]]);
    setCurrentWord(GRID[row][col]);
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setTempPath([]);
    
    const word = currentWord;
    const reversedWord = word.split('').reverse().join('');
    
    // Check if word is already found
    if (foundWords.includes(word) || foundWords.includes(reversedWord)) {
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }
    
    // Check if it's a valid word
    const isValidWord = ALL_WORDS.includes(word) || ALL_WORDS.includes(reversedWord);
    const actualWord = ALL_WORDS.includes(word) ? word : 
                      ALL_WORDS.includes(reversedWord) ? reversedWord : word;
    
    if (isValidWord) {
      // Mark cells as found
      const isSpangram = actualWord === SPANGRAM;
      const newCellStates = { ...cellStates };
      
      selectedCells.forEach(([row, col]) => {
        const key = getCellKey(row, col);
        newCellStates[key] = isSpangram ? 'spangram' : 'found';
      });
      
      setCellStates(newCellStates);
      setFoundWords(prev => [...prev, actualWord]);
      setFoundPaths(prev => [...prev, { cells: [...selectedCells], isSpangram }]);
    } else if (word.length >= 3) {
      // Invalid word - shake and mark gray temporarily
      setShake(true);
      const newCellStates = { ...cellStates };
      
      selectedCells.forEach(([row, col]) => {
        const key = getCellKey(row, col);
        if (!newCellStates[key]) {
          newCellStates[key] = 'error';
        }
      });
      
      setCellStates(newCellStates);
      
      setTimeout(() => {
        setShake(false);
        setCellStates(prev => {
          const cleaned = { ...prev };
          selectedCells.forEach(([row, col]) => {
            const key = getCellKey(row, col);
            if (cleaned[key] === 'error') {
              delete cleaned[key];
            }
          });
          return cleaned;
        });
      }, 500);
    }
    
    setSelectedCells([]);
    setCurrentWord('');
  }, [isDragging, currentWord, selectedCells, cellStates, foundWords]);

  // Global mouse/touch up handler
  useEffect(() => {
    const handleGlobalUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    document.addEventListener('mouseup', handleGlobalUp);
    document.addEventListener('touchend', handleGlobalUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalUp);
      document.removeEventListener('touchend', handleGlobalUp);
    };
  }, [isDragging, handleEnd]);

  const getCellClass = (row, col) => {
    const key = getCellKey(row, col);
    const isSelected = selectedCells.some(([r, c]) => r === row && c === col);
    const state = cellStates[key];
    
    let className = 'cell';
    
    if (state === 'found') className += ' found';
    else if (state === 'spangram') className += ' spangram';
    else if (state === 'error') className += ' error';
    else if (isSelected) className += ' dragging';
    else className += ' default';
    
    return className;
  };

  // Calculate cell centers for drawing lines
  const getCellCenter = (row, col) => {
    if (!gridRef.current) return { x: 0, y: 0 };
    const grid = gridRef.current.querySelector('.grid');
    const cell = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return { x: 0, y: 0 };
    
    const gridRect = grid.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    
    return {
      x: cellRect.left - gridRect.left + cellRect.width / 2,
      y: cellRect.top - gridRect.top + cellRect.height / 2
    };
  };

  const renderLines = (cells, color) => {
    const lines = [];
    for (let i = 0; i < cells.length - 1; i++) {
      const start = getCellCenter(cells[i][0], cells[i][1]);
      const end = getCellCenter(cells[i + 1][0], cells[i + 1][1]);
      
      lines.push(
        <line
          key={`${cells[i][0]},${cells[i][1]}-${cells[i + 1][0]},${cells[i + 1][1]}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
        />
      );
    }
    return lines;
  };

  // Intro envelope phase
  const isIntro = introPhase !== 'complete';

  return (
    <div className={`strands-game ${shake ? 'shake' : ''}`}>
      {isIntro && (
        <div 
          className={`intro-envelope ${introPhase}`} 
          onClick={handleEnvelopeClick}
        >
          <span className="envelope-emoji">💌</span>
          {showRadialPulse && <div className="radial-pulse"></div>}
        </div>
      )}
      
      {introPhase === 'complete' && (
        <>
          <div className="game-header">
            <h1>💌</h1>
            <p className="theme">{foundWords.length} of {ALL_WORDS.length} words found</p>
          </div>
          
          <div className="grid-container" ref={gridRef}>
            <svg className="grid-lines">
              {/* Render lines for found words */}
              {foundPaths.map((path, index) => (
                <g key={`found-${index}`}>
                  {renderLines(path.cells, path.isSpangram ? '#DAA520' : '#5DADE2')}
                </g>
              ))}
              {/* Render lines for current selection */}
              {isDragging && tempPath.length > 1 && (
                <g>
                  {renderLines(tempPath, '#808080')}
                </g>
              )}
            </svg>
            
            <div className="grid">
              {GRID.map((row, rowIndex) =>
                row.map((letter, colIndex) => (
                  <div
                    key={getCellKey(rowIndex, colIndex)}
                    className={getCellClass(rowIndex, colIndex)}
                    onMouseDown={() => handleCellDown(rowIndex, colIndex)}
                    onMouseEnter={() => handleCellEnter(rowIndex, colIndex)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      handleCellDown(rowIndex, colIndex);
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      const touch = e.touches[0];
                      const element = document.elementFromPoint(touch.clientX, touch.clientY);
                      if (element && element.classList.contains('cell')) {
                        const dataRow = parseInt(element.getAttribute('data-row'));
                        const dataCol = parseInt(element.getAttribute('data-col'));
                        if (!isNaN(dataRow) && !isNaN(dataCol)) {
                          handleCellEnter(dataRow, dataCol);
                        }
                      }
                    }}
                    data-row={rowIndex}
                    data-col={colIndex}
                  >
                    {letter}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="current-word">
            {currentWord}
          </div>
          
          <div className="found-words-container">
            {foundWords.length > 0 && (
              <div className="found-words">
                <h2>Words Found</h2>
                <div className="words-list">
                  {foundWords.map(word => (
                    <span 
                      key={word} 
                      className={`word-tag ${word === SPANGRAM ? 'spangram' : 'found'}`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
