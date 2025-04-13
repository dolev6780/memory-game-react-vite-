import React, { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameHeader from "./GameHeader";
import GameCard from "./GameCard";
import socketService from "../services/socketService";
import { themeStyles, getText } from "../themeConfig";

const GameBoard = ({
  cards,
  flippedIndices,
  matchedPairs,
  handleCardClick,
  styles,
  difficulty,
  playerCount,
  moves,
  playerScores,
  currentPlayer,
  showPlayerTurn,
  initializeGame,
  characters,
  setGamePhase,
  playerNames = [],
  matchedBy = {}, 
  gameTheme = "animals",
  setGameTheme,
  isOnline = false,
  language = "he",
  toggleLanguage,
  timerActive = false,
  timerResetKey = 0,
  onTimeUpdate = null,
  roomId = null
}) => {
  // Get theme styles from centralized config
  const currentThemeConfig = themeStyles[gameTheme] || themeStyles.animals;

  // Create theme-specific styles for this component
  const currentTheme = {
    container: gameTheme === "animals" ? "bg-green-950/40" : "bg-blue-950/40",
    turnNotificationGradient: gameTheme === "animals" ? "from-green-600 to-green-500" : "from-blue-600 to-blue-500",
    turnNotificationBorder: gameTheme === "animals" ? "border-green-300" : "border-blue-300",
  };
  
  // State to track container size
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  
  // Reference to the main container
  const containerRef = useRef(null);
  
  // First render flag to avoid infinite update loops
  const isFirstRender = useRef(true);

  // One-time effect for theme synchronization on mount
  useEffect(() => {
    // This entire block only runs once when the component mounts
    if (isFirstRender.current && isOnline) {
      isFirstRender.current = false;
      
      try {
        const socketTheme = socketService.getGameTheme();
        // Only update if the themes are different and we have a setter function
        if (socketTheme && socketTheme !== gameTheme && typeof setGameTheme === 'function') {
          console.log(`GameBoard enforcing theme: ${gameTheme} -> ${socketTheme}`);
          // Schedule the theme change for the next render cycle to avoid issues
          setTimeout(() => {
            setGameTheme(socketTheme);
          }, 0);
        }
      } catch (error) {
        console.error("Error synchronizing theme:", error);
      }
    }
  }, [gameTheme, isOnline, setGameTheme]);
  
  // Calculate the appropriate scale for the game board
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        // Account for header height (approximate)
        const headerHeight = 80; 
        const availableHeight = window.innerHeight - headerHeight - 40; // 40px for padding
        
        const containerWidth = containerRef.current.offsetWidth;
        // Use a more aggressive height calculation - 60% of available space
        const containerHeight = Math.min(availableHeight * 0.9, window.innerHeight * 0.6); 
        
        // Get required width/height based on card count and layout
        const cardCount = cards.length;
        // Calculate optimal columns based on aspect ratio
        const aspectRatio = containerWidth / containerHeight;
        const cols = Math.ceil(Math.sqrt(cardCount * aspectRatio));
        const rows = Math.ceil(cardCount / cols);
        
        // Calculate how much space each card would need with reduced margins
        const requiredWidth = cols * (styles.card?.width || 90) * 1.05; // Reduced spacing
        const requiredHeight = rows * (styles.card?.height || 126) * 1.05; // Reduced spacing
        
        // Calculate scale factors
        const widthScale = containerWidth / requiredWidth;
        const heightScale = containerHeight / requiredHeight;
        
        // Use the smaller scale to ensure everything fits, with a maximum of 0.9
        const newScale = Math.min(widthScale, heightScale, 0.9);
        
        setScale(newScale);
        setContainerSize({
          width: containerWidth,
          height: containerHeight
        });
      }
    };
    
    // Initial calculation
    updateScale();
    
    // Recalculate on window resize
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [cards.length, styles.card]);
  
  // Get current player name or default to localized "Player X"
  const getCurrentPlayerName = () => {
    // Make sure playerNames array is valid and has the currentPlayer index
    if (Array.isArray(playerNames) && playerNames[currentPlayer]) {
      return playerNames[currentPlayer];
    }
    
    // Fallback to localized default
    return language === "en" ? 
      `Player ${currentPlayer + 1}` : `שחקן ${currentPlayer + 1}`;
  };

  // Get player name who matched a card
  const getPlayerNameWhoMatched = (cardId) => {
    if (matchedBy && matchedBy[cardId] !== undefined) {
      const playerIndex = matchedBy[cardId];
      
      // Make sure playerNames array is valid and has the playerIndex
      if (Array.isArray(playerNames) && playerIndex >= 0 && playerIndex < playerNames.length && playerNames[playerIndex]) {
        return playerNames[playerIndex];
      }
      
      // Fallback to localized default
      return language === "en" ? 
        `Player ${playerIndex + 1}` : `שחקן ${playerIndex + 1}`;
    }
    return null;
  };

  // Get translated text for current player's turn
  const getPlayerTurnText = () => {
    const playerName = getCurrentPlayerName();
    const turnText = getText(gameTheme, language, "playerTurn") || (language === "en" ? "'s Turn" : "תורו של");
    
    return language === "en" ? 
      `${playerName}${turnText}` : 
      `${turnText} ${playerName}`;
  };

  return (
    <div 
      className={`flex flex-col items-center w-full max-h-screen p-2 sm:p-3 ${currentTheme.container} rounded-lg backdrop-blur-sm shadow-lg overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}
      ref={containerRef}
      style={{ height: `calc(100vh - 20px)` }} // Limit to viewport height minus padding
      dir={language === "en" ? 'ltr' : 'rtl'}
    >
      {/* Game header */}
      <div className="w-full mb-1 sm:mb-2">
        <GameHeader
          difficulty={difficulty}
          initializeGame={initializeGame}
          moves={moves}
          matchedPairs={matchedPairs}
          characters={characters || []}
          playerCount={isOnline ? (Array.isArray(playerScores) ? playerScores.length : 0) : playerCount}
          playerScores={playerScores}
          currentPlayer={currentPlayer}
          playerNames={playerNames}
          styles={styles}
          setGamePhase={setGamePhase}
          gameTheme={gameTheme}
          isOnline={isOnline}
          language={language}
          toggleLanguage={toggleLanguage}
          timerActive={timerActive}
          timerResetKey={timerResetKey}
          onTimeUpdate={onTimeUpdate}
          roomId={roomId}
          matchedBy={matchedBy}
        />
      </div>
      
      {/* Player turn notification */}
      <AnimatePresence>
        {showPlayerTurn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`bg-gradient-to-r ${currentTheme.turnNotificationGradient} rounded-lg px-6 py-2 text-white font-bold shadow-lg border-2 ${currentTheme.turnNotificationBorder} absolute top-16 z-50`}
          >
            {getPlayerTurnText()}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Game board - with dynamic scaling */}
      <div 
        className="w-full flex-1 flex items-center justify-center overflow-hidden" 
        style={{ 
          maxHeight: `calc(100vh - 100px)` // Leave room for header
        }}
      >
        <div style={{
          ...styles.cardGrid,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s ease'
        }}>
          {cards.map((card, index) => {
            // Create enhanced card with matchedBy property and proper translation
            const enhancedCard = {
              ...card,
              matchedBy: getPlayerNameWhoMatched(card.id),
              displayName: card.displayName || card.name?.he || card.name?.en || card.name
            };
            
            return (
              <GameCard
                key={card.uniqueId || `card-${index}`}
                card={enhancedCard}
                index={index}
                isFlipped={flippedIndices.includes(index)}
                isMatched={matchedPairs.includes(card.id)}
                handleCardClick={() => handleCardClick(index)}
                styles={styles}
                gameTheme={gameTheme}
                language={language}
                matchedByText={getText(gameTheme, language, "matchedBy") || (language === "en" ? "Matched by" : "הותאם על ידי")}
              />
            );
          })}
        </div>
      </div>
      <a href="http://www.freepik.com">Designed by Luis_Molinero / Freepik</a>
    </div>
  );
};

export default GameBoard;