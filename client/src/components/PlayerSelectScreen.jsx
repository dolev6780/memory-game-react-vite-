import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDifficultyName } from "../utils/utils";
// Update the paths to match your project structure
import one from '../assets/one.png';
import two from '../assets/two.png';
import three from '../assets/three.png';
import four from '../assets/four.png';
import pokeball from '../assets/pokeball.png';

const PlayerSelectScreen = ({ 
  difficulty, 
  setDifficulty, // Make sure this prop is included and passed correctly
  playerCount, 
  handlePlayerCountSelect, 
  setGamePhase, 
  handleStartGame,
  playerNames = [],
  setPlayerNames,
  gameTheme = "dragonball" 
}) => {
  // Optional debugging logs
  console.log("Difficulty in PlayerSelectScreen:", difficulty);
  console.log("setDifficulty function available:", typeof setDifficulty === 'function');

  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-orange-500/20 border-white/20",
      title: "text-red-400",
      subtitle: "text-yellow-400",
      playerBox: "bg-yellow-900/30 border-yellow-500/50",
      buttonGradient: "from-orange-500 to-orange-600",
      buttonGlow: "rgba(255, 160, 0, 0.5)",
      selectedCount: "bg-red-500",
      inputFocus: "focus:ring-red-400 focus:border-red-400",
      difficultyActive: "bg-red-500 text-white", 
      difficultyInactive: "bg-gray-700/70 text-gray-200 hover:bg-gray-700"
    },
    pokemon: {
      container: "bg-blue-500/20 border-white/20",
      title: "text-blue-400",
      subtitle: "text-yellow-400",
      playerBox: "bg-blue-900/30 border-blue-500/50",
      buttonGradient: "from-blue-500 to-yellow-500",
      buttonGlow: "rgba(96, 165, 250, 0.5)",
      selectedCount: "bg-blue-500",
      inputFocus: "focus:ring-blue-400 focus:border-blue-400",
      difficultyActive: "bg-blue-500 text-white",
      difficultyInactive: "bg-gray-700/70 text-gray-200 hover:bg-gray-700"
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  // Update player names when player count changes
  useEffect(() => {
    // Initialize with default names when player count changes
    if (!playerNames.length || playerNames.length !== playerCount) {
      const defaultNames = Array.from({ length: playerCount }).map((_, index) => `Player ${index + 1}`);
      setPlayerNames(defaultNames);
    }
  }, [playerCount, setPlayerNames, playerNames]);

  // Handle player name change
  const handleNameChange = (index, newName) => {
    const updatedNames = [...playerNames];
    updatedNames[index] = newName;
    setPlayerNames(updatedNames);
  };

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  // Animation variants for items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Function to handle difficulty change
  const handleDifficultyChange = (newDifficulty) => {
    console.log("Setting difficulty to:", newDifficulty);
    setDifficulty(newDifficulty);
  };

  return (
    <div className={`text-center max-w-md mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden`}>
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
            Game Setup
          </motion.h1>
          <motion.p 
            className="text-gray-200 mb-3"
            variants={itemVariants}
          >
            Set up your local game
          </motion.p>
        </motion.div>

        {/* Difficulty Selection - Fixed version */}
        <motion.div 
          className="mb-6 relative z-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className={`text-xl font-bold ${currentTheme.subtitle} mb-3`}
            variants={itemVariants}
          >
            Select Difficulty
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
              easy
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
              medium
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
              hard
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
            Number of Players
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
                  src={gameTheme === "dragonball" ? 
                    [one, two, three, four][i] : 
                    pokeball} 
                  alt={`${count} player${count > 1 ? 's' : ''}`}
                  className={`w-16 h-16 rounded-full transition-all duration-200
                    opacity-70 hover:opacity-100`}
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
            <h2 className={`text-lg font-bold ${currentTheme.subtitle} mb-2`}>Players</h2>
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
                    value={playerNames[index] || `Player ${index + 1}`}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                    className={`w-full bg-gray-700/70 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none ${currentTheme.inputFocus}`}
                    placeholder={`Player ${index + 1}`}
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
            Back
          </motion.button>
          <motion.button
            onClick={() => handleStartGame(playerNames)}
            className={`px-6 py-2 bg-gradient-to-r ${currentTheme.buttonGradient} text-white font-medium rounded-lg shadow-md`}
            whileHover={{ scale: 1.05, boxShadow: `0 0 15px ${currentTheme.buttonGlow}` }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                `0 0 0 rgba(0, 0, 0, 0)`, 
                `0 0 10px ${currentTheme.buttonGlow}`, 
                `0 0 0 rgba(0, 0, 0, 0)`
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Start Game
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerSelectScreen;