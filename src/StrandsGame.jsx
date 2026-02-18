import { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';

const GRID = [
  ['N', 'I', 'R', 'E', 'A', 'M'],
  ['P', 'E', 'T', 'N', 'E', 'S'],
  ['I', 'L', 'L', 'E', 'A', 'A'],
  ['U', 'T', 'A', 'C', 'A', 'N'],
  ['V', 'O', 'L', 'V', 'T', 'N'],
  ['I', 'E', 'Y', 'I', 'D', 'U'],
  ['D', 'S', 'M', 'P', 'U', 'P'],
  ['D', 'H', 'I', 'E', 'B', 'C']
];

const THEME_WORDS = ['SAMEER', 'SIDDHI', 'TULIP', 'CUPID', 'PUNTACANA', 'LOVE'];
const SPANGRAM = 'BEMYVALENTINE';
const ALL_WORDS = [...THEME_WORDS, SPANGRAM];

const NO_BUTTON_PHRASES = ['IDK', 'MAYBE?', 'NOPE', 'HMMM..', 'UHHH', 'UNCLEAR', 'NAH'];

const ROTATING_PHRASES = [
  (count) => `${count} of ${ALL_WORDS.length} words found`,
  () => "You got this!",
  () => "Think inside the box",
  () => "Don't forget, you really ARE clever!",
  () => "P.S. I love you",
  () => "Love is in the letters",
  () => "Spoiler: The answer is love",
  () => "I wouldn't mind being STRANDed with you",
  () => "You're doing great, sweetie",
  () => "Follow your heart"
];

// Create a shuffled array of phrase indices (excluding index 0 which is the count)
const createShuffledIndices = () => {
  const indices = Array.from({ length: ROTATING_PHRASES.length - 1 }, (_, i) => i + 1);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

export default function StrandsGame() {
  // Intro animation state - starts with 'intro' which triggers CSS spinAndGrow animation
  const [introPhase, setIntroPhase] = useState('intro');
  const [showClickPulse, setShowClickPulse] = useState(false);
  
  // Game state
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [cellStates, setCellStates] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [shake, setShake] = useState(false);
  const [foundPaths, setFoundPaths] = useState([]);
  const [tempPath, setTempPath] = useState([]);
  
  // Rotating phrase state
  const [phraseIndex, setPhraseIndex] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [availableIndices, setAvailableIndices] = useState(() => createShuffledIndices());
  const [isPhraseVisible, setIsPhraseVisible] = useState(true);
  const [isWordFound, setIsWordFound] = useState(false);
  
  // Victory state
  const [victoryPhase, setVictoryPhase] = useState('none');
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [showWordBank, setShowWordBank] = useState(true);
  
  // Letter button state
  const [noClickCount, setNoClickCount] = useState(0);
  const [yesHighlighted, setYesHighlighted] = useState(false);
  const [yesClicked, setYesClicked] = useState(false);
  
  // Refs
  const gridRef = useRef(null);
  const timerRef = useRef(null);
  const boldTimerRef = useRef(null);
  const scheduleNextPhraseRef = useRef(null);

  // Helper functions
  const getCellKey = (row, col) => `${row},${col}`;

  const getCellCenter = (row, col) => {
    if (!gridRef.current) return { x: 0, y: 0 };
    const grid = gridRef.current.querySelector('.grid');
    const cell = grid?.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return { x: 0, y: 0 };
    
    const gridRect = grid.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();
    
    return {
      x: cellRect.left - gridRect.left + cellRect.width / 2,
      y: cellRect.top - gridRect.top + cellRect.height / 2
    };
  };

  const isAdjacent = (r1, c1, r2, c2) => {
    const dr = Math.abs(r1 - r2);
    const dc = Math.abs(c1 - c2);
    return dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0);
  };

  const getWordFromCells = (cells) => {
    return cells.map(([r, c]) => GRID[r][c]).join('');
  };

  // Clear all phrase rotation timers to prevent conflicts
  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (boldTimerRef.current) clearTimeout(boldTimerRef.current);
  };

  // Get the next random phrase from the shuffled pool
  const getNextRandomPhrase = useCallback(() => {
    setAvailableIndices(prev => {
      if (prev.length === 0) {
        // All phrases shown, create new shuffled pool
        const newShuffled = createShuffledIndices();
        setPhraseIndex(newShuffled[0]);
        return newShuffled.slice(1);
      } else {
        // Pick next random phrase
        setPhraseIndex(prev[0]);
        return prev.slice(1);
      }
    });
  }, []);

  // Set up scheduleNextPhrase function in ref
  useEffect(() => {
    scheduleNextPhraseRef.current = () => {
      const nextDelay = 5000 + Math.random() * 3000;

      timerRef.current = setTimeout(() => {
        setIsPhraseVisible(false);

        timerRef.current = setTimeout(() => {
          // Get next phrase
          getNextRandomPhrase();
          setIsPhraseVisible(true);
          if (scheduleNextPhraseRef.current) {
            scheduleNextPhraseRef.current();
          }
        }, 500);
      }, nextDelay);
    };
  }, [getNextRandomPhrase]);

  // Handle cell interactions
  const handleCellDown = useCallback((row, col) => {
    setIsDragging(true);
    setSelectedCells([[row, col]]);
    setTempPath([[row, col]]);
    setCurrentWord(GRID[row][col]);
  }, []);

  const handleCellEnter = useCallback((row, col) => {
    if (!isDragging) return;

    setSelectedCells(prev => {
      const lastCell = prev[prev.length - 1];

      // If going back to previous cell, remove last
      if (prev.length >= 2) {
        const prevCell = prev[prev.length - 2];
        if (prevCell[0] === row && prevCell[1] === col) {
          const newSelection = prev.slice(0, -1);
          const newPath = tempPath.slice(0, -1);
          setTempPath(newPath);
          setCurrentWord(getWordFromCells(newSelection));
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
      const newPath = [...tempPath, [row, col]];
      setTempPath(newPath);
      setCurrentWord(getWordFromCells(newSelection));
      return newSelection;
    });
  }, [isDragging, tempPath]);

  const handleEnvelopeClick = () => {
    if (introPhase === 'hovering') {
      clearTimers();
      setShowClickPulse(true);
      setIntroPhase('transitioning');

      setTimeout(() => {
        setIntroPhase('complete');
      }, 800);
    }
  };

  // Intro animation - after 3s of spinAndGrow, transition to hovering state
  useEffect(() => {
    if (introPhase === 'intro') {
      const timer = setTimeout(() => {
        setIntroPhase('hovering');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [introPhase]);

  // Start rotation when game begins
  useEffect(() => {
    if (introPhase === 'complete') {
      timerRef.current = setTimeout(() => {
        setIsPhraseVisible(false);

        timerRef.current = setTimeout(() => {
          // Start with first random phrase
          getNextRandomPhrase();
          setIsPhraseVisible(true);
          if (scheduleNextPhraseRef.current) {
            scheduleNextPhraseRef.current();
          }
        }, 500);
      }, 5000);

      return () => clearTimers();
    }
  }, [introPhase, getNextRandomPhrase]);

  // When a word is found, reset to count
  useEffect(() => {
    if (foundWords.length > 0 && introPhase === 'complete') {
      clearTimers();

      // Reset to count phrase - intentional setState in response to foundWords change
      setPhraseIndex(0);
      setIsPhraseVisible(true);
      setIsWordFound(true);

      boldTimerRef.current = setTimeout(() => {
        setIsWordFound(false);
      }, 2000);

      // After bold fades, continue rotation with random phrase
      timerRef.current = setTimeout(() => {
        setIsPhraseVisible(false);

        timerRef.current = setTimeout(() => {
          // Pick a random phrase to continue with
          getNextRandomPhrase();
          setIsPhraseVisible(true);
          if (scheduleNextPhraseRef.current) {
            scheduleNextPhraseRef.current();
          }
        }, 500);
      }, 3000);
    }
  }, [foundWords.length, introPhase, getNextRandomPhrase]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setTempPath([]);
    
    const word = currentWord;
    
    if (foundWords.includes(word)) {
      setSelectedCells([]);
      setCurrentWord('');
      return;
    }
    
    const isValidWord = ALL_WORDS.includes(word);
    
    if (isValidWord) {
      const isSpangram = word === SPANGRAM;
      const newCellStates = { ...cellStates };
      
      selectedCells.forEach(([row, col]) => {
        const key = getCellKey(row, col);
        newCellStates[key] = isSpangram ? 'spangram' : 'found';
      });
      
      setCellStates(newCellStates);
      setFoundWords(prev => [...prev, word]);
      setFoundPaths(prev => [...prev, { cells: [...selectedCells], isSpangram }]);
    } else if (word.length >= 3) {
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

  // Trigger victory animation when all words found
  useEffect(() => {
    if (foundWords.length === ALL_WORDS.length && victoryPhase === 'none') {
      clearTimers();

      // Start confetti
      setShowConfetti(true);

      // Pause for 2 seconds to let confetti start falling before starting emoji animation
      setTimeout(() => {
        setVictoryPhase('emoji-move');
      }, 2000);
    }
  }, [foundWords.length, victoryPhase]);

  // Keyboard shortcut for testing - press 'X' to skip to victory animation (only in dev mode)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isDevMode = urlParams.get('dev');
    
    if (!isDevMode) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'x' || e.key === 'X') {
        if (victoryPhase === 'none') {
          clearTimers();
          // Populate all words in the bank with correct colors
          setFoundWords(ALL_WORDS);
          // Keep existing cell states to preserve circles on already found words
          setShowConfetti(true);
          setTimeout(() => {
            setVictoryPhase('emoji-move');
          }, 2000);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [victoryPhase]);

  // Victory animation sequence
  useEffect(() => {
    if (victoryPhase === 'emoji-move') {
      // Emoji moves to center (5 seconds)
      const timer = setTimeout(() => {
        setVictoryPhase('envelope-swap');
      }, 5000);
      return () => clearTimeout(timer);
    }

    if (victoryPhase === 'envelope-swap') {
      // Show envelope for 3 seconds before opening
      const timer = setTimeout(() => {
        setVictoryPhase('letter-open');
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (victoryPhase === 'letter-open') {
      // Letter opens and slides up (2s animation)
      // After letter completes animation, hide word bank
      const fadeTimer = setTimeout(() => {
        setShowWordBank(false);
      }, 2500);

      // Start words flying in after word bank fades out
      const flyInTimer = setTimeout(() => {
        setVictoryPhase('words-fly-in');
      }, 3500);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(flyInTimer);
      };
    }
  }, [victoryPhase]);

  // Letter button handlers
  const handleYes = useCallback(() => {
    setYesClicked(true);
    setYesHighlighted(false);
    
    // Replay confetti
    setShowConfetti(false);
    setTimeout(() => {
      setShowConfetti(true);
      const generatePieces = () => {
        const pieces = Array.from({ length: 150 }, (_, i) => ({
          id: i,
          color: ['#FFDEE3', '#87CEEB', '#FFD700', '#FFFFFF', '#FFBBC1'][i % 5],
          left: Math.random() * 100,
          animationDelay: Math.random() * 5,
          animationDuration: 6 + Math.random() * 3
        }));
        setConfettiPieces(pieces);
      };
      generatePieces();
    }, 100);
  }, []);

  const handleNo = useCallback(() => {
    setNoClickCount(prev => prev + 1);
    
    // Shake button effect
    const btn = document.querySelector('.btn-no');
    if (btn) {
      btn.classList.add('shake');
      setTimeout(() => btn.classList.remove('shake'), 500);
    }
    
    // Highlight YES after 3 clicks
    if (noClickCount >= 2) {
      setYesHighlighted(true);
    }
  }, [noClickCount]);

  const handleReplay = useCallback(() => {
    window.location.reload();
  }, []);

  const getNoButtonText = useCallback(() => {
    return NO_BUTTON_PHRASES[noClickCount % NO_BUTTON_PHRASES.length];
  }, [noClickCount]);

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

  const isIntro = introPhase !== 'complete';

  // Generate confetti pieces when shown - continuous falling
  useEffect(() => {
    if (showConfetti) {
      const generatePieces = () => {
        const pieces = Array.from({ length: 150 }, (_, i) => ({
          id: i,
          color: ['#FFDEE3', '#87CEEB', '#FFD700', '#FFFFFF', '#FFBBC1'][i % 5],
          left: Math.random() * 100,
          animationDelay: Math.random() * 5,
          animationDuration: 6 + Math.random() * 3
        }));
        setConfettiPieces(pieces);
      };
      
      generatePieces();
      
      // Regenerate confetti every 8 seconds to keep it falling continuously
      const interval = setInterval(generatePieces, 8000);
      
      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  return (
    <div className={`strands-game ${shake ? 'shake' : ''} ${victoryPhase !== 'none' ? 'victory' : ''}`}>
      {isIntro && (
        <div 
          className={`intro-envelope ${introPhase}`} 
          onClick={handleEnvelopeClick}
        >
          <span className="envelope-emoji">💌</span>
          {introPhase === 'hovering' && (
            <div className="radial-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          )}
          {showClickPulse && <div className="radial-pulse-click"></div>}
        </div>
      )}
      
      {introPhase === 'complete' && (
        <div className="strands-content">
          {/* Game UI - always rendered, fades out during victory */}
          <div className={`game-header ${victoryPhase !== 'none' ? 'victory-hidden' : ''}`}>
            <h1>💌</h1>
            <p className={`theme ${isPhraseVisible ? 'visible' : 'hidden'} ${isWordFound ? 'word-found' : ''}`}>
              {ROTATING_PHRASES[phraseIndex](foundWords.length)}
            </p>
          </div>
          
          <div className={`grid-container ${victoryPhase !== 'none' ? 'victory-hidden' : ''}`} ref={gridRef}>
            <svg className="grid-lines">
              {/* eslint-disable-next-line react-hooks/refs */}
              {foundPaths.map((path, index) => (
                <g key={`found-${index}`}>
                  {renderLines(path.cells, path.isSpangram ? '#DAA520' : '#5DADE2')}
                </g>
              ))}
              {isDragging && tempPath.length > 1 && (
                <g>
                  {/* eslint-disable-next-line react-hooks/refs */}
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
          
          <div className={`current-word ${victoryPhase !== 'none' ? 'victory-hidden' : ''}`}>
            {currentWord}
          </div>
          
          {/* Word Bank - always rendered, content changes based on phase */}
          <div className={`found-words-container ${!showWordBank ? 'hidden' : ''} ${victoryPhase === 'words-fly-in' ? 'words-flying' : ''}`}>
            <div className={`found-words ${victoryPhase !== 'none' ? 'victory-words' : ''}`}>
              {foundWords.length > 0 && <h2>Words Found</h2>}
              <div className="words-list">
                {foundWords.map(word => (
                  <span 
                    key={word} 
                    className={`word-tag ${victoryPhase !== 'none' ? 'victory-word' : ''} ${word === SPANGRAM ? 'spangram' : 'found'}`}
                    data-word={word}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Victory Animations */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map(piece => (
            <div
              key={piece.id}
              className="confetti-piece"
              style={{
                '--left': `${piece.left}%`,
                '--color': piece.color,
                '--delay': `${piece.animationDelay}s`,
                '--duration': `${piece.animationDuration}s`
              }}
            />
          ))}
        </div>
      )}
      
      {victoryPhase !== 'none' && (
        <div className={`victory-animations ${victoryPhase}`}>
          <div className="victory-emoji">💌</div>
          <div className="victory-envelope">✉️</div>
          <div className="envelope-flap"></div>
          <div className="victory-letter">
            <div className="letter-content">
              <div className="letter-line">
                <span>Dear</span>
                <span className={`letter-word letter-siddhi ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '0s' }}>SIDDHI</span>
                <span>,</span>
              </div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line">
                <span className={`letter-word letter-cupid ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '0.8s' }}>CUPID</span>
                <span>said I'd be a fool</span>
              </div>
              <div className="letter-line">
                <span className={`letter-word letter-tulip ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '1.6s' }}>TULIP</span>
                <span>you go to</span>
                <span className={`letter-word letter-puntacana ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '2.4s' }}>PUNTACANA</span>
              </div>
              <div className="letter-line">
                <span>without asking...</span>
              </div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line center-line">
                <span>Will you</span>
                <span className={`letter-word letter-spangram ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '3.2s' }}>BEMYVALENTINE</span>
                <span>?</span>
              </div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line spacer-line"></div>
              <div className="letter-line right-line anchored-bottom">
                <span className={`letter-word letter-love ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '4s' }}>LOVE</span>
                <span>,</span>
              </div>
              <div className="letter-line right-line anchored-bottom">
                <span className={`letter-word letter-sameer ${victoryPhase === 'words-fly-in' ? 'animate-in' : ''}`} style={{ '--delay': '4.8s' }}>SAMEER</span>
              </div>
            </div>
          </div>
          
          {/* YES/NO/REPLAY Buttons - appear after words fly in */}
          {victoryPhase === 'words-fly-in' && (
            <div className="letter-buttons">
              <button 
                className={`letter-btn btn-yes ${yesHighlighted ? 'highlighted' : ''}`}
                onClick={handleYes}
              >
                YES
              </button>
              {!yesClicked && (
                <button 
                  className="letter-btn btn-no"
                  onClick={handleNo}
                >
                  {getNoButtonText()}
                </button>
              )}
              <button 
                className="letter-btn btn-replay"
                onClick={handleReplay}
              >
                REPLAY
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
