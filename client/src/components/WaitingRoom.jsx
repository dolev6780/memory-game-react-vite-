import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSocket from "../hooks/useSocket";
import { dragonballCharacters, pokemonCharacters } from "../constants";
import { v4 as uuidv4 } from "uuid";

const WaitingRoom = ({ 
  multiplayerData, 
  setGamePhase, 
  gameTheme, 
  setGameTheme,
  difficulty,
  setDifficulty,
  setCards,
  setMatchedPairs,
  setFlippedIndices, 
  setPlayerScores,
  setCurrentPlayer,
  setPlayerNames,
  setMatchedBy,
  setShowPlayerTurn
}) => {
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState(multiplayerData.players || []);
  const [roomId, setRoomId] = useState(multiplayerData.roomId || "");
  const [isHost, setIsHost] = useState(multiplayerData.isHost || false);
  const [countdown, setCountdown] = useState(null);
  const [notification, setNotification] = useState(null);
  const [generatedCards, setGeneratedCards] = useState(null);
  
  // Add ref for chat container scrolling
  const chatContainerRef = useRef(null);
  
  // Initialize the socket hook with a unique component ID
  const socket = useSocket("WaitingRoom", true);
  
  // Theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-orange-500/20 border-white/20",
      title: "text-red-400",
      subtitle: "text-yellow-400",
      buttonGradient: "from-orange-500 to-orange-600",
      buttonGlow: "rgba(255, 160, 0, 0.5)",
      playerCardBg: "bg-gray-800/60",
      playerCardHost: "bg-orange-900/60",
      messageAuthor: "text-orange-400",
      messageContent: "text-gray-300",
      inputFocus: "focus:ring-orange-400 focus:border-orange-400",
    },
    pokemon: {
      container: "bg-blue-500/20 border-white/20",
      title: "text-blue-400",
      subtitle: "text-yellow-400",
      buttonGradient: "from-blue-500 to-yellow-500",
      buttonGlow: "rgba(96, 165, 250, 0.5)",
      playerCardBg: "bg-gray-800/60",
      playerCardHost: "bg-blue-900/60",
      messageAuthor: "text-blue-400",
      messageContent: "text-gray-300",
      inputFocus: "focus:ring-blue-400 focus:border-blue-400",
    }
  };

  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  // Memoize showNotification function
  const showNotification = useCallback((message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Copy room code function
  const copyRoomCode = useCallback(() => {
    navigator.clipboard.writeText(roomId)
      .then(() => {
        showNotification("Room code copied to clipboard!");
      })
      .catch(err => {
        console.error("Could not copy room code:", err);
      });
  }, [roomId, showNotification]);

  // Now define handleLeaveRoom which uses resetState
  const handleLeaveRoom = useCallback(() => {
    socket.leaveRoom({
      roomId
    });
    setGamePhase("online_lobby");
  }, [roomId, setGamePhase, socket]);

  // Memoize initializeGame function
  const initializeGame = useCallback(() => {
    // Reset game state
    setMatchedPairs([]);
    setFlippedIndices([]);
    setMatchedBy({});
    
    // Set player information
    setPlayerScores(players.map(player => ({
      id: player.id,
      name: player.name,
      score: 0,
      moves: 0
    })));
    
    setPlayerNames(players.map(player => player.name));
    
    // Set first player's turn
    setCurrentPlayer(0);
    setShowPlayerTurn(true);
    
    // Move to game board
    setGamePhase("game_board");
  }, [
    players, 
    setMatchedPairs, 
    setFlippedIndices, 
    setMatchedBy, 
    setPlayerScores, 
    setPlayerNames, 
    setCurrentPlayer, 
    setShowPlayerTurn, 
    setGamePhase
  ]);

  // Memoize startCountdown function
  const startCountdown = useCallback(() => {
    setCountdown(3);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          initializeGame();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clear interval on cleanup
    return () => clearInterval(interval);
  }, [initializeGame]);

  const handleStartGame = useCallback(() => {
    // Generate shuffled cards
    const characterSet = gameTheme === "dragonball" ? dragonballCharacters : pokemonCharacters;
    
    // Determine number of pairs based on difficulty
    let numPairs;
    let layoutConfig = {}; // Add layout configuration
    
    switch(difficulty) {
      case "easy":
        numPairs = 6;
        layoutConfig = { cols: 4, rows: 3 }; // 3x4 grid for easy
        break;
      case "medium":
        numPairs = 10;
        layoutConfig = { cols: 5, rows: 4 }; // 5x4 grid for medium
        break;
      case "hard":
        numPairs = 15;
        layoutConfig = { cols: 6, rows: 5 }; // 6x5 grid for hard
        break;
      default:
        numPairs = 10;
        layoutConfig = { cols: 5, rows: 4 };
    }
    
    console.log(`Starting game with difficulty: ${difficulty}, pairs: ${numPairs}, layout: ${layoutConfig.cols}x${layoutConfig.rows}`);
    
    // Shuffle characters and select pairs
    const shuffledCharacters = [...characterSet].sort(() => Math.random() - 0.5);
    const selectedCharacters = shuffledCharacters.slice(0, numPairs);
    
    // Create card pairs with unique IDs AND theme information
    const cardPairs = selectedCharacters.flatMap((character) => [
      { ...character, uniqueId: uuidv4(), cardTheme: gameTheme },
      { ...character, uniqueId: uuidv4(), cardTheme: gameTheme },
    ]);
    
    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    // Store the generated cards
    setGeneratedCards(shuffledCards);
    
    // Tell server to start game with these cards, theme, and layout configuration
    socket.startGame({
      roomId,
      cards: shuffledCards,
      gameTheme: gameTheme,
      difficulty: difficulty,
      layoutConfig: layoutConfig // Send layout configuration to server
    });
  }, [difficulty, gameTheme, roomId, socket]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    
    if (!chatMessage.trim()) return;
    
    socket.sendMessage({
      roomId,
      message: chatMessage
    });
    setChatMessage("");
  }, [chatMessage, roomId, socket]);

  // Enforce theme synchronization with the room
  useEffect(() => {
    // If multiplayerData has a theme and it's different from current theme
    if (multiplayerData.gameTheme && multiplayerData.gameTheme !== gameTheme) {
      // Update the local game theme to match the room's theme
      console.log(`Enforcing room theme: ${gameTheme} -> ${multiplayerData.gameTheme}`);
      setGameTheme(multiplayerData.gameTheme);
    }
  }, [multiplayerData.gameTheme, gameTheme, setGameTheme]);

  // Effect to scroll chat to bottom when messages change
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Set up socket event listeners
  useEffect(() => {
    // Update initial state from multiplayerData
    if (multiplayerData.players) {
      setPlayers(multiplayerData.players);
    }
    
    // Set up event listeners
    socket.addEventListener("playerJoined", (data) => {
      console.log("Player joined:", data);
      setPlayers(data.players);
      showNotification(`${data.message}`);
    });
    
    socket.addEventListener("playerLeft", (data) => {
      console.log("Player left:", data);
      setPlayers(data.players);
      showNotification(`${data.message}`);
      
      // If we're not the host, check if we became the host
      if (!isHost && data.players.find(p => p.id === socket.socket?.id)?.isHost) {
        setIsHost(true);
        showNotification("You are now the host!");
      }
    });
    
    socket.addEventListener("newMessage", (data) => {
      console.log("New message received:", data);
      setMessages(prev => [...prev, data.message]);
    });
    
    socket.addEventListener("gameStarted", (data) => {
      console.log("Game started event received:", data);
      
      // If the server includes a theme, ensure we're using it
      if (data.gameTheme && data.gameTheme !== gameTheme) {
        console.log(`Updating theme to: ${data.gameTheme}`);
        setGameTheme(data.gameTheme);
      }
      
      // Use the card arrangement from the server
      if (data.gameState && data.gameState.cards) {
        // Ensure all cards have theme information
        const themedCards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: data.gameTheme || gameTheme
        }));
        
        setCards(themedCards);
        
        // Clear any locally generated cards to avoid confusion
        if (generatedCards) {
          setGeneratedCards(null);
        }
      }
      
      // Update difficulty if provided by server
      if (data.difficulty && data.difficulty !== difficulty) {
        console.log(`Updating difficulty: ${difficulty} -> ${data.difficulty}`);
        setDifficulty(data.difficulty);
      }
      
      startCountdown();
    });
    
    socket.addEventListener("gameReset", (data) => {
      // Reset local state
      setPlayers(data.players);
      showNotification("Game has been reset. Ready for a new game!");
    });
  }, [
    socket,
    multiplayerData, 
    isHost, 
    setCards, 
    startCountdown, 
    showNotification, 
    gameTheme, 
    setGameTheme, 
    difficulty, 
    setDifficulty,
    generatedCards
  ]);

  return (
    <div className={`text-center max-w-4xl mx-auto p-4 ${currentTheme.container} rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden`}>
      <div className="absolute -inset-full top-0 left-0 h-64 w-96 bg-white/10 rotate-45 transform translate-x-2/3 translate-y-1/3 z-0 opacity-50"></div>
      <div className="absolute -inset-full top-0 left-0 h-32 w-64 bg-white/5 rotate-12 transform -translate-x-1/3 -translate-y-2/3 z-0"></div>
      
      {/* Game starting countdown overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1.2 }}
              transition={{ duration: 0.5 }}
              className="text-7xl font-bold text-white"
            >
              {countdown}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-40"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className={`text-2xl font-bold ${currentTheme.title}`}>Waiting Room</h1>
          <div className="flex items-center space-x-2">
            {/* Room code with copy button */}
            <div className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-white flex items-center">
              <span className="mr-2">Room: <span className="font-mono font-bold">{roomId}</span></span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyRoomCode}
                className="text-gray-400 hover:text-white"
                title="Copy room code"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </motion.button>
              {/* Theme indicator */}
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs text-white ${
                gameTheme === 'dragonball' ? 'bg-orange-600' : 'bg-blue-600'
              }`}>
                {gameTheme === 'dragonball' ? 'DB' : 'PK'}
              </span>
            </div>
            
            <div className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-white">
              <span className="text-xs">{players.length}/4 players</span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white"
              onClick={handleLeaveRoom}
            >
              Leave
            </motion.button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Players list */}
          <div className="md:col-span-1">
            <h2 className={`text-lg font-bold ${currentTheme.subtitle} mb-2 text-left`}>Players ({players.length}/4)</h2>
            <div className="space-y-2">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg ${player.isHost ? currentTheme.playerCardHost : currentTheme.playerCardBg}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-3 text-left">
                      <div className="font-medium text-white">{player.name}</div>
                      <div className="text-xs text-gray-400">
                        {player.isHost ? "Host" : "Player"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Difficulty selector for host */}
            {isHost && (
              <div className="mt-4 mb-2">
                <h3 className={`text-sm font-medium ${currentTheme.subtitle} mb-2 text-left`}>Difficulty</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`py-1 px-2 rounded-lg text-xs font-semibold uppercase transition ${
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
            )}
            
            {/* Show difficulty for non-hosts */}
            {!isHost && (
              <div className="mt-4 mb-2 text-left">
                <span className="text-sm text-gray-400">Difficulty: </span>
                <span className={`px-2 py-0.5 rounded-full text-xs text-white ${
                  difficulty === 'easy' 
                    ? 'bg-green-600' 
                    : difficulty === 'medium' 
                      ? 'bg-orange-600' 
                      : 'bg-red-600'
                }`}>
                  {difficulty}
                </span>
              </div>
            )}
            
            {isHost && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full mt-4 bg-gradient-to-r ${currentTheme.buttonGradient} py-3 rounded-lg text-white font-medium`}
                onClick={handleStartGame}
                disabled={players.length < 1} // Require at least one player to start
              >
                Start Game
              </motion.button>
            )}
          </div>
          
          {/* Chat section */}
          <div className="md:col-span-2 flex flex-col bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden h-96">
            <div className="flex-1 overflow-y-auto p-3 space-y-2" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className="text-left">
                    <span className={`font-bold ${currentTheme.messageAuthor}`}>{msg.senderName}: </span>
                    <span className={currentTheme.messageContent}>{msg.text}</span>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 bg-black/20 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className={`flex-1 bg-gray-700/70 border border-gray-600 rounded-l px-3 py-2 text-white focus:outline-none ${currentTheme.inputFocus}`}
                  placeholder="Type a message..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className={`bg-gradient-to-r ${currentTheme.buttonGradient} px-4 rounded-r text-white`}
                >
                  Send
                </motion.button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400">
          {isHost ? (
            <p>You're the host! Start the game when everyone is ready.</p>
          ) : (
            <p>Waiting for the host to start the game...</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingRoom;