import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socketService from "../services/socketService";

const OnlineLobby = ({ 
  gameTheme, 
  difficulty, 
  setDifficulty, 
  setGamePhase, 
  setMultiplayerData,
  setGameTheme
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

  // Clean up listeners - using a function outside of a hook to avoid dependency issues
  const cleanupSocketListeners = useCallback(() => {
    socketService.on("roomList", null);
    socketService.on("roomCreated", null);
    socketService.on("roomJoined", null);
    socketService.on("roomError", null);
    socketService.on("connect", null);
    socketService.on("connect_error", null);
  }, []);

  // Reset state function - IMPORTANT: must be defined before any function that uses it
  const resetState = useCallback(() => {
    // Reset all relevant state in OnlineLobby
    setPlayerName("");
    setRoomCode("");
    setTab("join");
    setError("");
    setIsLoading(false);
    setAvailableRooms([]);
    setConnectionAttempts(0);
    
    // Reset the ref value
    playerNameRef.current = "";

    // Clean up socket listeners
    cleanupSocketListeners();
    
    // Optionally disconnect socket if you want to fully reset connections
    // socketService.disconnect();
  }, [cleanupSocketListeners]);

  // Function to load rooms - no dependencies
  const loadRoomsBase = useCallback(() => {
    setIsLoading(true);
    setError("");
    
    if (socketService.isConnected()) {
      socketService.getRooms();
    } else {
      setIsLoading(false);
      setError("Could not connect to server");
    }
  }, []);

  // Setup socket event listeners - now using playerNameRef instead of playerName
  const setupSocketListeners = useCallback(() => {
    socketService.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      setIsLoading(false);
      loadRoomsBase();
    });
    
    socketService.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
      setIsLoading(false);
      setError("Could not connect to server. Retrying...");
      
      if (connectionAttempts < 3) {
        setTimeout(() => {
          setConnectionAttempts(prev => prev + 1);
        }, 2000);
      }
    });
    
    socketService.on("roomList", (data) => {
      console.log("Room list received:", data);
      
      const filteredRooms = data.rooms.filter(room => 
        room.gameTheme === gameTheme
      );
      
      console.log(`Filtered ${data.rooms.length} rooms to ${filteredRooms.length} matching theme: ${gameTheme}`);
      
      setAvailableRooms(filteredRooms);
      setIsLoading(false);
    });
    
    socketService.on("roomCreated", (roomData) => {
      console.log("Room created:", roomData);
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
    
    socketService.on("roomJoined", (roomData) => {
      console.log("Room joined:", roomData);
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
    
    socketService.on("roomError", (data) => {
      console.error("Room error:", data);
      setIsLoading(false);
      
      // Handle theme compatibility error specifically
      if (data.message && data.message.includes("theme")) {
        setError(`Cannot join room with different theme. Your current theme is ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}.`);
      } else {
        setError(data.message);
      }
      
      setTimeout(() => {
        setError("");
      }, 3000);
    });
  }, [connectionAttempts, gameTheme, setGamePhase, setMultiplayerData, setGameTheme, loadRoomsBase]);

  // Connect to socket with useCallback
  const connectSocket = useCallback(() => {
    socketService.connect();
    setIsLoading(true);
    
    // Clear any existing listeners first
    cleanupSocketListeners();
    
    // Setup listeners
    setupSocketListeners();
  }, [cleanupSocketListeners, setupSocketListeners]);

  // Ensure socket connection and setup event listeners when component mounts
  useEffect(() => {
    // Connect to socket server
    connectSocket();

    return () => {
      // Clean up listeners but keep connection
      cleanupSocketListeners();
    };
  }, [connectSocket, cleanupSocketListeners]);

  // Wrap loadRooms in useCallback
  const loadRooms = useCallback(() => {
    if (!socketService.isConnected()) {
      connectSocket();
      setTimeout(() => {
        loadRoomsBase();
      }, 1000);
    } else {
      loadRoomsBase();
    }
  }, [connectSocket, loadRoomsBase]);

  // Updated handleCreateRoom to use playerNameRef instead of playerName
  const handleCreateRoom = useCallback(() => {
    // Get current value from ref
    const currentName = playerNameRef.current.trim();
    
    if (!currentName) {
      setError("Please enter your name");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    if (!socketService.isConnected()) {
      connectSocket();
      setTimeout(() => {
        if (socketService.isConnected()) {
          socketService.createRoom({ 
            playerName: currentName, 
            difficulty, 
            gameTheme 
          });
        } else {
          setIsLoading(false);
          setError("Could not connect to server");
        }
      }, 1000);
    } else {
      socketService.createRoom({ 
        playerName: currentName, 
        difficulty, 
        gameTheme 
      });
    }
  }, [difficulty, gameTheme, connectSocket, setError]);

  // Updated handleJoinRoom to use playerNameRef instead of playerName
  const handleJoinRoom = useCallback((roomId, roomTheme) => {
    // Get current value from ref
    const currentName = playerNameRef.current.trim();
    
    if (!currentName) {
      setError("Please enter your name");
      return;
    }
    
    // Check if room theme matches current theme
    if (roomTheme && roomTheme !== gameTheme) {
      setError(`Cannot join room with different theme (${roomTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}). Your current theme is ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}.`);
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    if (!socketService.isConnected()) {
      connectSocket();
      setTimeout(() => {
        if (socketService.isConnected()) {
          socketService.joinRoom({ 
            roomId, 
            playerName: currentName, 
            gameTheme 
          });
        } else {
          setIsLoading(false);
          setError("Could not connect to server");
        }
      }, 1000);
    } else {
      socketService.joinRoom({ 
        roomId, 
        playerName: currentName, 
        gameTheme 
      });
    }
  }, [gameTheme, connectSocket, setError]);
  
  // Updated handleJoinByCode to use playerNameRef instead of playerName and check theme
  const handleJoinByCode = useCallback(() => {
    // Get current value from ref
    const currentName = playerNameRef.current.trim();
    
    if (!currentName) {
      setError("Please enter your name");
      return;
    }
    
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    // First check if the room exists and has a compatible theme
    if (socketService.isConnected()) {
      // Check available rooms first (if any exist)
      const matchingRoom = availableRooms.find(room => 
        room.roomId.toUpperCase() === roomCode.trim().toUpperCase()
      );
      
      // If we found the room in available rooms, check theme compatibility
      if (matchingRoom && matchingRoom.gameTheme && matchingRoom.gameTheme !== gameTheme) {
        setIsLoading(false);
        setError(`Cannot join room with different theme (${matchingRoom.gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}). Your current theme is ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}.`);
        return;
      }
      
      // Proceed with join if theme is compatible or room wasn't found in list
      socketService.joinRoom({ 
        roomId: roomCode.trim().toUpperCase(), 
        playerName: currentName,
        gameTheme 
      });
    } else {
      // Try to connect first
      connectSocket();
      setTimeout(() => {
        if (socketService.isConnected()) {
          socketService.joinRoom({ 
            roomId: roomCode.trim().toUpperCase(), 
            playerName: currentName,
            gameTheme 
          });
        } else {
          setIsLoading(false);
          setError("Could not connect to server");
        }
      }, 1000);
    }
  }, [roomCode, connectSocket, setError, gameTheme, availableRooms]);

  // Add room theme indicator function
  const getRoomThemeIndicator = useCallback((roomTheme) => {
    return (
      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs text-white 
        ${roomTheme === 'dragonball' ? 'bg-orange-600' : 'bg-blue-600'}`}>
        {roomTheme === 'dragonball' ? 'DB' : 'PK'}
      </span>
    );
  }, []);

  return (
    <div className={`text-center max-w-md mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden`}>
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <h1 className={`text-2xl font-bold ${currentTheme.title} mb-4`}>Online Multiplayer</h1>
        
        {/* Current theme indicator */}
        <div className="mb-4 flex items-center justify-center">
          <span className="text-sm text-gray-300 mr-2">Your Theme:</span>
          <span className={`px-2 py-1 rounded-full text-xs text-white ${
            gameTheme === 'dragonball' ? 'bg-orange-600' : 'bg-blue-600'
          }`}>
            {gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'}
          </span>
        </div>
        
        {/* Connection status */}
        {!isConnected && !isLoading && (
          <div className="mb-4 py-2 px-3 bg-yellow-600/30 border border-yellow-600 text-yellow-200 rounded-lg text-sm">
            Not connected to server. 
            <button 
              onClick={connectSocket} 
              className="ml-2 underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}
        
        {/* Player name input - wrapped in form to prevent default submission */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1 text-left">Your Name</label>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className={`w-full bg-gray-700/70 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none ${currentTheme.inputFocus}`}
              placeholder="Enter your name"
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
            Join Game
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg transition ${tab === 'create' ? currentTheme.tabActive : currentTheme.tabInactive}`}
            onClick={() => setTab('create')}
          >
            Create Game
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
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className={`flex-1 bg-gray-700/70 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none ${currentTheme.inputFocus} uppercase`}
                    placeholder="Enter room code"
                    maxLength={6}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`bg-gradient-to-r ${currentTheme.buttonGradient} px-3 py-2 rounded-lg text-white font-medium`}
                    onClick={handleJoinByCode}
                    disabled={isLoading}
                  >
                    {isLoading ? "Joining..." : "Join"}
                  </motion.button>
                </div>
              </div>
              
              {/* Available rooms */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className={`text-lg font-medium ${currentTheme.subtitle}`}>Available Rooms</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadRooms}
                    disabled={isLoading}
                    className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white"
                  >
                    {isLoading ? "Loading..." : "Refresh"}
                  </motion.button>
                </div>
                
                {/* Showing only matching theme rooms info */}
                <div className="text-xs text-gray-300 mb-2">
                  Showing only rooms with {gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'} theme
                </div>
                
                <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                  {availableRooms.length === 0 ? (
                    <div className="text-gray-400 py-8 text-center text-sm">
                      {isLoading ? "Loading rooms..." : `No ${gameTheme === 'dragonball' ? 'Dragon Ball' : 'Pokémon'} rooms available. Create one!`}
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
                          <div className="text-left">
                            <div className="font-medium text-white flex items-center">
                              {room.hostName}'s Game
                              {room.gameTheme && getRoomThemeIndicator(room.gameTheme)}
                            </div>
                            <div className="text-xs text-gray-400">
                              Room: {room.roomId} • {room.playerCount}/{room.maxPlayers} players
                            </div>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs text-white ${
                              room.difficulty === 'easy' ? currentTheme.difficultyEasy :
                              room.difficulty === 'medium' ? currentTheme.difficultyMedium :
                              currentTheme.difficultyHard
                            }`}>
                              {room.difficulty}
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
                <label className="block text-sm font-medium text-gray-300 mb-1 text-left">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
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
                      {level}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full bg-gradient-to-r ${currentTheme.buttonGradient} py-3 rounded-lg text-white font-medium text-lg`}
                onClick={handleCreateRoom}
                disabled={isLoading}
              >
                {isLoading ? "Creating Room..." : "Create Room"}
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
            onClick={() => {
              resetState();
              setGamePhase("intro");
            }}
          >
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnlineLobby;