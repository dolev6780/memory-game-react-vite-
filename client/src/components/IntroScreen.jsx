import React from "react";
import { motion } from "framer-motion";
const IntroScreen = ({ difficulty, handleDifficultySelect }) => {
  return (
    <div className="text-center max-w-md mx-auto p-4 bg-orange-500/20 rounded-xl backdrop-blur-lg shadow-2xl border border-white/20 relative overflow-hidden">
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="mb-6">
          <motion.h1 
            className="text-3xl sm:text-4xl font-bold text-red-600 mb-3"
            animate={{ 
              textShadow: [
                "0 0 8px rgba(255,0,0,0.5)", 
                "0 0 16px rgba(255,0,0,0.8)", 
                "0 0 8px rgba(255,0,0,0.5)"
              ] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Dragon Ball Memory Game
          </motion.h1>
          <p className="text-white text-sm sm:text-base">Match pairs of Dragon Ball characters and test your memory!</p>
        </div>

        <motion.div 
          className="bg-yellow-900/30 rounded-xl p-4 mb-6 border border-yellow-500/50 backdrop-blur-sm"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <h2 className="text-xl font-bold text-yellow-300 mb-2">
            How to Play
          </h2>
          <ul className="text-left text-gray-100 mb-2 text-sm sm:text-base">
            <li className="flex items-center mb-1">
              <span className="mr-2 text-yellow-500">•</span>
              Click cards to flip them over
            </li>
            <li className="flex items-center mb-1">
              <span className="mr-2 text-yellow-500">•</span>
              Find matching pairs of characters
            </li>
            <li className="flex items-center mb-1">
              <span className="mr-2 text-yellow-500">•</span>
              Complete the game with as few moves as possible
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-yellow-500">•</span>
              Challenge friends in multiplayer mode
            </li>
          </ul>
        </motion.div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-yellow-300 mb-4">
            Select Difficulty
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {[
              { level: "easy", label: "Easy", description: "6 pairs" },
              { level: "medium", label: "Medium", description: "10 pairs" },
              { level: "hard", label: "Hard", description: "15 pairs" }
            ].map((option) => (
              <motion.button
                key={option.level}
                onClick={() => handleDifficultySelect(option.level)}
                className={`py-3 px-5 rounded-lg font-bold transition-all relative overflow-hidden hover:text-red-600 text-gray-100
                       hover:bg-gradient-to-br hover:from-orange-300/80 hover:to-orange-500/80 hover:backdrop-blur-sm
                            bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm cursor-pointer
                  `}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative z-10 flex flex-col">
                  <span>{option.label}</span>
                  <span className="text-xs mt-1 opacity-80">{option.description}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        <motion.div
          className="text-gray-300 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          Select a difficulty level to begin
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntroScreen;