import React from "react";
import { motion } from "framer-motion";
import { getDifficultyName } from "../utils/utils";

const GameOverScreen = ({
  difficulty,
  moves,
  playerCount,
  playerScores,
  initializeGame,
  setGamePhase,
  playerNames = []
}) => {
  // Get the winner(s) for multiplayer
  const getWinners = () => {
    if (playerCount <= 1) return [];
    
    const maxScore = Math.max(...playerScores.map(p => p.score));
    return playerScores
      .map((player, index) => ({ ...player, index, name: playerNames[index] || `Player ${player.id + 1}` }))
      .filter(player => player.score === maxScore);
  };

  const winners = getWinners();

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

  return (
    <div className="text-center max-w-md mx-auto p-4 bg-orange-500/20 rounded-xl backdrop-blur-lg shadow-2xl border border-white/20 relative overflow-hidden">
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      
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
            className="text-3xl font-bold text-yellow-400 mb-2"
            animate={{ 
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 8px rgba(255,0,0,0.5)", 
                "0 0 16px rgba(255,0,0,0.8)", 
                "0 0 8px rgba(255,0,0,0.5)"
              ] 
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Game Over!
          </motion.h1>
          
          <motion.div
            className="text-gray-200 mb-1"
            variants={itemVariants}
          >
            {getDifficultyName(difficulty)} Mode
          </motion.div>
        </motion.div>

        <motion.div 
          className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 mb-6"
          variants={itemVariants}
        >
          {playerCount <= 1 ? (
            // Single player results
            <div>
              <h2 className="text-lg font-bold text-yellow-300 mb-2">Your Results</h2>
              <div className="text-white">
                <p className="mb-1">{playerNames[0] || "Player 1"}</p>
                <p className="text-gray-300 text-sm">Completed in {moves} moves</p>
              </div>
            </div>
          ) : (
            // Multiplayer results
            <div>
              <h2 className="text-lg font-bold text-yellow-300 mb-2">
                {winners.length > 1 ? "It's a tie!" : "Winner!"}
              </h2>
              
              {/* Winners */}
              <div className="flex justify-center gap-2 mb-4">
                {winners.map((winner) => (
                  <motion.div
                    key={winner.id}
                    className="px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="font-bold">{winner.name}</div>
                    <div className="text-sm">{winner.score} pairs</div>
                  </motion.div>
                ))}
              </div>
              
              {/* All player scores */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {playerScores.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded-lg text-sm ${
                      winners.some(w => w.id === player.id)
                        ? "bg-yellow-900/50 text-yellow-200"
                        : "bg-gray-700/50 text-gray-300"
                    }`}
                  >
                    <div className="font-medium">{playerNames[index] || `Player ${player.id + 1}`}</div>
                    <div>{player.score} pairs</div>
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
            onClick={() => setGamePhase("intro")}
            className="px-4 py-2 bg-gray-800 text-gray-100 font-medium rounded-lg shadow-md border border-gray-700"
            whileHover={{ scale: 1.05, backgroundColor: "#374151" }}
            whileTap={{ scale: 0.95 }}
          >
            Home
          </motion.button>
          <motion.button
            onClick={initializeGame}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-md"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255, 160, 0, 0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            Play Again
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GameOverScreen;