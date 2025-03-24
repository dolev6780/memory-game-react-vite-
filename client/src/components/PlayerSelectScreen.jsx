import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDifficultyName } from "../utils/utils";
// Update the paths to match your project structure
import one from '../assets/one.png';
import two from '../assets/two.png';
import three from '../assets/three.png';
import four from '../assets/four.png';

const PlayerSelectScreen = ({ 
  difficulty, 
  playerCount, 
  handlePlayerCountSelect, 
  setGamePhase, 
  handleStartGame,
  playerNames = [],
  setPlayerNames
}) => {
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

  return (
    <div className="text-center max-w-md mx-auto p-4 bg-orange-500/20 rounded-xl backdrop-blur-lg shadow-2xl border border-white/20 relative overflow-hidden">
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="mb-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-2xl font-bold text-yellow-400 mb-2"
            variants={itemVariants}
          >
            {getDifficultyName(difficulty)}
          </motion.h1>
          <motion.p 
            className="text-gray-200 mb-3"
            variants={itemVariants}
          >
            Select the number of players
          </motion.p>
        </motion.div>

        <motion.div 
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-xl font-bold text-yellow-300 mb-4"
            variants={itemVariants}
          >
            Number of Players
          </motion.h2>
          <div className="flex justify-center gap-4">
            {[one, two, three, four].map((playerImage, i) => (
              <motion.button
                key={i}
                onClick={() => handlePlayerCountSelect(i+1)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                variants={itemVariants}
                className="relative cursor-pointer"
              >
                <img 
                  src={playerImage} 
                  alt={`${i+1} player${i > 0 ? 's' : ''}`}
                  className={`w-16 h-16 rounded-full transition-all duration-200
                    opacity-70 hover:opacity-100`}
                />
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs px-2 py-0.5 rounded-full
                  ${i+1 === playerCount 
                    ? "bg-yellow-500 text-black font-bold" 
                    : "bg-gray-800 text-gray-300"}`}>
                  {i+1}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {playerCount > 0 && (
          <motion.div
            className="bg-yellow-900/30 rounded-xl p-3 mb-6 border border-yellow-500/50 backdrop-blur-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-bold text-yellow-300 mb-2">Players</h2>
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
                    className="w-full bg-gray-700/70 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 focus:border-yellow-400"
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
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 160, 0, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: ["0 0 0 rgba(255, 160, 0, 0)", "0 0 10px rgba(255, 160, 0, 0.5)", "0 0 0 rgba(255, 160, 0, 0)"],
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