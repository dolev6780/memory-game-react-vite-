// src/components/SessionScreen.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import socket from "../socket";

const SessionScreen = ({ 
  setGamePhase, 
  gameTheme, 
  difficulty, 
  setOnlineSession,
  setIsHost
}) => {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-orange-500/20 border-white/20",
      title: "text-red-400",
      subtitle: "text-yellow-400",
      inputFocus: "focus:ring-red-400 focus:border-red-400",
      buttonGradient: "from-orange-500 to-orange-600",
      buttonGlow: "rgba(255, 160, 0, 0.5)",
    },
    pokemon: {
      container: "bg-blue-500/20 border-white/20",
      title: "text-blue-400",
      subtitle: "text-yellow-400",
      inputFocus: "focus:ring-blue-400 focus:border-blue-400",
      buttonGradient: "from-blue-500 to-yellow-500",
      buttonGlow: "rgba(96, 165, 250, 0.5)",
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  useEffect(() => {
    // Listen for game creation confirmation
    socket.on('gameCreated', ({ sessionId, isHost, gameState }) => {
      setIsLoading(false);
      setIsHost(true);
      setOnlineSession({
        id: sessionId,
        players: gameState.players,
        isActive: true
      });
      setGamePhase("waiting_room");
    });

    // Listen for joining confirmation
    socket.on('gameJoined', ({ sessionId, isHost, gameState }) => {
      setIsLoading(false);
      setIsHost(isHost);
      setOnlineSession({
        id: sessionId,
        players: gameState.players,
        isActive: true
      });
      setGamePhase("waiting_room");
    });

    // Listen for errors
    socket.on('joinError', ({ message }) => {
      setIsLoading(false);
      setError(message);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('joinError');
    };
  }, [setGamePhase, setOnlineSession, setIsHost]);

  const handleCreateGame = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");
    socket.emit('createGame', { 
      playerName: playerName.trim(),
      difficulty,
      gameTheme
    });
  };

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!joinCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    setIsLoading(true);
    setError("");
    socket.emit('joinGame', { 
      sessionId: joinCode.trim().toUpperCase(),
      playerName: playerName.trim()
    });
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

  return (
    <div className={`text-center max-w-md mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden`}>
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      
      <motion.div
        className="relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          className={`text-2xl font-bold ${currentTheme.title} mb-4`}
          variants={itemVariants}
        >
          Online Memory Game
        </motion.h1>
        
        <motion.div
          className="mb-6"
          variants={itemVariants}
        >
          <label className="block text-gray-200 text-sm mb-1">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className={`w-full bg-gray-800/60 border border-gray-700 rounded px-3 py-2 text-white ${currentTheme.inputFocus} focus:outline-none`}
            placeholder="Enter your name"
            maxLength={12}
            disabled={isLoading}
          />
        </motion.div>
        
        <motion.div
          className="grid grid-cols-1 gap-4 mt-6"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleCreateGame}
            className={`px-4 py-3 bg-gradient-to-r ${currentTheme.buttonGradient} text-white font-medium rounded-lg shadow-md relative overflow-hidden`}
            whileHover={{ scale: 1.03, boxShadow: `0 0 15px ${currentTheme.buttonGlow}` }}
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : "Create New Game"}
          </motion.button>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className={`flex-1 bg-gray-800/60 border border-gray-700 rounded px-3 py-2 text-white ${currentTheme.inputFocus} focus:outline-none uppercase`}
              placeholder="Enter game code"
              maxLength={6}
              disabled={isLoading}
            />
            <motion.button
              onClick={handleJoinGame}
              className="px-4 py-2 bg-gray-700 text-white font-medium rounded-lg shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : "Join"}
            </motion.button>
          </div>
        </motion.div>
        
        {error && (
          <motion.div 
            className="mt-4 text-red-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}
        
        <motion.button
          onClick={() => setGamePhase("intro")}
          className="mt-6 px-4 py-2 bg-gray-800 text-gray-300 text-sm rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          variants={itemVariants}
          disabled={isLoading}
        >
          Back
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SessionScreen;