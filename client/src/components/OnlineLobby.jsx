import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSocket from "../hooks/useSocket";
import { getText } from "../themeConfig"; // Import getText for translations

const OnlineLobby = ({ 
  gameTheme, 
  difficulty, 
  setDifficulty, 
  setGamePhase, 
  setMultiplayerData,
  setGameTheme,
  language = "en", // Add language prop with default
  toggleLanguage // Add toggleLanguage function prop
}) => {
  const [tab, setTab] = useState("join");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Create a ref to store playerName value without affecting dependencies
  const playerNameRef = useRef("");
  
  // Initialize the socket hook with a unique component ID
  const socket = useSocket("OnlineLobby", true);
  
  // Keep the ref updated with current playerName
  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  // Theme-specific styles with updated theme names
  const themeStyles = {
    animals: {
      container: "bg-green-900/20 border-green-500/20",
      title: "text-green-400",
      subtitle: "text-green-300",
      tabActive: "bg-green-600 text-white",
      tabInactive: "bg-gray-800 text-gray-300 hover:bg-gray-700",
      buttonGradient: "from-green-500 to-green-600",
      inputFocus: "focus:ring-green-400 focus:border-green-400",
      roomCardBg: "bg-gray-800/60",
      roomCardHover: "hover:bg-gray-700/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-blue-600",
      difficultyHard: "bg-red-600",
    },
    flags: {
      container: "bg-blue-900/20 border-blue-500/20",
      title: "text-blue-400",
      subtitle: "text-blue-300",
      tabActive: "bg-blue-600 text-white",
      tabInactive: "bg-gray-800 text-gray-300 hover:bg-gray-700",
      buttonGradient: "from-blue-500 to-blue-600",
      inputFocus: "focus:ring-blue-400 focus:border-blue-400",
      roomCardBg: "bg-blue-900/60",
      roomCardHover: "hover:bg-blue-800/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-blue-600",
      difficultyHard: "bg-red-600",
    }
  };

  // Get current theme with proper fallback
  const currentTheme = themeStyles[gameTheme] || themeStyles.animals;

  // Helper function to get localized text with fallback
  const getLocalizedText = useCallback((key, section = null) => {
    try {
      return getText(gameTheme, language, key, section) || 
        (language === "en" ? key : key);
    } catch (e) {
      return language === "en" ? key : key;
    }
  }, [gameTheme, language]);
  
  // Helper function to get theme display name
  const getThemeDisplayName = useCallback((theme) => {
    switch (theme) {
      case "animals":
        return language === "en" ? "Animals" : "בעלי חיים";
      case "flags":
        return language === "en" ? "Flags" : "דגלים";
      default:
        return theme;
    }
  }, [language]);
  
  // Function to load rooms
  const loadRooms = useCallback(() => {
    setIsLoading(true);
    setError("");
    
    if (socket.isConnected()) {
      socket.getRooms();
    } else {
      socket.connect();
      setTimeout(() => {
        if (socket.isConnected()) {
          socket.getRooms();
        } else {
          setIsLoading(false);
          setError(language === "en" ? "Could not connect to server" : "לא ניתן להתחבר לשרת");
        }
      }, 1000);
    }
  }, [socket, language]);

  // Set up event listeners
  useEffect(() => {
    // Connection events
    socket.addEventListener("connect", () => {
      console.log("Connected to socket server in OnlineLobby");
      setIsConnected(true);
      setIsLoading(false);
      loadRooms();
    });
    
    socket.addEventListener("connect_error", (error) => {
      console.error("Connection error in OnlineLobby:", error);
      setIsConnected(false);
      setIsLoading(false);
      setError(language === "en" ? "Could not connect to server. Retrying..." : "לא ניתן להתחבר לשרת. מנסה שוב...");
      
      if (connectionAttempts < 3) {
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
        }, 2000);
      }
    });
    
    socket.addEventListener("roomList", (data) => {
      console.log("Room list received in OnlineLobby");
      
      const filteredRooms = data.rooms.filter(room => 
        room.gameTheme === gameTheme
      );
      
      console.log(`Filtered ${data.rooms.length} rooms to ${filteredRooms.length} matching theme: ${gameTheme}`);
      
      setAvailableRooms(filteredRooms);
      setIsLoading(false);
    });
    
    socket.addEventListener("roomCreated", (roomData) => {
      console.log("Room created in OnlineLobby:", roomData);
      setIsLoading(false);
      
      setMultiplayerData({
        roomId: roomData.roomId,
        isHost: true,
        players: roomData.players,
        gameState: roomData.gameState,
        gameTheme: gameTheme // Use the current theme since we're the host
      });
      
      setGamePhase("waiting_room");
    });
    
    socket.addEventListener("roomJoined", (roomData) => {
      console.log("Room joined in OnlineLobby:", roomData);
      setIsLoading(false);
      
      if (roomData.gameTheme && roomData.gameTheme !== gameTheme) {
        console.log(`Switching theme to match room: ${gameTheme} -> ${roomData.gameTheme}`);
        setGameTheme(roomData.gameTheme);
      }
      
      setMultiplayerData({
        roomId: roomData.roomId,
        isHost: false,
        players: roomData.players,
        gameState: roomData.gameState,
        gameTheme: roomData.gameTheme || gameTheme
      });
      
      setTimeout(() => {
        setGamePhase("waiting_room");
      }, 100);
    });
    
    socket.addEventListener("roomError", (data) => {
      console.error("Room error in OnlineLobby:", data);
      setIsLoading(false);
      
      // Handle theme compatibility error specifically
      if (data.message && data.message.includes("theme")) {
        setError(language === "en" 
          ? `Cannot join room with different theme. Your current theme is ${getThemeDisplayName(gameTheme)}.`
          : `לא ניתן להצטרף לחדר עם נושא שונה. הנושא הנוכחי שלך הוא ${getThemeDisplayName(gameTheme)}.`);
      } else {
        setError(data.message);
      }
      
      setTimeout(() => {
        setError("");
      }, 3000);
    });
  }, [socket, loadRooms, connectionAttempts, gameTheme, setGamePhase, setMultiplayerData, setGameTheme, language, getThemeDisplayName]);

  // Check connection status on mount
  useEffect(() => {
    setIsConnected(socket.isConnected());
    
    if (!socket.isConnected()) {
      socket.connect();
    }
  }, [socket]);

  // Updated handleCreateRoom to use playerNameRef
  const handleCreateRoom = useCallback(() => {
    // Get current value from ref
    const currentName = playerNameRef.current.trim();
    
    if (!currentName) {
      setError(language === "en" ? "Please enter your name" : "אנא הזן את שמך");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    socket.createRoom({ 
      playerName: currentName, 
      difficulty, 
      gameTheme 
    });
  }, [socket, difficulty, gameTheme, language]);

  // Updated handleJoinRoom to use playerNameRef and updated theme names
  const handleJoinRoom = useCallback((roomId, roomTheme) => {
    // Get current value from ref
    const currentName = playerNameRef.current.trim();
    
    if (!currentName) {
      setError(language === "en" ? "Please enter your name" : "אנא הזן את שמך");
      return;
    }
    
    // Check if room theme matches current theme
    if (roomTheme && roomTheme !== gameTheme) {
      const themeMessage = language === "en" 
        ? `Cannot join room with different theme (${getThemeDisplayName(roomTheme)}). Your current theme is ${getThemeDisplayName(gameTheme)}.`
        : `לא ניתן להצטרף לחדר עם נושא שונה (${getThemeDisplayName(roomTheme)}). הנושא הנוכחי שלך הוא ${getThemeDisplayName(gameTheme)}.`;
      setError(themeMessage);
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    socket.joinRoom({ 
      roomId, 
      playerName: currentName, 
      gameTheme 
    });
  }, [socket, gameTheme, language, getThemeDisplayName]);
  
  // Handle joining by room code
  const handleJoinByCode = useCallback(() => {
    // Get current value from ref
    const currentName = playerNameRef.current.trim();
    
    if (!currentName) {
      setError(language === "en" ? "Please enter your name" : "אנא הזן את שמך");
      return;
    }
    
    if (!roomCode.trim()) {
      setError(language === "en" ? "Please enter a room code" : "אנא הזן קוד חדר");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    // First check if the room exists and has a compatible theme
    const matchingRoom = availableRooms.find(room => 
      room.roomId.toUpperCase() === roomCode.trim().toUpperCase()
    );
    
    // If we found the room in available rooms, check theme compatibility
    if (matchingRoom && matchingRoom.gameTheme && matchingRoom.gameTheme !== gameTheme) {
      setIsLoading(false);
      const themeMessage = language === "en" 
        ? `Cannot join room with different theme (${getThemeDisplayName(matchingRoom.gameTheme)}). Your current theme is ${getThemeDisplayName(gameTheme)}.`
        : `לא ניתן להצטרף לחדר עם נושא שונה (${getThemeDisplayName(matchingRoom.gameTheme)}). הנושא הנוכחי שלך הוא ${getThemeDisplayName(gameTheme)}.`;
      setError(themeMessage);
      return;
    }
    
    // Proceed with join
    socket.joinRoom({ 
      roomId: roomCode.trim().toUpperCase(), 
      playerName: currentName,
      gameTheme 
    });
  }, [socket, roomCode, gameTheme, availableRooms, language, getThemeDisplayName]);

  // Add room theme indicator function with updated theme colors
  const getRoomThemeIndicator = useCallback((roomTheme) => {
    return (
      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs text-white 
        ${roomTheme === 'animals' ? 'bg-green-600' : 'bg-blue-600'}`}>
        {getLocalizedText("cardInitials")}
      </span>
    );
  }, [getLocalizedText]);

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
    // Reset socket state
    socket.resetState();
    setGamePhase("intro");
  }, [socket, setGamePhase]);

  return (
    <div className={`text-center max-w-md mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <h1 className={`text-2xl font-bold ${currentTheme.title} mb-4`}>{getLocalizedText("onlinePlay")}</h1>
        
        {/* Current theme indicator */}
        <div className="mb-4 flex items-center justify-center">
          <span className={`px-2 py-1 rounded-full text-xs text-white ${
            gameTheme === 'animals' ? 'bg-green-600' : 'bg-blue-600'
          }`}>
            {getLocalizedText("themeTitle")}
          </span>
        </div>
        
        {/* Connection status - UPDATED */}
        {!isConnected && (
          <div className="mb-4 py-2 px-3 bg-yellow-600/30 border border-yellow-600 text-yellow-200 rounded-lg text-sm flex items-center justify-between">
            <div>
              {isLoading ? 
                (language === "en" ? "Connecting to server..." : "מתחבר לשרת...") : 
                (language === "en" ? "Not connected to server." : "לא מחובר לשרת.")}
            </div>
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-yellow-200 rounded-full animate-spin"></div>
            ) : (
              <button 
                onClick={() => {
                  setIsLoading(true);
                  socket.connect();
                }} 
                className="underline hover:text-white"
              >
                {language === "en" ? "Retry" : "נסה שוב"}
              </button>
            )}
          </div>
        )}
        
        {/* Player name input - wrapped in form to prevent default submission */}
        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-300 mb-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
            {getLocalizedText("enterYourName")}
          </label>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              dir={language === "en" ? "ltr" : "rtl"}
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`w-full bg-gray-700/70 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none ${currentTheme.inputFocus}`}
              placeholder={getLocalizedText("enterYourName")}
              maxLength={15}
            />
          </form>
        </div>
        
        {/* Tabs */}
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 rounded-l-lg transition ${tab === 'join' ? currentTheme.tabActive : currentTheme.tabInactive}`}
            onClick={() => setTab('join')}
          >
            {getLocalizedText("joinRoom")}
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg transition ${tab === 'create' ? currentTheme.tabActive : currentTheme.tabInactive}`}
            onClick={() => setTab('create')}
          >
            {getLocalizedText("createRoom")}
          </button>
        </div>
        
        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 py-2 px-3 bg-red-500/20 border border-red-500 text-red-200 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'join' ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Room code join */}
              <div className="mb-4">
                <div className="flex space-x-2 gap-x-2">
                  <input
                    dir={language === "en" ? "ltr" : "rtl"}
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className={`flex-1 bg-gray-700/70 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none ${currentTheme.inputFocus} uppercase`}
                    placeholder={getLocalizedText("enterRoomCode")}
                    maxLength={6}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-r ${currentTheme.buttonGradient} px-3 py-2 rounded-lg text-white font-medium flex items-center justify-center`}
                    onClick={handleJoinByCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2">{language === "en" ? "Joining..." : "מצטרף..."}</span>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      </>
                    ) : (
                      getLocalizedText("joinRoom")
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Available rooms */}
              <div>
                <div
                  dir={language === "en" ? "ltr" : "rtl"}
                  className="flex justify-between items-center mb-2"
                >
                  <h3 className={`text-lg font-medium ${currentTheme.subtitle}`}>
                    {getLocalizedText("availableRooms")}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadRooms}
                    disabled={isLoading}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-1">{language === "en" ? "Loading..." : "טוען..."}</span>
                        <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      </>
                    ) : (
                      (language === "en" ? "Refresh" : "רענן")
                    )}
                  </motion.button>
                </div>
                
               
                <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                  {availableRooms.length === 0 ? (
                    <div className="text-gray-400 py-8 text-center text-sm flex flex-col items-center justify-center">
                      {isLoading ? (
                        <>
                          <div className="w-6 h-6 border-2 border-t-transparent border-gray-400 rounded-full animate-spin mb-2"></div>
                          <span>{language === "en" ? "Loading rooms..." : "טוען חדרים..."}</span>
                        </>
                      ) : (
                        getLocalizedText("noRoomsAvailable")
                      )}
                    </div>
                  ) : (
                    availableRooms.map((room) => (
                      <motion.div
                        key={room.roomId}
                        whileHover={{ scale: 1.02 }}
                        className={`${currentTheme.roomCardBg} ${currentTheme.roomCardHover} rounded-lg p-3 transition cursor-pointer`}
                        onClick={() => handleJoinRoom(room.roomId, room.gameTheme)}
                      >
                        <div className="flex justify-between items-center">
                          <div className={`${language === 'he' ? 'text-right' : 'text-left'}`}>
                            <div className="font-medium text-white flex items-center">
                              {language === "en" ? 
                                `${room.hostName}'s Game` : 
                                `המשחק של ${room.hostName}`}
                              {room.gameTheme && getRoomThemeIndicator(room.gameTheme)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getLocalizedText("room")}: {room.roomId} • {room.playerCount}/{room.maxPlayers} {getLocalizedText("players", "common")}
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${
                              room.difficulty === 'easy' ? currentTheme.difficultyEasy :
                              room.difficulty === 'medium' ? currentTheme.difficultyMedium :
                              currentTheme.difficultyHard
                            }`}>
                              {getLocalizedText(room.difficulty, "common")}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <label className={`block text-sm font-medium text-gray-300 mb-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
                  {getLocalizedText("difficulty")}
                </label>
                <div
                  dir={language === "en" ? "ltr" : "rtl"}
                  className="grid grid-cols-3 gap-2"
                >
                  {['easy', 'medium', 'hard'].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-2 px-2 rounded-lg text-sm font-semibold uppercase transition ${
                        difficulty === level
                          ? level === 'easy' 
                            ? 'bg-green-600 text-white' 
                            : level === 'medium' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setDifficulty(level)}
                    >
                      {getLocalizedText(level, "common")}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full mt-4 bg-gradient-to-r ${currentTheme.buttonGradient} py-3 rounded-lg text-white font-medium text-lg flex items-center justify-center`}
                onClick={handleCreateRoom}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">{language === "en" ? "Creating Room..." : "יוצר חדר..."}</span>
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  </>
                ) : (
                  getLocalizedText("createRoom")
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Back button */}
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-300 hover:text-white"
            onClick={handleBackToMenu}
          >
            {getLocalizedText("buttonBack")}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnlineLobby;