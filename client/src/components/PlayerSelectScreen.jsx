import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  themeStyles,
  getText,
  getDifficultyName,
  one,
  two,
  three,
  four,
  pokeball,
} from "../themeConfig";

const PlayerSelectScreen = ({
  difficulty,
  setDifficulty,
  playerCount,
  handlePlayerCountSelect,
  setGamePhase,
  handleStartGame,
  playerNames = [],
  setPlayerNames,
  gameTheme = "dragonball",
  language = "he",
  toggleLanguage,
}) => {
  // State for validation
  const [nameError, setNameError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Get theme styles from centralized config
  const currentThemeConfig = themeStyles[gameTheme] || themeStyles.dragonball;

  // Create theme-specific styles for this component
  const currentTheme = {
    container: currentThemeConfig.colors.container,
    title: currentThemeConfig.text.title,
    subtitle: currentThemeConfig.text.subtitle,
    playerBox:
      gameTheme === "dragonball"
        ? "bg-yellow-900/30 border-yellow-500/50"
        : "bg-blue-900/30 border-blue-500/50",
    buttonGradient: currentThemeConfig.colors.buttonGradient,
    buttonGlow: currentThemeConfig.animations.glow,
    selectedCount: gameTheme === "dragonball" ? "bg-red-500" : "bg-blue-500",
    inputFocus:
      gameTheme === "dragonball"
        ? "focus:ring-red-400 focus:border-red-400"
        : "focus:ring-blue-400 focus:border-blue-400",
    difficultyActive:
      gameTheme === "dragonball"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white",
    difficultyInactive: "bg-gray-700/70 text-gray-200 hover:bg-gray-700",
    error: "bg-red-500/20 border border-red-500 text-red-200"
  };

  // Initialize with empty player names when player count changes
  useEffect(() => {
    if (!playerNames.length || playerNames.length !== playerCount) {
      // Initialize with empty strings instead of default names
      const emptyNames = Array.from({ length: playerCount }).map(() => "");
      setPlayerNames(emptyNames);
      
      // Clear any existing errors
      setNameError(false);
      setErrorMessage("");
    }
  }, [playerCount, setPlayerNames, playerNames]);

  // Handle player name change
  const handleNameChange = (index, newName) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = newName;
    setPlayerNames(updatedNames);
    
    // Clear error when user starts typing
    if (newName && nameError) {
      setNameError(false);
      setErrorMessage("");
    }
  };

  // Validate if all player names are entered
  const validateNames = () => {
    // Check if any player name is empty
    const emptyNames = playerNames.filter(name => !name.trim()).length;
    
    if (emptyNames > 0) {
      setNameError(true);
      setErrorMessage(
        language === "en" 
          ? `Please enter names for all ${playerCount} players`
          : `אנא הזן שמות לכל ${playerCount} השחקנים`
      );
      return false;
    }
    
    return true;
  };

  // Handle start game with validation
  const handleValidatedStart = () => {
    if (validateNames()) {
      handleStartGame(playerNames);
    } else {
      // Shake the error message for emphasis
      const inputs = document.querySelectorAll('input[type="text"]');
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.classList.add('border-red-500', 'bg-red-500/10');
          setTimeout(() => {
            input.classList.remove('border-red-500', 'bg-red-500/10');
          }, 2000);
        }
      });
    }
  };

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Error animation variants
  const errorVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Function to handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
  };

  return (
    <div
      className={`text-center max-w-md mx-auto p-4 ${
        currentTheme.container
      } rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden ${
        language === "he" ? "rtl" : "ltr"
      }`}
    >
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <motion.div
          className="mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className={`text-2xl font-bold ${currentTheme.title} mb-2`}
            variants={itemVariants}
          >
            {getText(gameTheme, language, "gameSetup")}
          </motion.h1>
          <motion.p 
            className="text-gray-200 mb-3"
            variants={itemVariants}
          >
            {getText(gameTheme, language, "setupLocal")}
          </motion.p>
        </motion.div>

        {/* Difficulty Selection */}
        <motion.div
          className="mb-6 relative z-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          dir={language === "en" ? "ltr" : "rtl"}
        >
          <motion.h2
            className={`text-xl font-bold ${currentTheme.subtitle} mb-3`}
            variants={itemVariants}
          >
            {getText(gameTheme, language, "selectDifficulty")}
          </motion.h2>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
            {/* Individual buttons for each difficulty level */}
            <motion.button
              onClick={() => handleDifficultyChange("easy")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-sm sm:text-base font-semibold uppercase transition-colors duration-200 relative z-10 cursor-pointer ${
                difficulty === "easy"
                  ? currentTheme.difficultyActive
                  : currentTheme.difficultyInactive
              }`}
            >
              {getText(gameTheme, language, "easy", "common")}
            </motion.button>

            <motion.button
              onClick={() => handleDifficultyChange("medium")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-sm sm:text-base font-semibold uppercase transition-colors duration-200 relative z-10 cursor-pointer ${
                difficulty === "medium"
                  ? currentTheme.difficultyActive
                  : currentTheme.difficultyInactive
              }`}
            >
              {getText(gameTheme, language, "medium", "common")}
            </motion.button>

            <motion.button
              onClick={() => handleDifficultyChange("hard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              variants={itemVariants}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-sm sm:text-base font-semibold uppercase transition-colors duration-200 relative z-10 cursor-pointer ${
                difficulty === "hard"
                  ? currentTheme.difficultyActive
                  : currentTheme.difficultyInactive
              }`}
            >
              {getText(gameTheme, language, "hard", "common")}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2
            className={`text-xl font-bold ${currentTheme.subtitle} mb-4`}
            variants={itemVariants}
          >
            {getText(gameTheme, language, "numberPlayers")}
          </motion.h2>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4].map((count, i) => (
              <motion.button
                key={i}
                onClick={() => handlePlayerCountSelect(count)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                variants={itemVariants}
                className="relative cursor-pointer"
              >
                <img
                  src={
                    gameTheme === "dragonball"
                      ? [one, two, three, four][i]
                      : pokeball
                  }
                  alt={`${count} ${getText(
                    gameTheme,
                    language,
                    count === 1 ? "player" : "players",
                    "common"
                  )}`}
                  className={`w-16 h-16 rounded-full transition-all duration-200
    ${
      count === playerCount
        ? "opacity-100 filter brightness-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
        : "opacity-70 hover:opacity-100"
    }`}
                />
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs px-2 py-0.5 rounded-full
                  ${count === playerCount 
                    ? currentTheme.selectedCount + " text-white font-bold" 
                    : "bg-gray-800 text-gray-300"}`}>
                  {count}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {playerCount > 0 && (
          <motion.div
            className={`${currentTheme.playerBox} rounded-xl p-3 mb-6 border backdrop-blur-sm`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={`text-lg font-bold ${currentTheme.subtitle} mb-2`}>
              {getText(gameTheme, language, "players")}
            </h2>
            
            {/* Error message */}
            <AnimatePresence>
              {nameError && (
                <motion.div 
                  className={`py-2 px-3 rounded-lg text-sm mb-3 ${currentTheme.error}`}
                  variants={errorVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: playerCount }).map((_, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-800/70 p-2 rounded-lg overflow-hidden"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <input
                    type="text"
                    value={playerNames[index] || ""}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className={`w-full bg-gray-700/70 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none transition-colors duration-200 ${currentTheme.inputFocus}`}
                    placeholder={
                      language === "en"
                        ? `Player ${index + 1}`
                        : `שחקן ${index + 1}`
                    }
                    maxLength={12}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <motion.button
            onClick={() => setGamePhase("intro")}
            className="px-4 py-2 bg-gray-800 text-gray-100 font-medium rounded-lg shadow-md border border-gray-700"
            whileHover={{ scale: 1.05, backgroundColor: "#374151" }}
            whileTap={{ scale: 0.95 }}
          >
            {getText(gameTheme, language, "buttonBack")}
          </motion.button>
          <motion.button
            onClick={handleValidatedStart}
            className={`px-6 py-2 bg-gradient-to-r ${currentTheme.buttonGradient} text-white font-medium rounded-lg shadow-md`}
            whileHover={{
              scale: 1.05,
              boxShadow: `0 0 15px ${currentTheme.buttonGlow}`,
            }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                `0 0 0 rgba(0, 0, 0, 0)`,
                `0 0 10px ${currentTheme.buttonGlow}`,
                `0 0 0 rgba(0, 0, 0, 0)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getText(gameTheme, language, "buttonStart")}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerSelectScreen;