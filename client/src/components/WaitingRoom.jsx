import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSocket from "../hooks/useSocket";
import {
  dragonballCharacters,
  pokemonCharacters,
  themeStyles,
  getText,
  getCharacterName,
} from "../themeConfig";
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
  setShowPlayerTurn,
  language = "he",
  toggleLanguage,
}) => {
  // State definitions
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [players, setPlayers] = useState([]);
  const [roomId, setRoomId] = useState(multiplayerData.roomId || "");
  const [isHost, setIsHost] = useState(multiplayerData.isHost || false);
  const [countdown, setCountdown] = useState(null);
  const [notification, setNotification] = useState(null);
  const [generatedCards, setGeneratedCards] = useState(null);
  const [roomTimer, setRoomTimer] = useState(5 * 60); // 5 minutes in seconds
  const [roomTimerActive, setRoomTimerActive] = useState(true);
  const roomTimerRef = useRef(null);

  // Add ref for chat container scrolling
  const chatContainerRef = useRef(null);

  // Initialize the socket hook with a unique component ID
  const socket = useSocket("WaitingRoom", true);

  // Get theme styles from centralized config
  const currentThemeConfig = themeStyles[gameTheme] || themeStyles.dragonball;

  // Create theme-specific styles using our centralized theme configuration
  const currentTheme = {
    container: currentThemeConfig.colors.container,
    title: currentThemeConfig.text.title,
    subtitle: currentThemeConfig.text.subtitle,
    buttonGradient: currentThemeConfig.colors.buttonGradient,
    buttonGlow: currentThemeConfig.animations.glow,
    playerCardBg: "bg-gray-800/60",
    playerCardHost:
      gameTheme === "dragonball" ? "bg-orange-900/60" : "bg-blue-900/60",
    messageAuthor:
      gameTheme === "dragonball" ? "text-orange-400" : "text-blue-400",
    messageContent: "text-gray-300",
    inputFocus:
      gameTheme === "dragonball"
        ? "focus:ring-orange-400 focus:border-orange-400"
        : "focus:ring-blue-400 focus:border-blue-400",
  };

  // Memoize showNotification function - DEFINE BEFORE IT'S USED
  const showNotification = useCallback((message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }, []);

  // Handle leave room function - DEFINE BEFORE IT'S USED
  const handleLeaveRoom = useCallback(() => {
    socket.leaveRoom({
      roomId,
    });
    setGamePhase("online_lobby");
  }, [roomId, setGamePhase, socket]);

  // Format timer for display
  const formatRoomTimer = () => {
    const minutes = Math.floor(roomTimer / 60);
    const seconds = roomTimer % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Copy room code function
  const copyRoomCode = useCallback(() => {
    navigator.clipboard
      .writeText(roomId)
      .then(() => {
        showNotification(
          getText(gameTheme, language, "roomCode") +
            " " +
            getText(gameTheme, language, "success", "common")
        );
      })
      .catch((err) => {
        console.error("Could not copy room code:", err);
      });
  }, [roomId, showNotification, gameTheme, language]);

  // Memoize initializeGame function
  const initializeGame = useCallback(() => {
    // Reset game state
    setMatchedPairs([]);
    setFlippedIndices([]);
    setMatchedBy({});

    // Set player information
    setPlayerScores(
      players.map((player) => ({
        id: player.id,
        name: player.name,
        score: 0,
        moves: 0,
      }))
    );

    setPlayerNames(players.map((player) => player.name));

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
    setGamePhase,
  ]);

  // Memoize startCountdown function
  const startCountdown = useCallback(() => {
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
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

  // Handle starting the game with validation for minimum players
  const handleStartGame = useCallback(() => {
    // Check if there are at least 2 players
    if (players.length < 2) {
      console.log("Cannot start game with fewer than 2 players");
      showNotification(getText(gameTheme, language, "needMorePlayers") || "Need at least 2 players to start");
      return;
    }

    // Generate shuffled cards
    const characterSet =
      gameTheme === "dragonball" ? dragonballCharacters : pokemonCharacters;

    // Determine number of pairs based on difficulty
    let numPairs;
    let layoutConfig = {}; // Add layout configuration

    switch (difficulty) {
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

    console.log(
      `Starting game with difficulty: ${difficulty}, pairs: ${numPairs}, layout: ${layoutConfig.cols}x${layoutConfig.rows}`
    );

    // Shuffle characters and select pairs
    const shuffledCharacters = [...characterSet].sort(
      () => Math.random() - 0.5
    );
    const selectedCharacters = shuffledCharacters.slice(0, numPairs);

    // Create card pairs with unique IDs, theme information, and localized names
    const cardPairs = selectedCharacters.flatMap((character) => [
      {
        ...character,
        uniqueId: uuidv4(),
        cardTheme: gameTheme,
        displayName: getCharacterName(character, language),
      },
      {
        ...character,
        uniqueId: uuidv4(),
        cardTheme: gameTheme,
        displayName: getCharacterName(character, language),
      },
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
      layoutConfig: layoutConfig, // Send layout configuration to server
      language: language, // Also send language preference
    });
  }, [difficulty, gameTheme, roomId, socket, language, players.length, showNotification]);

  // Handle sending a chat message
  const handleSendMessage = useCallback(
    (e) => {
      e.preventDefault();

      if (!chatMessage.trim()) return;

      socket.sendMessage({
        roomId,
        message: chatMessage,
      });
      setChatMessage("");
    },
    [chatMessage, roomId, socket]
  );

  // NOW we can use the above functions in useEffects

  useEffect(() => {
    // Request current player list on component mount
    if (roomId) {
      console.log("Requesting current player list for room:", roomId);
      socket.requestPlayerList({ roomId });
    }
  }, [roomId, socket]);
  
  
  // Room timer effect - NOW SAFE because handleLeaveRoom and showNotification are defined
  useEffect(() => {
    if (roomTimerActive) {
      // Start the timer that counts down from 5 minutes
      roomTimerRef.current = setInterval(() => {
        setRoomTimer((prev) => {
          // If timer reaches zero, leave the room
          if (prev <= 1) {
            clearInterval(roomTimerRef.current);
            showNotification(getText(gameTheme, language, "roomExpired") || "Room has expired");
            setTimeout(() => {
              handleLeaveRoom();
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Clean up timer on unmount or when deactivated
    return () => {
      if (roomTimerRef.current) {
        clearInterval(roomTimerRef.current);
      }
    };
  }, [roomTimerActive, gameTheme, language, handleLeaveRoom, showNotification]);

  // Set initial data from multiplayerData
  useEffect(() => {
    if (multiplayerData) {
      // Set room ID
      if (multiplayerData.roomId) {
        setRoomId(multiplayerData.roomId);
      }
      
      // Set host status
      if (typeof multiplayerData.isHost === 'boolean') {
        setIsHost(multiplayerData.isHost);
      }
      
      // Set players
      if (multiplayerData.players && Array.isArray(multiplayerData.players)) {
        console.log("SETTING INITIAL PLAYERS FROM MULTIPLAYER DATA:", multiplayerData.players);
        setPlayers([...multiplayerData.players]);
      }
      
      // Set difficulty from game state
      if (multiplayerData.gameState && multiplayerData.gameState.difficulty) {
        console.log(`Setting initial difficulty from room data: ${multiplayerData.gameState.difficulty}`);
        setDifficulty(multiplayerData.gameState.difficulty);
      }
    }
  }, [multiplayerData, setDifficulty]);

  // Enforce theme synchronization with the room
  useEffect(() => {
    // If multiplayerData has a theme and it's different from current theme
    if (multiplayerData.gameTheme && multiplayerData.gameTheme !== gameTheme) {
      // Update the local game theme to match the room's theme
      console.log(
        `Enforcing room theme: ${gameTheme} -> ${multiplayerData.gameTheme}`
      );
      setGameTheme(multiplayerData.gameTheme);
    }
  }, [multiplayerData.gameTheme, gameTheme, setGameTheme]);

  // Effect to scroll chat to bottom when messages change
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Debug log to track player state
  useEffect(() => {
    console.log("PLAYER STATE CHANGED:", players);
  }, [players]);

  // Set up socket event listeners
  useEffect(() => {
    // Clean up any existing listeners to prevent duplicates
    socket.removeEventListeners();

    // PLAYER JOINED EVENT HANDLER
    socket.addEventListener("playerJoined", (data) => {
      console.log("PLAYER JOINED EVENT RECEIVED:", data);
      
      if (!data || !data.players || !Array.isArray(data.players)) {
        console.error("Received invalid player data:", data);
        return;
      }
      
      console.log("Setting players with data:", data.players);
      
      // Set players directly with data from event
      setPlayers(data.players);
      
      // Show notification
      if (data.message) {
        showNotification(data.message);
      }
      
      // Reset room timer when a new player joins (only for host)
      if (isHost && roomTimer < 4 * 60) {
        setRoomTimer(5 * 60); // Reset to 5 minutes
        showNotification(getText(gameTheme, language, "timerReset") || "Room timer reset");
      }
    });

    // ROOM JOINED EVENT HANDLER
    socket.addEventListener("roomJoined", (data) => {
      console.log("ROOM JOINED EVENT RECEIVED:", data);
      
      // Make sure to update difficulty from server when joining a room
      if (data.gameState && data.gameState.difficulty) {
        console.log(`Setting difficulty from server on join: ${data.gameState.difficulty}`);
        setDifficulty(data.gameState.difficulty);
      } else if (data.difficulty) {
        console.log(`Setting difficulty directly from join data: ${data.difficulty}`);
        setDifficulty(data.difficulty);
      }
      
      // Also update players
      if (data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
      }
      
      // Update gameTheme if provided
      if (data.gameTheme && data.gameTheme !== gameTheme) {
        console.log(`Updating theme on join: ${gameTheme} -> ${data.gameTheme}`);
        setGameTheme(data.gameTheme);
      }
      
      showNotification(getText(gameTheme, language, "joinedRoom") || "Joined room successfully");
    });

    // PLAYER LEFT EVENT HANDLER
    socket.addEventListener("playerLeft", (data) => {
      console.log("PLAYER LEFT EVENT RECEIVED:", data);
      
      if (!data || !data.players || !Array.isArray(data.players)) {
        console.error("Received invalid player data on leave:", data);
        return;
      }
      
      console.log("Updating players after leave:", data.players);
      
      // Set players directly with data from event
      setPlayers(data.players);
      
      // Show notification
      if (data.message) {
        showNotification(data.message);
      }

      // If we're not the host, check if we became the host
      if (!isHost && data.players.find((p) => p.id === socket.socket?.id)?.isHost) {
        setIsHost(true);
        showNotification(getText(gameTheme, language, "hostStartPrompt"));
      }
    });

    // Add room expiration listener
    socket.addEventListener("roomExpired", (data) => {
      console.log("Room expired:", data);
      showNotification(getText(gameTheme, language, "roomExpired") || "Room has expired");
      
      // Exit to lobby after a delay
      setTimeout(() => {
        setGamePhase("online_lobby");
      }, 2000);
    });

    socket.addEventListener("playerList", (data) => {
      console.log("PLAYER LIST EVENT RECEIVED:", data);
      
      if (!data || !data.players || !Array.isArray(data.players)) {
        console.error("Received invalid player data:", data);
        return;
      }
      
      console.log("Updating players from playerList event:", data.players);
      setPlayers(data.players);
      
      // Also update player names in parent component for consistency
      if (typeof setPlayerNames === 'function') {
        setPlayerNames(data.players.map(player => player.name));
      }
    });

    // Add difficulty update listener
    socket.addEventListener("difficultyUpdated", (data) => {
      console.log("DIFFICULTY UPDATED EVENT:", data);
      if (data.difficulty && data.difficulty !== difficulty) {
        console.log(`Updating difficulty based on server event: ${difficulty} -> ${data.difficulty}`);
        setDifficulty(data.difficulty);
        showNotification(
          getText(gameTheme, language, "difficultyChanged") + 
          ": " + 
          getText(gameTheme, language, data.difficulty, "common")
        );
      }
    });

    socket.addEventListener("newMessage", (data) => {
      console.log("New message received:", data);
      setMessages((prev) => {
        // Check for duplicate messages using message timestamp as unique identifier
        const exists = prev.some(
          (msg) =>
            msg.timestamp === data.message.timestamp &&
            msg.senderId === data.message.senderId
        );
        // Only add if it doesn't exist
        return exists ? prev : [...prev, data.message];
      });
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
        // Ensure all cards have theme information and localized names
        const themedCards = data.gameState.cards.map((card) => ({
          ...card,
          cardTheme: data.gameTheme || gameTheme,
          displayName: getCharacterName(card, language),
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
      } else if (data.gameState && data.gameState.difficulty && data.gameState.difficulty !== difficulty) {
        console.log(`Updating difficulty from gameState: ${difficulty} -> ${data.gameState.difficulty}`);
        setDifficulty(data.gameState.difficulty);
      }

      startCountdown();
    });

    socket.addEventListener("gameReset", (data) => {
      // Reset local state
      if (data && data.players && Array.isArray(data.players)) {
        setPlayers(data.players);
        
        // Also update player names in parent component
        if (typeof setPlayerNames === 'function') {
          setPlayerNames(data.players.map(player => player.name));
        }
      }
      
      // Reset room timer when game is reset
      setRoomTimer(5 * 60);
      setRoomTimerActive(true);
      
      // Make sure we have the latest difficulty and theme
      if (data.difficulty && typeof setDifficulty === 'function') {
        setDifficulty(data.difficulty);
      }
      
      if (data.gameTheme && typeof setGameTheme === 'function' && data.gameTheme !== gameTheme) {
        setGameTheme(data.gameTheme);
      }
      
      showNotification(getText(gameTheme, language, "gameReset"));
    });
    
    // Cleanup function
    return () => {
      socket.removeEventListeners();
    };
  }, [
    socket,
    isHost,
    setCards,
    startCountdown,
    showNotification,
    gameTheme,
    setGameTheme,
    difficulty,
    setDifficulty,
    generatedCards,
    language,
    roomTimer,
    setGamePhase,
    setPlayerNames
  ]);

  // KEEPING THE UI EXACTLY THE SAME AS PROVIDED
  return (
    <div
      className={`text-center max-w-4xl mx-auto p-4 ${
        currentTheme.container
      } rounded-xl backdrop-blur-lg shadow-2xl border relative overflow-hidden ${
        language === "he" ? "rtl" : "ltr"
      }`}
    >
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
        <div
          dir={language === "en" ? "ltr" : "rtl"}
          className="flex justify-between items-center mb-4"
        >
          <h1 className={`text-2xl font-bold ${currentTheme.title}`}>
            {getText(gameTheme, language, "waitingRoom")}
          </h1>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-white flex items-center">
              <span className="mr-2">
                {getText(gameTheme, language, "timeLeft")}:{" "}
                <span
                  className={`font-mono font-bold ${
                    roomTimer < 60 ? "text-red-400" : ""
                  }`}
                >
                  {formatRoomTimer()}
                </span>
              </span>
            </div>
            {/* Room code with copy button */}
            <div className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-white flex items-center">
              <span className="mr-2">
                {getText(gameTheme, language, "roomCode")}:{" "}
                <span className="font-mono font-bold">{roomId}</span>
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyRoomCode}
                className="text-gray-400 hover:text-white mx-1"
                title="Copy room code"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </motion.button>
              {/* Theme indicator */}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-xs text-white ${
                  gameTheme === "dragonball" ? "bg-orange-600" : "bg-blue-600"
                }`}
              >
                {gameTheme === "dragonball"
                  ? getText(gameTheme, language, "cardInitials")
                  : getText(gameTheme, language, "cardInitials")}
              </span>
            </div>

            <div className="px-3 py-1 bg-gray-800 rounded-lg text-sm text-white">
              <span className="text-xs">
                {players.length}/4 {getText(gameTheme, language, "players")}
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white"
              onClick={handleLeaveRoom}
            >
              {getText(gameTheme, language, "leave", "common")}
            </motion.button>
          </div>
        </div>

        <div
          dir={language === "en" ? "ltr" : "rtl"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Players list */}
          <div className="md:col-span-1">
            <h2
              className={`text-lg font-bold ${currentTheme.subtitle} mb-2 ${
                language === "he" ? "text-right" : "text-left"
              }`}
            >
              {getText(gameTheme, language, "players")} ({players.length}/4)
            </h2>

            {/* Player list */}
            {players.length === 0 ? (
              <div className="p-3 rounded-lg bg-gray-800/60 text-gray-400 text-center">
                {getText(gameTheme, language, "noPlayersYet") || "No players yet"}
              </div>
            ) : (
              <div className="space-y-2">
                {players.map((player, index) => (
                  <motion.div
                    key={`player-${player.id || index}-${index}`}
                    initial={{ opacity: 0, x: language === "he" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg ${
                      player.isHost
                        ? currentTheme.playerCardHost
                        : currentTheme.playerCardBg
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div
                        className={`ml-3 ${
                          language === "he" ? "text-right" : "text-left"
                        }`}
                      >
                        <div className="font-medium text-white">
                          {player.name || `Player ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.isHost
                            ? getText(gameTheme, language, "host")
                            : getText(gameTheme, language, "player")}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div
              className={`mt-4 mb-2 ${
                language === "he" ? "text-right" : "text-left"
              }`}
            >
              <span className="text-sm text-gray-400">
                {getText(gameTheme, language, "difficulty")}:{" "}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs text-white ${
                  difficulty === "easy"
                    ? "bg-green-600"
                    : difficulty === "medium"
                    ? "bg-orange-600"
                    : "bg-red-600"
                }`}
              >
                {getText(
                  gameTheme,
                  language,
                  difficulty,
                  "common"
                )}
              </span>
            </div>

            {/* Start Game button for host */}
            {isHost && (
              <div className="mt-4">
                <motion.button
                  whileHover={{ scale: players.length >= 2 ? 1.05 : 1 }}
                  whileTap={{ scale: players.length >= 2 ? 0.95 : 1 }}
                  className={`w-full py-3 rounded-lg text-white font-medium relative overflow-hidden ${
                    players.length < 2 ? 'bg-gray-600 cursor-not-allowed' : `bg-gradient-to-r ${currentTheme.buttonGradient}`
                  }`}
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                >
                  {getText(gameTheme, language, "buttonStart")}
                </motion.button>
                {/* Additional help text */}
                <div className="mt-2 text-sm text-center">
                  <div className="text-yellow-400">
                    {players.length < 2 && (
                      <div className="text-sm">
                        {getText(gameTheme, language, "needMorePlayers") || "Need at least 2 players to start"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat section */}
          <div className="md:col-span-2 flex flex-col bg-black/30 backdrop-blur-sm rounded-lg overflow-hidden h-96">
            <div
              className="flex-1 overflow-y-auto p-3 space-y-2"
              ref={chatContainerRef}
            >
              {messages.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  {getText(gameTheme, language, "noMessages")}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={`msg-${index}-${msg.timestamp}`}
                    className={language === "he" ? "text-right" : "text-left"}
                  >
                    <span className={`font-bold ${currentTheme.messageAuthor}`}>
                      {msg.senderName}:{" "}
                    </span>
                    <span className={currentTheme.messageContent}>
                      {msg.text}
                    </span>
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
                  placeholder={getText(gameTheme, language, "typeMessage")}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className={`bg-gradient-to-r ${currentTheme.buttonGradient} px-4 rounded-r text-white`}
                >
                  {getText(gameTheme, language, "send", "common")}
                </motion.button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          {isHost ? (
            <p>{getText(gameTheme, language, "hostStartPrompt")}</p>
          ) : (
            <p>{getText(gameTheme, language, "waitingForHost")}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingRoom;