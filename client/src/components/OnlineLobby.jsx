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

  // Theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-orange-500/20 border-white/20",
      title: "text-red-400",
      subtitle: "text-yellow-400",
      tabActive: "bg-orange-600 text-white",
      tabInactive: "bg-gray-800 text-gray-300 hover:bg-gray-700",
      buttonGradient: "from-orange-500 to-orange-600",
      inputFocus: "focus:ring-orange-400 focus:border-orange-400",
      roomCardBg: "bg-gray-800/60",
      roomCardHover: "hover:bg-gray-700/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-orange-600",
      difficultyHard: "bg-red-600",
    },
    pokemon: {
      container: "bg-blue-500/20 border-white/20",
      title: "text-blue-400",
      subtitle: "text-yellow-400",
      tabActive: "bg-blue-600 text-white",
      tabInactive: "bg-gray-800 text-gray-300 hover:bg-gray-700",
      buttonGradient: "from-blue-500 to-yellow-500",
      inputFocus: "focus:ring-blue-400 focus:border-blue-400",
      roomCardBg: "bg-blue-900/60",
      roomCardHover: "hover:bg-blue-800/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-blue-600",
      difficultyHard: "bg-red-600",
    }
  };

  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;
  
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
          ? `Cannot join room with different theme. Your current theme is ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}.`
          : `לא ניתן להצטרף לחדר עם נושא שונה. הנושא הנוכחי שלך הוא ${gameTheme === 'dragonball' ? 'דרגון בול' : 'פוקימון'}.`);
      } else {
        setError(data.message);
      }
      
      setTimeout(() => {
        setError("");
      }, 3000);
    });
  }, [socket, loadRooms, connectionAttempts, gameTheme, setGamePhase, setMultiplayerData, setGameTheme, language]);

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

  // Updated handleJoinRoom to use playerNameRef
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
        ? `Cannot join room with different theme (${roomTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}). Your current theme is ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}.`
        : `לא ניתן להצטרף לחדר עם נושא שונה (${roomTheme === 'dragonball' ? 'דרגון בול' : 'פוקימון'}). הנושא הנוכחי שלך הוא ${gameTheme === 'dragonball' ? 'דרגון בול' : 'פוקימון'}.`;
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
  }, [socket, gameTheme, language]);
  
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
        ? `Cannot join room with different theme (${matchingRoom.gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}). Your current theme is ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}.`
        : `לא ניתן להצטרף לחדר עם נושא שונה (${matchingRoom.gameTheme === 'dragonball' ? 'דרגון בול' : 'פוקימון'}). הנושא הנוכחי שלך הוא ${gameTheme === 'dragonball' ? 'דרגון בול' : 'פוקימון'}.`;
      setError(themeMessage);
      return;
    }
    
    // Proceed with join
    socket.joinRoom({ 
      roomId: roomCode.trim().toUpperCase(), 
      playerName: currentName,
      gameTheme 
    });
  }, [socket, roomCode, gameTheme, availableRooms, language]);

  // Add room theme indicator function
  const getRoomThemeIndicator = useCallback((roomTheme) => {
    return (
      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs text-white 
        ${roomTheme === 'dragonball' ? 'bg-orange-600' : 'bg-blue-600'}`}>
        {roomTheme === 'dragonball' ? getText(roomTheme, language, "cardInitials") : getText(roomTheme, language, "cardInitials")}
      </span>
    );
  }, [language]);

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
        <h1 className={`text-2xl font-bold ${currentTheme.title} mb-4`}>{getText(gameTheme, language, "onlinePlay")}</h1>
        
        {/* Current theme indicator */}
        <div className="mb-4 flex items-center justify-center">
          <span className={`px-2 py-1 rounded-full text-xs text-white ${
            gameTheme === 'dragonball' ? 'bg-orange-600' : 'bg-blue-600'
          }`}>
            {getText(gameTheme, language, "themeTitle")}
          </span>
        </div>
        
        {/* Connection status */}
        {!isConnected && !isLoading && (
          <div className="mb-4 py-2 px-3 bg-yellow-600/30 border border-yellow-600 text-yellow-200 rounded-lg text-sm">
            {language === "en" ? "Not connected to server." : "לא מחובר לשרת."}
            <button 
              onClick={() => socket.connect()} 
              className="mr-2 underline hover:text-white"
            >
              {language === "en" ? "Retry" : "נסה שוב"}
            </button>
          </div>
        )}
        
        {/* Player name input - wrapped in form to prevent default submission */}
        <div className="mb-4">
          <label className={`block text-sm font-medium text-gray-300 mb-1 ${language === 'he' ? 'text-right' : 'text-left'}`}>
            {getText(gameTheme, language, "enterYourName")}
          </label>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
            dir={language === "en" ? "ltr" : "rtl"}
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`w-full bg-gray-700/70 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none ${currentTheme.inputFocus}`}
              placeholder={getText(gameTheme, language, "enterYourName")}
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
            {getText(gameTheme, language, "joinRoom")}
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg transition ${tab === 'create' ? currentTheme.tabActive : currentTheme.tabInactive}`}
            onClick={() => setTab('create')}
          >
            {getText(gameTheme, language, "createRoom")}
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
                    placeholder={getText(gameTheme, language, "enterRoomCode")}
                    maxLength={6}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-r ${currentTheme.buttonGradient} px-3 py-2 rounded-lg text-white font-medium`}
                    onClick={handleJoinByCode}
                    disabled={isLoading}
                  >
                    {isLoading ? 
                      (language === "en" ? "Joining..." : "מצטרף...") : 
                      getText(gameTheme, language, "joinRoom")}
                  </motion.button>
                </div>
              </div>
              
              {/* Available rooms */}
              <div>
                <div
                dir={language === "en" ? "ltr" : "rtl"}
                className="flex justify-between items-center mb-2">
                  <h3 className={`text-lg font-medium ${currentTheme.subtitle}`}>
                    {getText(gameTheme, language, "availableRooms")}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadRooms}
                    disabled={isLoading}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white"
                  >
                    {isLoading ? 
                      (language === "en" ? "Loading..." : "טוען...") : 
                      (language === "en" ? "Refresh" : "רענן")}
                  </motion.button>
                </div>
                
               
                <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                  {availableRooms.length === 0 ? (
                    <div className="text-gray-400 py-8 text-center text-sm">
                      {isLoading ? 
                        (language === "en" ? "Loading rooms..." : "טוען חדרים...") : 
                        getText(gameTheme, language, "noRoomsAvailable")}
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
                              {getText(gameTheme, language, "room")}: {room.roomId} • {room.playerCount}/{room.maxPlayers} {getText(gameTheme, language, "players", "common")}
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${
                              room.difficulty === 'easy' ? currentTheme.difficultyEasy :
                              room.difficulty === 'medium' ? currentTheme.difficultyMedium :
                              currentTheme.difficultyHard
                            }`}>
                              {getText(gameTheme, language, room.difficulty, "common")}
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
                  {getText(gameTheme, language, "difficulty")}
                </label>
                <div
                dir={language === "en" ? "ltr" : "rtl"}
                className="grid grid-cols-3 gap-2">
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
                              ? 'bg-orange-600 text-white' 
                              : 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      onClick={() => setDifficulty(level)}
                    >
                      {getText(gameTheme, language, level, "common")}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full mt-4 bg-gradient-to-r ${currentTheme.buttonGradient} py-3 rounded-lg text-white font-medium text-lg`}
                onClick={handleCreateRoom}
                disabled={isLoading}
              >
                {isLoading ? 
                  (language === "en" ? "Creating Room..." : "יוצר חדר...") : 
                  getText(gameTheme, language, "createRoom")}
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
            {getText(gameTheme, language, "buttonBack")}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnlineLobby;