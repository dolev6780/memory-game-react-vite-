import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameBoard from "./components/GameBoard";
import IntroScreen from "./components/IntroScreen";
import PlayerSelectScreen from "./components/PlayerSelectScreen";
import ShufflingScreen from "./components/ShufflingScreen";
import GameOverScreen from "./components/GameOverScreen";
import OnlineLobby from "./components/OnlineLobby";
import WaitingRoom from "./components/WaitingRoom";
import { dragonballCharacters, dragonballBackgroundImage, pokemonBackgroundImage, pokemonCharacters } from "./constants";
import socketService from "./services/socketService";
import { v4 as uuidv4 } from "uuid";

// Difficulty level configurations
const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, cols: 4, rows: 3 },
  medium: { pairs: 10, cols: 5, rows: 4 },
  hard: { pairs: 15, cols: 6, rows: 5 },
};

const App = () => {
  // Game state
  const [gamePhase, setGamePhase] = useState("intro");
  const [gameTheme, setGameTheme] = useState("dragonball");
  const [difficulty, setDifficulty] = useState("medium");
  const [isOnline, setIsOnline] = useState(false);
  
  // Local game state
  const [playerCount, setPlayerCount] = useState(1);
  const [cards, setCards] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [matchedBy, setMatchedBy] = useState({});
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [playerScores, setPlayerScores] = useState([]);
  const [playerMoves, setPlayerMoves] = useState([]);
  const [moves, setMoves] = useState(0);
  const [showPlayerTurn, setShowPlayerTurn] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [playerNames, setPlayerNames] = useState([]);
  
  // Layout configuration for online games
  const [layoutConfig, setLayoutConfig] = useState(null);
  
  // Online multiplayer state
  const [multiplayerData, setMultiplayerData] = useState({
    roomId: null,
    isHost: false,
    players: [],
    gameState: null,
    gameTheme: null  // Add gameTheme property
  });
  
  // Window size for responsive design
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Define a cleanup function to handle phase transitions
  const cleanupPhaseTransition = useCallback((oldPhase, newPhase) => {
    console.log(`Phase transition: ${oldPhase} -> ${newPhase}`);
    
    // Clean up based on the phase we're leaving
    if (oldPhase === "online_lobby" || oldPhase === "waiting_room") {
      // If we're leaving any online screen without going to another online screen
      if (newPhase !== "online_lobby" && newPhase !== "waiting_room" && newPhase !== "game_board" && newPhase !== "game_over") {
        console.log("Leaving online mode, resetting socket state");
        socketService.resetState();
      }
    }
  }, []);

  // Enhanced setGamePhase with cleanup
  const setGamePhaseWithCleanup = useCallback((newPhase) => {
    cleanupPhaseTransition(gamePhase, newPhase);
    setGamePhase(newPhase);
  }, [gamePhase, cleanupPhaseTransition]);

  // Theme synchronization effect
  useEffect(() => {
    // If we have a theme in multiplayerData and it's different from current theme
    if (multiplayerData.gameTheme && multiplayerData.gameTheme !== gameTheme) {
      console.log(`Synchronizing theme: ${gameTheme} -> ${multiplayerData.gameTheme}`);
      // Use a slight delay to ensure all components update properly
      const timerId = setTimeout(() => {
        setGameTheme(multiplayerData.gameTheme);
      }, 50);
      
      return () => clearTimeout(timerId);
    }
  }, [multiplayerData.gameTheme, gameTheme, setGameTheme]);

  socketService.on("difficultyUpdated", (data) => {
    if (data.difficulty && data.difficulty !== difficulty) {
      console.log(`Updating difficulty from server: ${difficulty} -> ${data.difficulty}`);
      setDifficulty(data.difficulty);
    }
  });

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Setup socket listeners for online gameplay
  useEffect(() => {
    if (!isOnline) return;
    
    // Clean up any existing listeners to prevent duplicates
    socketService.on("gameStarted", null);
    socketService.on("cardFlipped", null);
    socketService.on("turnUpdate", null);
    socketService.on("gameOver", null);
    
    // Listen for game events from the server
    socketService.on("gameStarted", (data) => {
      console.log("Game started event in App.jsx:", data);
      
      // If the server provided layout configuration, use it
      if (data.layoutConfig) {
        console.log("Using layout config from server:", data.layoutConfig);
        setLayoutConfig(data.layoutConfig);
      }
      
      // Make sure we're using the server's game state
      setFlippedIndices(data.gameState?.flippedIndices || []);
      setMatchedPairs(data.gameState?.matchedPairs || []);
      setMatchedBy(data.gameState?.matchedBy || {});
      
      // If cards have theme information, update the local cards
      if (data.gameState && data.gameState.cards) {
        setCards(data.gameState.cards);
      }
      
      // Update difficulty if provided by server
      if (data.difficulty && data.difficulty !== difficulty) {
        console.log(`Updating difficulty: ${difficulty} -> ${data.difficulty}`);
        setDifficulty(data.difficulty);
      }
    });
    
    socketService.on("cardFlipped", (data) => {
      // Make sure we're using the server's game state
      setFlippedIndices(data.gameState.flippedIndices);
      setMatchedPairs(data.gameState.matchedPairs);
      setMatchedBy(data.gameState.matchedBy);
      
      // If cards have theme information, update the local cards
      if (data.gameState.cards) {
        setCards(data.gameState.cards);
      }
      
      // Update player scores
      setPlayerScores(data.players.map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        moves: player.moves
      })));
    });
    
    socketService.on("turnUpdate", (data) => {
      // Update with server's game state
      setFlippedIndices(data.gameState.flippedIndices);
      setMatchedPairs(data.gameState.matchedPairs);
      setMatchedBy(data.gameState.matchedBy);
      
      // If cards have theme information, update the local cards
      if (data.gameState.cards) {
        setCards(data.gameState.cards);
      }
      
      // Update current player
      setCurrentPlayer(data.currentPlayer);
      setShowPlayerTurn(true);
      
      // Hide player turn notification after delay
      setTimeout(() => {
        setShowPlayerTurn(false);
      }, 1500);
    });
    
    socketService.on("gameOver", (data) => {
      // Update final game state
      setFlippedIndices(data.gameState.flippedIndices);
      setMatchedPairs(data.gameState.matchedPairs);
      setMatchedBy(data.gameState.matchedBy);
      
      // If cards have theme information, update the local cards
      if (data.gameState.cards) {
        setCards(data.gameState.cards);
      }
      
      // Update player scores one last time
      setPlayerScores(data.players.map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        moves: player.moves
      })));
      
      // Move to game over screen
      setGamePhaseWithCleanup("game_over");
    });
    
    // Clean up on component unmount
    return () => {
      socketService.on("gameStarted", null);
      socketService.on("cardFlipped", null);
      socketService.on("turnUpdate", null);
      socketService.on("gameOver", null);
    };
  }, [isOnline, difficulty, setGamePhaseWithCleanup]);

  // Updated styles calculation function
  const styles = useCallback(() => {
    // For online mode, calculate layout based on card count
    let config;
    if (isOnline) {
      // Determine layout based on total card count (consistent for all players)
      const totalCards = cards.length;
      
      // Create fixed layouts based on card count that match the difficulty levels
      const layoutByCardCount = {
        12: { pairs: 6, cols: 4, rows: 3 },  // Easy: 6 pairs
        20: { pairs: 10, cols: 5, rows: 4 }, // Medium: 10 pairs
        30: { pairs: 15, cols: 6, rows: 5 }  // Hard: 15 pairs
      };
      
      if (totalCards > 0 && layoutByCardCount[totalCards]) {
        // Use the predefined layout for this card count
        config = layoutByCardCount[totalCards];
        console.log(`Using synchronized layout for ${totalCards} cards: ${config.cols}x${config.rows}`);
      } else if (totalCards > 0) {
        // Fallback - calculate a reasonable layout if number of cards doesn't match predefined layouts
        const cols = Math.ceil(Math.sqrt(totalCards));
        const rows = Math.ceil(totalCards / cols);
        config = {
          pairs: totalCards / 2,
          cols: cols,
          rows: rows
        };
        console.log(`Calculated layout for ${totalCards} cards: ${config.cols}x${config.rows}`);
      } else {
        // No cards yet, use difficulty-based default
        config = DIFFICULTY_CONFIG[difficulty];
        console.log(`Using default layout for ${difficulty}: ${config.cols}x${config.rows}`);
      }
    } else {
      // For local games, use the difficulty-based configuration as before
      config = DIFFICULTY_CONFIG[difficulty];
    }
    
    const isSmallScreen = windowSize.width < 640;
    const isMediumScreen = windowSize.width >= 640 && windowSize.width < 1024;
    
    // Calculate available space
    const availableHeight = windowSize.height - 120;
    const maxGridHeight = availableHeight * 0.85;
  
    // Calculate card dimensions based on screen size
    let cardWidth, cardHeight, fontSize, gapSize;
  
    if (isSmallScreen) {
      // Mobile styling - smaller cards
      const availableWidth = Math.min(windowSize.width - 24, 380);
      cardWidth = Math.floor(
        (availableWidth - (config.cols - 1) * 6) / config.cols
      );
      cardHeight = Math.floor(cardWidth * 1.35);
      
      // Ensure cards don't exceed the available height
      const totalCardHeight = cardHeight * config.rows + (config.rows - 1) * 6;
      if (totalCardHeight > maxGridHeight) {
        const scaleFactor = maxGridHeight / totalCardHeight;
        cardHeight = Math.floor(cardHeight * scaleFactor);
        cardWidth = Math.floor(cardWidth * scaleFactor);
      }
      
      fontSize = {
        title: Math.max(10, Math.floor(cardWidth * 0.22)),
        name: Math.max(7, Math.floor(cardWidth * 0.16)),
      };
      gapSize = 6;
    } else if (isMediumScreen) {
      // Tablet styling
      const availableWidth = Math.min(windowSize.width - 40, 650);
      cardWidth = Math.floor(
        (availableWidth - (config.cols - 1) * 8) / config.cols
      );
      cardHeight = Math.floor(cardWidth * 1.35);
      
      // Ensure cards don't exceed the available height
      const totalCardHeight = cardHeight * config.rows + (config.rows - 1) * 8;
      if (totalCardHeight > maxGridHeight) {
        const scaleFactor = maxGridHeight / totalCardHeight;
        cardHeight = Math.floor(cardHeight * scaleFactor);
        cardWidth = Math.floor(cardWidth * scaleFactor);
      }
      
      fontSize = {
        title: Math.max(12, Math.floor(cardWidth * 0.2)),
        name: Math.max(9, Math.floor(cardWidth * 0.15)),
      };
      gapSize = 8;
    } else {
      // Desktop styling
      const availableWidth = Math.min(windowSize.width - 60, 850);
      cardWidth = Math.floor(
        (availableWidth - (config.cols - 1) * 10) / config.cols
      );
      cardHeight = Math.floor(cardWidth * 1.35);
      
      // Ensure cards don't exceed the available height
      const totalCardHeight = cardHeight * config.rows + (config.rows - 1) * 10;
      if (totalCardHeight > maxGridHeight) {
        const scaleFactor = maxGridHeight / totalCardHeight;
        cardHeight = Math.floor(cardHeight * scaleFactor);
        cardWidth = Math.floor(cardWidth * scaleFactor);
      }
      
      fontSize = {
        title: Math.max(14, Math.floor(cardWidth * 0.18)),
        name: Math.max(10, Math.floor(cardWidth * 0.13)),
      };
      gapSize = 10;
    }
  
    // Calculate grid dimensions
    const gridWidth = cardWidth * config.cols + (config.cols - 1) * gapSize;
    const gridHeight = cardHeight * config.rows + (config.rows - 1) * gapSize;
  
    return {
      container: {
        width: "100%",
        maxWidth: `${gridWidth + 16}px`,
        margin: "0 auto",
      },
      cardGrid: {
        display: "grid",
        gridTemplateColumns: `repeat(${config.cols}, 1fr)`,
        gap: `${gapSize}px`,
        margin: "0 auto",
      },
      card: {
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        position: "relative",
        perspective: "1000px",
        cursor: "pointer",
      },
      fontSize: fontSize,
    };
  }, [difficulty, windowSize, isOnline, cards]);

  // Initialize players for local gameplay
  const initializePlayers = useCallback(() => {
    const players = Array.from({ length: playerCount }, (_, index) => ({
      id: index,
      name: playerNames[index] || `Player ${index + 1}`,
      score: 0,
      moves: 0,
    }));
    setPlayerScores(players);
    setPlayerMoves(Array(playerCount).fill(0));
    setCurrentPlayer(0);
  }, [playerCount, playerNames]);

  // Initialize or reset the game
  const initializeGame = useCallback(() => {
    // Skip if we're in online mode
    if (isOnline) return;
    
    setShuffling(true);
    setGamePhaseWithCleanup("shuffling");
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMatchedBy({});
    setMoves(0);

    console.log(`Initializing game with theme: ${gameTheme}`);

    // Get the appropriate character set
    const characterSet = gameTheme === "dragonball" ? dragonballCharacters : pokemonCharacters;

    // Select characters based on difficulty
    const config = DIFFICULTY_CONFIG[difficulty];
    const shuffledCharacters = [...characterSet].sort(
      () => Math.random() - 0.5
    );
    const selectedCharacters = shuffledCharacters.slice(0, config.pairs);
    setCharacters(selectedCharacters);

    // Create card pairs with theme information
    const cardPairs = selectedCharacters.flatMap((character) => [
      { ...character, uniqueId: uuidv4(), cardTheme: gameTheme }, // Add theme to each card
      { ...character, uniqueId: uuidv4(), cardTheme: gameTheme }, // Add theme to each card
    ]);

    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);

    // Initialize player scores
    if (playerCount > 1) {
      initializePlayers();
    }

    // Small delay to show shuffling animation
    setTimeout(() => {
      setShuffling(false);
      setGamePhaseWithCleanup("game_board");
    }, 1500);
  }, [difficulty, playerCount, initializePlayers, gameTheme, isOnline, setGamePhaseWithCleanup]);

  // Start game with player names
  const handleStartGame = (names) => {
    setPlayerNames(names);
    initializeGame();
  };

  // Switch to next player's turn
  const switchPlayer = useCallback(() => {
    if (playerCount > 1) {
      const nextPlayer = (currentPlayer + 1) % playerCount;
      setCurrentPlayer(nextPlayer);
      setShowPlayerTurn(true);

      // Hide player turn notification after delay
      setTimeout(() => {
        setShowPlayerTurn(false);
      }, 1500);
    }
  }, [currentPlayer, playerCount]);

  // Handle card click
  const handleCardClick = useCallback(
    (index) => {
      // For online mode, just send the card click to the server
      if (isOnline) {
        socketService.cardClick({
          roomId: multiplayerData.roomId,
          cardIndex: index
        });
        return;
      }
      
      // Local gameplay logic
      // Prevent clicking if already flipped or matched
      if (
        flippedIndices.includes(index) ||
        matchedPairs.includes(cards[index].id) ||
        flippedIndices.length >= 2
      ) {
        return;
      }

      // Flip the card
      const newFlippedIndices = [...flippedIndices, index];
      setFlippedIndices(newFlippedIndices);
      setMoves(moves + 1);

      // Update current player's moves
      if (playerCount > 1) {
        const updatedMoves = [...playerMoves];
        updatedMoves[currentPlayer] += 1;
        setPlayerMoves(updatedMoves);
      }

      // Check for match if two cards are flipped
      if (newFlippedIndices.length === 2) {
        const [firstIndex, secondIndex] = newFlippedIndices;

        if (cards[firstIndex].id === cards[secondIndex].id) {
          // Match found
          const cardId = cards[firstIndex].id;
          setMatchedPairs([...matchedPairs, cardId]);
          
          // Record which player matched this card
          setMatchedBy(prev => ({
            ...prev,
            [cardId]: currentPlayer
          }));

          // Update player score for multiplayer
          if (playerCount > 1) {
            const updatedScores = [...playerScores];
            updatedScores[currentPlayer].score += 1;
            setPlayerScores(updatedScores);
          }

          // Reset flipped indices
          setTimeout(() => {
            setFlippedIndices([]);
          }, 1000);

          // Check if game is over
          if (matchedPairs.length + 1 === characters.length) {
            setTimeout(() => {
              setGamePhaseWithCleanup("game_over");
            }, 1500);
          }
        } else {
          // No match, flip back after delay and switch player
          setTimeout(() => {
            setFlippedIndices([]);
            switchPlayer();
          }, 1000);
        }
      }
    },
    [
      cards,
      characters?.length,
      currentPlayer,
      flippedIndices,
      isOnline,
      matchedPairs,
      moves,
      playerCount,
      playerMoves,
      playerScores,
      switchPlayer,
      multiplayerData.roomId,
      setGamePhaseWithCleanup
    ]
  );

  // Handle game theme selection
  const handleThemeSelect = (theme) => {
    setGameTheme(theme);
  };

  // Handle player count selection
  const handlePlayerCountSelect = (count) => {
    setPlayerCount(count);
    // Reset player names when player count changes
    setPlayerNames(Array(count).fill('').map((_, i) => `Player ${i + 1}`));
  };

  // Handle online mode selection from intro screen - UPDATED
  const handleOnlineSelect = (online) => {
    setIsOnline(online);
    if (online) {
      setGamePhaseWithCleanup("online_lobby");
    } else {
      // For local play, go directly to player selection (which now includes difficulty)
      setGamePhaseWithCleanup("player_select");
    }
  };

  // Initialize game when component mounts
  useEffect(() => {
    // Initialize characters based on selected theme
    const characterSet = gameTheme === "dragonball" ? dragonballCharacters : pokemonCharacters;
    const config = DIFFICULTY_CONFIG[difficulty];
    const initialCharacters = characterSet.slice(0, config.pairs);
    setCharacters(initialCharacters);
  }, [difficulty, gameTheme]);

  // Clean up socket connection when component unmounts
  useEffect(() => {
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Phase controller - determine which component to show
  const phaseController = () => {
    switch (gamePhase) {
      case "intro":
        return (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <IntroScreen
              difficulty={difficulty}
              gameTheme={gameTheme}
              handleThemeSelect={handleThemeSelect}
              handleOnlineSelect={handleOnlineSelect} // No longer passing handleDifficultySelect
              gameTitle={gameTheme === "dragonball" ? "Dragon Ball" : "Pokémon"}
            />
          </motion.div>
        );
      case "player_select":
        return (
          <motion.div
            key="player-select"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <PlayerSelectScreen
              difficulty={difficulty}
              setDifficulty={setDifficulty} // Add this prop
              playerCount={playerCount}
              handlePlayerCountSelect={handlePlayerCountSelect}
              setGamePhase={setGamePhaseWithCleanup}
              handleStartGame={handleStartGame}
              playerNames={playerNames}
              setPlayerNames={setPlayerNames}
              gameTheme={gameTheme}
            />
          </motion.div>
        );
      case "online_lobby":
        return (
          <motion.div
            key="online-lobby"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <OnlineLobby
              gameTheme={gameTheme}
              setGamePhase={setGamePhaseWithCleanup}
              setMultiplayerData={setMultiplayerData}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              setGameTheme={setGameTheme}
            />
          </motion.div>
        );
        case "waiting_room":
          return (
            <motion.div
              key="waiting-room"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <WaitingRoom
                multiplayerData={multiplayerData}
                setGamePhase={setGamePhaseWithCleanup}
                gameTheme={gameTheme}
                setGameTheme={setGameTheme}
                difficulty={difficulty}
                setDifficulty={setDifficulty} // Add this prop
                setCards={setCards}
                setMatchedPairs={setMatchedPairs}
                setFlippedIndices={setFlippedIndices}
                setPlayerScores={setPlayerScores}
                setCurrentPlayer={setCurrentPlayer}
                setPlayerNames={setPlayerNames}
                setMatchedBy={setMatchedBy}
                setShowPlayerTurn={setShowPlayerTurn}
              />
            </motion.div>
          );
      case "shuffling":
        return (
          <motion.div
            key="shuffling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ShufflingScreen
              characters={characters}
              shuffling={shuffling}
              styles={styles()}
              gameTheme={gameTheme}
            />
          </motion.div>
        );
      case "game_board":
        return (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameBoard
              cards={cards}
              flippedIndices={flippedIndices}
              matchedPairs={matchedPairs}
              matchedBy={matchedBy}
              handleCardClick={handleCardClick}
              styles={styles()}
              difficulty={difficulty}
              playerCount={playerCount}
              moves={moves}
              playerScores={playerScores}
              currentPlayer={currentPlayer}
              showPlayerTurn={showPlayerTurn}
              initializeGame={initializeGame}
              characters={characters}
              setGamePhase={setGamePhaseWithCleanup}
              playerNames={playerNames}
              gameTheme={gameTheme}
              setGameTheme={setGameTheme}
              isOnline={isOnline}
              layoutConfig={layoutConfig} // Pass layout config to GameBoard
            />
          </motion.div>
        );
      case "game_over":
        return (
          <motion.div
            key="game-over"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <GameOverScreen
              difficulty={difficulty}
              characters={characters}
              moves={moves}
              playerCount={playerCount}
              playerScores={playerScores}
              initializeGame={isOnline ? () => setGamePhaseWithCleanup("waiting_room") : initializeGame}
              setGamePhase={setGamePhaseWithCleanup}
              playerNames={playerNames}
              gameTheme={gameTheme}
              isOnline={isOnline}
              roomId={multiplayerData.roomId}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Get the current background image based on theme
  const backgroundImage = gameTheme === "dragonball" ? dragonballBackgroundImage : pokemonBackgroundImage;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 bg-gray-900 relative overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Game container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {phaseController()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;