import React from "react";
import { motion } from "framer-motion";

const GameHeader = ({
  difficulty,
  moves,
  matchedPairs,
  characters,
  playerCount,
  playerScores,
  currentPlayer,
  initializeGame,
  setGamePhase,
  playerNames = [],
  gameTheme = "dragonball",
  isOnline = false,
  roomId = null
}) => {
  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      difficultyText: "text-yellow-400",
      statsText: "text-gray-300",
      currentPlayerGradient: "from-orange-600 to-orange-500",
      currentPlayerHighlight: "bg-red-500",
      buttonHover: "#374151",
      buttonBg: "bg-gray-800",
      buttonText: "text-gray-100",
      onlineIndicator: "text-orange-400",
      roomCode: "bg-orange-900/50"
    },
    pokemon: {
      difficultyText: "text-blue-400",
      statsText: "text-gray-300",
      currentPlayerGradient: "from-blue-600 to-yellow-500",
      currentPlayerHighlight: "bg-blue-500",
      buttonHover: "#1e40af",
      buttonBg: "bg-blue-900",
      buttonText: "text-gray-100",
      onlineIndicator: "text-blue-400",
      roomCode: "bg-blue-900/50"
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  // Create a restart handler
  const handleRestart = () => {
    initializeGame();
  };

  // Create a home handler - based on whether online or not
  const handleHome = () => {
    if (isOnline) {
      // For online mode, return to waiting room
      setGamePhase("waiting_room");
    } else {
      // For local mode, return to intro
      setGamePhase("intro");
    }
  };

  return (
    <div className="w-full mb-2 sm:mb-4">
      <div className="flex flex-wrap justify-between items-center">
        {/* Game info */}
        <div className="flex flex-col mb-2 sm:mb-0">
          <div className="flex items-center">
            <div className={`text-xs sm:text-sm font-medium ${currentTheme.difficultyText}`}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Difficulty
            </div>
            
            {/* Online indicator */}
            {isOnline && (
              <div className={`ml-2 text-xs px-2 py-0.5 rounded-full ${currentTheme.roomCode} ${currentTheme.onlineIndicator}`}>
                ONLINE
              </div>
            )}
          </div>
          
          {/* Room code if online */}
          {isOnline && roomId && (
            <div className={`text-xs ${currentTheme.onlineIndicator} font-mono`}>
              Room: {roomId}
            </div>
          )}
          
          <div className={`text-xs ${currentTheme.statsText}`}>
            {matchedPairs.length} / {characters?.length || 0} Pairs Found
          </div>
          <div className={`text-xs ${currentTheme.statsText}`}>
            {moves} Moves
          </div>
        </div>

        {/* Player scores for multiplayer */}
        {playerCount > 1 && (
          <div className="flex gap-2 flex-wrap justify-center mb-2 sm:mb-0">
            {playerScores.map((player, index) => (
              <motion.div
                key={index}
                className={`px-2 py-1 rounded-lg text-xs flex flex-col items-center ${
                  index === currentPlayer
                    ? `bg-gradient-to-r ${currentTheme.currentPlayerGradient} text-white`
                    : "bg-gray-800 text-gray-300"
                }`}
                animate={
                  index === currentPlayer
                    ? {
                        scale: [1, 1.05, 1],
                        transition: { duration: 1, repeat: Infinity }
                      }
                    : {}
                }
              >
                <span className="font-bold">
                  {playerNames[index] || `Player ${index + 1}`}
                </span>
                <span>{player.score} pairs</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleRestart}
            className={`px-2 py-1 ${currentTheme.buttonBg} ${currentTheme.buttonText} text-xs rounded-lg shadow-md`}
            whileHover={{ scale: 1.05, backgroundColor: currentTheme.buttonHover }}
            whileTap={{ scale: 0.95 }}
          >
            {isOnline ? "Return" : "Restart"}
          </motion.button>
          <motion.button
            onClick={handleHome}
            className={`px-2 py-1 ${currentTheme.buttonBg} ${currentTheme.buttonText} text-xs rounded-lg shadow-md`}
            whileHover={{ scale: 1.05, backgroundColor: currentTheme.buttonHover }}
            whileTap={{ scale: 0.95 }}
          >
            {isOnline ? "Lobby" : "Home"}
          </motion.button>
        </div>
      </div>

      {/* Show current player in single player mode */}
      {playerCount === 1 && (
        <div className={`mt-2 text-xs font-medium text-center ${currentTheme.statsText}`}>
          Player: {playerNames[0] || "Player 1"}
        </div>
      )}
    </div>
  );
};

export default GameHeader;