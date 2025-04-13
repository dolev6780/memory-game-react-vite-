import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import socket from "../socket";
import { getText } from "../themeConfig"; 

const SessionScreen = ({ 
  setGamePhase, 
  gameTheme, 
  difficulty, 
  setOnlineSession,
  setIsHost,
  language = "en",
}) => {
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Define theme-specific styles with updated theme names
  const themeStyles = {
    animals: {
      container: "bg-green-900/20 border-green-500/20",
      title: "text-green-400",
      subtitle: "text-green-300",
      inputFocus: "focus:ring-green-400 focus:border-green-400",
      buttonGradient: "from-green-500 to-green-600",
      buttonGlow: "rgba(34, 197, 94, 0.5)",
    },
    flags: {
      container: "bg-blue-900/20 border-blue-500/20",
      title: "text-blue-400",
      subtitle: "text-blue-300",
      inputFocus: "focus:ring-blue-400 focus:border-blue-400",
      buttonGradient: "from-blue-500 to-blue-600",
      buttonGlow: "rgba(59, 130, 246, 0.5)",
    }
  };

  // Get current theme styles with proper fallback
  const currentTheme = themeStyles[gameTheme] || themeStyles.animals;

  // Helper function to get localized text with fallback
  const getLocalizedText = (key, section = null) => {
    try {
      return getText(gameTheme, language, key, section) || 
        (language === "en" ? key : key);
    } catch (e) {
      return language === "en" ? key : key;
    }
  };

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
      setError(language === "en" ? "Please enter your name" : "אנא הזן את שמך");
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
      setError(language === "en" ? "Please enter your name" : "אנא הזן את שמך");
      return;
    }

    if (!joinCode.trim()) {
      setError(language === "en" ? "Please enter a game code" : "אנא הזן קוד משחק");
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
    <div className={`text-center max-w-md mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
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
          {getLocalizedText("onlinePlay")}
        </motion.h1>
        
        <motion.div
          className={`mb-6 ${language === 'he' ? 'text-right' : 'text-left'}`}
          variants={itemVariants}
        >
          <label className="block text-gray-200 text-sm mb-1">
            {getLocalizedText("enterYourName")}
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className={`w-full bg-gray-800/60 border border-gray-700 rounded px-3 py-2 text-white ${currentTheme.inputFocus} focus:outline-none`}
            placeholder={getLocalizedText("enterYourName")}
            maxLength={12}
            disabled={isLoading}
            dir={language === "en" ? "ltr" : "rtl"}
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
                {language === "en" ? "Creating..." : "יוצר..."}
              </span>
            ) : getLocalizedText("createRoom")}
          </motion.button>
          
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400">{language === "en" ? "or" : "או"}</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className={`flex-1 bg-gray-800/60 border border-gray-700 rounded px-3 py-2 text-white ${currentTheme.inputFocus} focus:outline-none uppercase`}
              placeholder={getLocalizedText("enterRoomCode")}
              maxLength={6}
              disabled={isLoading}
              dir="ltr" // Always LTR for code inputs
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
              ) : getLocalizedText("joinRoom")}
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
          {getLocalizedText("buttonBack")}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SessionScreen;