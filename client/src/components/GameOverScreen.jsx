import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getText } from "../themeConfig";
import socketService from "../services/socketService";

const GameOverScreen = ({
  difficulty,
  moves,
  playerCount,
  playerScores,
  initializeGame,
  setGamePhase,
  playerNames = [],
  gameTheme = "animals",
  isOnline = false,
  roomId = null,
  language = "en",
  completionTime = 0
}) => {
  // Add notification state
  const [notification, setNotification] = useState(null);

  // Define theme-specific styles with updated themes
  const themeStyles = {
    animals: {
      container: "bg-green-900/20 border-green-500/20",
      title: "text-green-400",
      subtitle: "text-gray-200",
      sectionTitle: "text-green-300",
      resultsBg: "bg-gray-800/60",
      winnerGradient: "from-green-600 to-green-500",
      winnerTile: "bg-green-900/50 text-green-200",
      loserTile: "bg-gray-700/50 text-gray-300",
      buttonGradient: "from-green-500 to-green-600",
      buttonGlow: "rgba(34, 197, 94, 0.5)",
      titleAnimation: ["0 0 8px rgba(34, 197, 94, 0.5)", "0 0 16px rgba(34, 197, 94, 0.8)", "0 0 8px rgba(34, 197, 94, 0.5)"]
    },
    flags: {
      container: "bg-blue-900/20 border-blue-500/20",
      title: "text-blue-400",
      subtitle: "text-gray-200",
      sectionTitle: "text-blue-300",
      resultsBg: "bg-blue-900/60",
      winnerGradient: "from-blue-600 to-blue-500",
      winnerTile: "bg-blue-900/50 text-blue-200",
      loserTile: "bg-gray-700/50 text-gray-300",
      buttonGradient: "from-blue-500 to-blue-600",
      buttonGlow: "rgba(59, 130, 246, 0.5)",
      titleAnimation: ["0 0 8px rgba(59, 130, 246, 0.5)", "0 0 16px rgba(59, 130, 246, 0.8)", "0 0 8px rgba(59, 130, 246, 0.5)"]
    }
  };

  // Get current theme styles with proper fallback
  const currentTheme = themeStyles[gameTheme] || themeStyles.animals;

  // Determine if this is a multiplayer game
  const isMultiplayerGame = () => {
    // For online games, check playerScores length
    if (isOnline) {
      return Array.isArray(playerScores) && playerScores.length > 1;
    }
    // For local games, check playerCount
    return playerCount > 1;
  };

  // Helper function to get player name with fallback
  const getPlayerName = (index) => {
    // Make sure the playerNames array is valid and contains the index
    if (Array.isArray(playerNames) && playerNames[index]) {
      return playerNames[index];
    }
    
    // Fallback to localized default
    return language === "en" ? 
      `Player ${index + 1}` : 
      `שחקן ${index + 1}`;
  };

  // Get the winner(s) for multiplayer
  const getWinners = () => {
    if (!isMultiplayerGame()) return [];
    
    // Ensure playerScores is valid and has scores
    if (!Array.isArray(playerScores) || playerScores.length === 0) {
      return [];
    }
    
    const maxScore = Math.max(...playerScores.map(p => p.score || 0));
    return playerScores
      .map((player, index) => ({ 
        ...player, 
        index, 
        name: getPlayerName(index),
        score: player.score || 0
      }))
      .filter(player => player.score === maxScore);
  };

  const winners = getWinners();

  // Format time from seconds to readable format
  const formatTime = (totalSeconds) => {
    if (typeof totalSeconds !== 'number' || isNaN(totalSeconds)) {
      totalSeconds = 0;
    }
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get translated text with fallbacks
  const getLocalizedText = (key, section = null) => {
    try {
      return getText(gameTheme, language, key, section) || 
            (language === "en" ? key : key); // Simple fallback to the key itself
    } catch (e) {
      return language === "en" ? key : key;
    }
  };

  // Updated: Handle play again for online games with delay and notification
  const handlePlayAgain = () => {
    if (isOnline) {
      // For online play, show a brief loading notification
      setNotification(getLocalizedText("resettingGame"));
      
      // Call the socket service to play again
      socketService.playAgain({
        roomId,
        gameTime: 0 // Reset game time
      });
      
      // Add a small delay before transitioning to ensure server processes the reset
      setTimeout(() => {
        // Then go back to the waiting room
        setGamePhase("waiting_room");
      }, 800);
    } else {
      // For local play, just use the initializeGame function
      initializeGame();
    }
  };

  // Handle going back to menu/lobby
  const handleBackToMenu = () => {
    if (isOnline) {
      // For online play, leave the room first
      socketService.leaveRoom({
        roomId
      });
      setGamePhase("online_lobby");
    } else {
      // For local play, just go back to the intro
      setGamePhase("intro");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Calculate performance rating based on time and moves
  const getPerformanceRating = () => {
    // Base thresholds (can be adjusted)
    const moveThresholds = {
      easy: { excellent: 10, good: 14, average: 18 },
      medium: { excellent: 16, good: 22, average: 30 },
      hard: { excellent: 25, good: 35, average: 45 }
    };
    
    const timeThresholds = {
      easy: { excellent: 30, good: 45, average: 60 },
      medium: { excellent: 60, good: 90, average: 120 },
      hard: { excellent: 90, good: 120, average: 180 }
    };
    
    const thresholds = moveThresholds[difficulty] || moveThresholds.medium;
    const timeThreshold = timeThresholds[difficulty] || timeThresholds.medium;
    
    // Calculate score based on moves and time
    const moveScore = moves <= thresholds.excellent ? 3 : 
                      moves <= thresholds.good ? 2 : 
                      moves <= thresholds.average ? 1 : 0;
                      
    const timeScore = completionTime <= timeThreshold.excellent ? 3 : 
                      completionTime <= timeThreshold.good ? 2 : 
                      completionTime <= timeThreshold.average ? 1 : 0;
                      
    const totalScore = moveScore + timeScore;
    
    // Return rating based on total score
    if (totalScore >= 5) return getLocalizedText("memoryMaster");
    if (totalScore === 4) return getLocalizedText("excellentMemory");
    if (totalScore === 3) return getLocalizedText("goodJob");
    if (totalScore === 2) return getLocalizedText("gettingThere");
    return getLocalizedText("keepPracticing");
  };

  // Determine difficulty label color
  const getDifficultyColor = () => {
    switch(difficulty) {
      case "hard":
        return "bg-red-600";
      case "medium":
        return "bg-blue-600";
      case "easy":
      default:
        return "bg-green-600";
    }
  };

  return (
    <div className={`text-center max-w-md mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      
      {/* Add notification system */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-40"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mb-4 flex flex-col items-center"
          variants={itemVariants}
        >
          <motion.h1 
            className={`text-3xl font-bold ${currentTheme.title} mb-2`}
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: currentTheme.titleAnimation
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getLocalizedText("gameOver")}
          </motion.h1>
          
          <motion.div
            className={`${currentTheme.subtitle} mb-1`}
            variants={itemVariants}
          >
            {getLocalizedText("difficulty")}
            <span className={`${getDifficultyColor()} py-0.5 px-1 rounded-lg mx-0.5`}> 
              {getLocalizedText(difficulty, "common")} 
            </span> 
            {isOnline ? `• ${getLocalizedText("online")}` : ""}
          </motion.div>
          
          {isOnline && roomId && (
            <motion.div className="text-xs text-gray-400 mb-2" variants={itemVariants}>
              {getLocalizedText("room")}: {roomId}
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className={`${currentTheme.resultsBg} backdrop-blur-sm rounded-xl p-3 mb-6`}
          variants={itemVariants}
        >
          {!isMultiplayerGame() ? (
            // Single player results
            <div>
              <h2 className={`text-lg font-bold ${currentTheme.sectionTitle} mb-2`}>{getLocalizedText("yourResults")}</h2>
              <div className="text-white mb-2">
                <p className="mb-1">{getPlayerName(0)}</p>
                <p className="text-gray-300 text-sm mb-1">
                  {getLocalizedText("completed")} {moves} {getLocalizedText("moves")}
                </p>
                <p className="text-gray-300 text-sm">
                  {getLocalizedText("time", "common")}: {formatTime(completionTime)}
                </p>
              </div>
              
              {/* Performance rating for single player */}
              <div className={`mt-3 p-2 rounded-lg font-medium ${currentTheme.winnerTile}`}>
                {getPerformanceRating()}
              </div>
            </div>
          ) : (
            // Multiplayer results
            <div>
              <h2 className={`text-lg font-bold ${currentTheme.sectionTitle} mb-2`}>
                {winners.length > 1 ? getLocalizedText("itsATie") : getLocalizedText("winner")}
              </h2>
              
              {/* Winners */}
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {winners.map((winner) => (
                  <motion.div
                    key={winner.id || winner.index}
                    className={`px-3 py-2 bg-gradient-to-r ${currentTheme.winnerGradient} rounded-lg text-white`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="font-bold">{winner.name}</div>
                    <div className="text-sm">{winner.score} {getLocalizedText("pairsFound")}</div>
                  </motion.div>
                ))}
              </div>
              
              {/* Game stats for multiplayer */}
              <div className="text-center text-gray-300 text-sm mb-3">
                {getLocalizedText("time", "common")}: {formatTime(completionTime)}
              </div>
              
              {/* All player scores */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {playerScores.map((player, index) => (
                  <div
                    key={player.id || index}
                    className={`p-2 rounded-lg text-sm ${
                      winners.some(w => w.index === index)
                        ? currentTheme.winnerTile
                        : currentTheme.loserTile
                    }`}
                  >
                    <div className="font-medium">{getPlayerName(index)}</div>
                    <div>{player.score || 0} {getLocalizedText("pairsFound")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="flex justify-center gap-4"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleBackToMenu}
            className="px-4 py-2 bg-gray-800 text-gray-100 font-medium rounded-lg shadow-md border border-gray-700"
            whileHover={{ scale: 1.05, backgroundColor: "#374151" }}
            whileTap={{ scale: 0.95 }}
          >
            {isOnline ? getLocalizedText("backToLobby") : getLocalizedText("home")}
          </motion.button>
          <motion.button
            onClick={handlePlayAgain}
            className={`px-6 py-2 bg-gradient-to-r ${currentTheme.buttonGradient} text-white font-medium rounded-lg shadow-md`}
            whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${currentTheme.buttonGlow}` }}
            whileTap={{ scale: 0.95 }}
          >
            {getLocalizedText("playAgain")}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;