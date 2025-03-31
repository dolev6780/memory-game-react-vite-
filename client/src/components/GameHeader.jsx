import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { getText } from "../themeConfig";
import GameTimer from "./GameTimer";

const GameHeader = ({
  difficulty,
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
  roomId = null,
  language = "en",
  timerActive = false,
  timerResetKey = 0,
  onTimeUpdate = null,
  matchedBy = {}
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
      roomCode: "bg-orange-900/50",
      scoreBox: "bg-orange-900/50 border-orange-500/50"
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
      roomCode: "bg-blue-900/50",
      scoreBox: "bg-blue-900/50 border-blue-500/50"
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  // Debug log playerScores to see what we're getting in online mode
  useEffect(() => {
    if (isOnline) {
      console.log("GameHeader - Online Mode");
      console.log("PlayerScores:", playerScores);
      console.log("MatchedBy:", matchedBy);
      console.log("PlayerNames:", playerNames);
      console.log("Player Count:", playerCount);
    }
  }, [isOnline, playerScores, matchedBy, playerNames, playerCount]);

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

  // Ensure player names are properly handled
  const getPlayerName = (index) => {
    // Make sure the playerNames array is valid and contains the index
    if (Array.isArray(playerNames) && index >= 0 && index < playerNames.length && playerNames[index]) {
      return playerNames[index];
    }
    
    // Fallback to localized default
    return language === "en" ? 
      `Player ${index + 1}` : 
      `שחקן ${index + 1}`;
  };

  // Get player display data - WITH STRONG FOCUS ON ONLINE MODE
  const getPlayerData = () => {
    // For online mode, ALWAYS use playerScores from the server
    if (isOnline && Array.isArray(playerScores) && playerScores.length > 0) {
      console.log("Using online player scores:", playerScores);
      return playerScores.map((player, idx) => {
        // Get player name - either from player object or from playerNames array
        const name = player.name || 
                    (playerNames[idx] || 
                    (language === "en" ? `Player ${idx + 1}` : `שחקן ${idx + 1}`));
        
        // Make sure score is a number, defaulting to 0 if undefined
        const score = typeof player.score === 'number' ? player.score : 0;
        
        return {
          id: player.id !== undefined ? player.id : idx,
          index: idx,
          name: name,
          score: score
        };
      });
    }
    
    // For local mode, fall back to counting from matchedBy
    // Initialize counts for all players
    const counts = Array(playerCount).fill(0).map((_, i) => ({
      id: i,
      index: i,
      name: getPlayerName(i),
      score: 0
    }));
    
    // Count matches from matchedBy
    if (matchedBy && typeof matchedBy === 'object') {
      Object.values(matchedBy).forEach(playerIndex => {
        if (playerIndex >= 0 && playerIndex < counts.length) {
          counts[playerIndex].score += 1;
        }
      });
    }
    
    return counts;
  };

  // Get player data
  const playerData = getPlayerData();
  
  // Debug the player data
  console.log("Final player data for display:", playerData);

  return (
    <div className="w-full mb-2 sm:mb-4">
      <div className="flex flex-wrap justify-between items-start">
        {/* Game info */}
        <div className="flex flex-col mb-2 sm:mb-0">
           {/* Controls */}
        <div className="flex gap-2">
          <motion.button
            onClick={handleHome}
            className={`px-2 py-1 ${currentTheme.buttonBg} ${currentTheme.buttonText} text-sm rounded-lg shadow-md`}
            whileHover={{ scale: 1.05, backgroundColor: currentTheme.buttonHover }}
            whileTap={{ scale: 0.95 }}
          >
            {isOnline ? getText(gameTheme, language, "lobby") : getText(gameTheme, language, "home")}
          </motion.button>
          <motion.button
            onClick={handleRestart}
            className={`px-2 py-1 ${currentTheme.buttonBg} ${currentTheme.buttonText} text-sm rounded-lg shadow-md`}
            whileHover={{ scale: 1.05, backgroundColor: currentTheme.buttonHover }}
            whileTap={{ scale: 0.95 }}
          >
            {isOnline ? getText(gameTheme, language, "return") : getText(gameTheme, language, "restart")}
          </motion.button>
        </div>
            <div className={`text-xs sm:text-sm font-medium ${currentTheme.difficultyText} py-1`}>
              {getText(gameTheme, language, "difficulty")} <span className={`${difficulty === "hard" ? "bg-red-600" : difficulty === "medium" ? "bg-orange-600" : "bg-green-600"} py-0.5 px-1 rounded-lg` }> {getText(gameTheme, language, difficulty, "common")}</span>
            </div>
          <div className="flex items-center justify-center">
            
           {/* Online indicator */}
           {isOnline && (
              <div className={`ml-2 text-xs px-2 py-0.5 rounded-full ${currentTheme.roomCode} ${currentTheme.onlineIndicator}`}>
                {getText(gameTheme, language, "online")}
              </div>
            )}
              {/* Room code if online */}
          {isOnline && roomId && (
            <div className={`text-xs ${currentTheme.onlineIndicator} font-mono`}>
              {getText(gameTheme, language, "room")}: {roomId}
            </div>
          )}
          </div>
          {/* Timer */}
          <div className="mt-1">
            <GameTimer 
              gameTheme={gameTheme}
              language={language}
              isActive={timerActive}
              resetKey={timerResetKey}
              onTimeUpdate={onTimeUpdate}
              size="small"
              isOnline={isOnline}
            />
          </div>
        </div>

        {/* Matches Found by Each Player */}
        {/* Force display for multiplayer games by checking if playerData.length > 1 instead of playerCount */}
        {playerData.length > 1 && (
          <div className={`flex flex-col p-2 rounded-lg ${currentTheme.scoreBox} backdrop-blur-sm mb-2 sm:mb-0`}>
            <div className={`text-xs font-medium mb-1 ${currentTheme.difficultyText} text-center`}>
              {getText(gameTheme, language, "matchedBy")}
            </div>
            <div className="grid grid-cols-1 gap-1">
              {playerData.map((player) => (
                <motion.div
                  key={`player-${player.id}-${player.index}`}
                  className={`px-2 py-1 rounded-lg text-xs flex justify-between items-center ${
                    player.index === currentPlayer
                      ? `bg-gradient-to-r ${currentTheme.currentPlayerGradient} text-white`
                      : "bg-gray-800/60 text-gray-300"
                  }`}
                  animate={
                    player.index === currentPlayer
                      ? {
                          scale: [1, 1.05, 1],
                          transition: { duration: 1, repeat: Infinity }
                        }
                      : {}
                  }
                >
                  <div className="flex items-center">
                    <div className="font-bold mr-1">
                      {player.name}:
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black/30 font-mono font-bold text-base">
                      {player.score}
                    </span>
                    <span className="mr-1 text-xs">
                      {language === "en" ? "pairs" : "זוגות"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Total matches found */}
            <div className="text-xs text-center mt-1 text-gray-300">
              {matchedPairs.length} / {characters?.length || 0} {language === "en" ? "total" : "סה״כ"}
            </div>
          </div>
        )}

       
      </div>

      {/* Show current player in single player mode */}
      {playerCount === 1 && (
        <div className={`mt-2 text-xs font-medium text-center ${currentTheme.statsText}`}>
          {getText(gameTheme, language, "player")}: {getPlayerName(0)}
        </div>
      )}
    </div>
  );
};

export default GameHeader;