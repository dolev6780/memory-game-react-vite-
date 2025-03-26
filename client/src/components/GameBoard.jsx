// Add a useEffect in GameBoard.jsx to enforce theme consistency

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GameHeader from "./GameHeader";
import GameCard from "./GameCard";
import socketService from "../services/socketService";

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
  gameTheme = "dragonball",
  setGameTheme, // Add this prop
  isOnline = false
}) => {
  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-black/40",
      turnNotificationGradient: "from-orange-600 to-orange-500",
      turnNotificationBorder: "border-yellow-300",
    },
    pokemon: {
      container: "bg-blue-900/40",
      turnNotificationGradient: "from-blue-600 to-yellow-500",
      turnNotificationBorder: "border-blue-300",
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;
  
  // State to track container size
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  
  // Reference to the main container
  const containerRef = React.useRef(null);

  // If this is an online game, ensure we're using the theme from socketService
  useEffect(() => {
    if (isOnline) {
      const socketTheme = socketService.getGameTheme();
      if (socketTheme && socketTheme !== gameTheme && setGameTheme) {
        console.log(`GameBoard enforcing theme: ${gameTheme} -> ${socketTheme}`);
        setGameTheme(socketTheme);
      }
    }
  }, [isOnline, gameTheme, setGameTheme]);
  
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
  
  // Get current player name or default to "Player X"
  const getCurrentPlayerName = () => {
    return playerNames[currentPlayer] || `Player ${currentPlayer + 1}`;
  };

  // Get player name who matched a card
  const getPlayerNameWhoMatched = (cardId) => {
    if (matchedBy[cardId] !== undefined) {
      const playerIndex = matchedBy[cardId];
      return playerNames[playerIndex] || `Player ${playerIndex + 1}`;
    }
    return null;
  };

  return (
    <div 
      className={`flex flex-col items-center w-full max-h-screen p-2 sm:p-3 ${currentTheme.container} rounded-lg backdrop-blur-sm shadow-lg overflow-hidden`}
      ref={containerRef}
      style={{ height: `calc(100vh - 20px)` }} // Limit to viewport height minus padding
    >
      {/* Game header - more compact */}
      <div className="w-full mb-1 sm:mb-2">
        <GameHeader
          difficulty={difficulty}
          initializeGame={initializeGame}
          moves={moves}
          matchedPairs={matchedPairs}
          characters={characters || []}
          playerCount={playerCount}
          playerScores={playerScores}
          currentPlayer={currentPlayer}
          playerNames={playerNames}
          styles={styles}
          setGamePhase={setGamePhase}
          gameTheme={gameTheme}
          isOnline={isOnline}
        />
      </div>
      
      {/* Theme indicator for debugging */}
      {isOnline && (
        <div className="absolute top-1 right-1 z-30">
          <span className={`px-2 py-1 rounded-full text-xs text-white ${
            gameTheme === 'dragonball' ? 'bg-orange-600' : 'bg-blue-600'
          }`}>
            {gameTheme === 'dragonball' ? 'DB Theme' : 'PK Theme'}
          </span>
        </div>
      )}
      
      {/* Player turn notification */}
      <AnimatePresence>
  {showPlayerTurn && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${currentTheme.turnNotificationGradient} text-white px-4 py-2 rounded-full shadow-lg z-20 text-sm border-2 ${currentTheme.turnNotificationBorder}`}
    >
      <div className="font-bold flex items-center">
        <span className="mr-2">{getCurrentPlayerName()}'s Turn</span>
        {/* Add a small animated indicator */}
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-white"
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
      
      {/* Game board - with better scaling */}
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
            // Create enhanced card with matchedBy property
            const enhancedCard = {
              ...card,
              matchedBy: getPlayerNameWhoMatched(card.id)
            };
            
            return (
              <GameCard
                key={card.uniqueId || `card-${index}`} // Ensure each card has a unique key
                card={enhancedCard}
                index={index}
                isFlipped={flippedIndices.includes(index)}
                isMatched={matchedPairs.includes(card.id)}
                handleCardClick={() => handleCardClick(index)}
                styles={styles}
                gameTheme={gameTheme}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;