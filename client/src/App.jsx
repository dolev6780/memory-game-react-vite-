import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameBoard from "./components/GameBoard";
import IntroScreen from "./components/IntroScreen";
import PlayerSelectScreen from "./components/PlayerSelectScreen";
import ShufflingScreen from "./components/ShufflingScreen";
import GameOverScreen from "./components/GameOverScreen";
import { dragonballCharacters, dragonballBackgroundImage, pokemonBackgroundImage, pokemonCharacters } from "./constants";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this package

// Difficulty level configurations
const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, cols: 4, rows: 3 },
  medium: { pairs: 10, cols: 5, rows: 4 },
  hard: { pairs: 15, cols: 6, rows: 5 },
};

const App = () => {
  const [gamePhase, setGamePhase] = useState("intro");
  const [difficulty, setDifficulty] = useState("medium");
  const [gameTheme, setGameTheme] = useState("dragonball"); // Add game theme state
  const [gameTitle, setGameTitle] = useState("Dragon Ball"); // Add game theme state
  const [playerCount, setPlayerCount] = useState(1);
  const [cards, setCards] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [matchedBy, setMatchedBy] = useState({}); // Track which player matched which card
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [playerScores, setPlayerScores] = useState([]);
  const [playerMoves, setPlayerMoves] = useState([]);
  const [moves, setMoves] = useState(0);
  const [showPlayerTurn, setShowPlayerTurn] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [playerNames, setPlayerNames] = useState([]);

  // Function to handle theme selection
  const handleThemeSelect = (theme, title) => {
    setGameTheme(theme);
    setGameTitle(title)
  };

  // Function to get the current character set based on theme
  const getCurrentCharacters = useCallback(() => {
    return gameTheme === "dragonball" ? dragonballCharacters : pokemonCharacters;
  }, [gameTheme]);

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

  // Updated styles calculation function for the App component
const styles = useCallback(() => {
  const config = DIFFICULTY_CONFIG[difficulty];
  const isSmallScreen = windowSize.width < 640;
  const isMediumScreen = windowSize.width >= 640 && windowSize.width < 1024;
  
  // Calculate available space
  const availableHeight = windowSize.height - 120; // Account for header and padding
  const maxGridHeight = availableHeight * 0.85; // Use 85% of available height

  // Calculate card dimensions based on screen size
  let cardWidth, cardHeight, fontSize, gapSize;

  if (isSmallScreen) {
    // Mobile styling - smaller cards
    const availableWidth = Math.min(windowSize.width - 24, 380);
    cardWidth = Math.floor(
      (availableWidth - (config.cols - 1) * 6) / config.cols
    );
    cardHeight = Math.floor(cardWidth * 1.35); // Slightly less tall
    
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
    // Tablet styling - optimized dimensions
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
    // Desktop styling - balanced dimensions
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
}, [difficulty, windowSize]);

  // Initialize players
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
    setShuffling(true);
    setGamePhase("shuffling");
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMatchedBy({}); // Reset matched pairs tracking
    setMoves(0);

    // Get characters based on the current theme
    const characterSet = getCurrentCharacters();

    // Select characters based on difficulty
    const config = DIFFICULTY_CONFIG[difficulty];
    const shuffledCharacters = [...characterSet].sort(
      () => Math.random() - 0.5
    );
    const selectedCharacters = shuffledCharacters.slice(0, config.pairs);
    setCharacters(selectedCharacters);

    // Create card pairs
    const cardPairs = selectedCharacters.flatMap((character) => [
      { ...character, uniqueId: uuidv4() },
      { ...character, uniqueId: uuidv4() },
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
      setGamePhase("game_board");
    }, 1500);
  }, [difficulty, playerCount, initializePlayers, getCurrentCharacters]);

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
              setGamePhase("game_over");
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
      characters.length,
      currentPlayer,
      flippedIndices,
      matchedPairs,
      moves,
      playerCount,
      playerMoves,
      playerScores,
      switchPlayer,
    ]
  );

  // Handle difficulty selection
  const handleDifficultySelect = (level) => {
    setDifficulty(level);
    setGamePhase("player_select");
  };

  // Handle player count selection
  const handlePlayerCountSelect = (count) => {
    setPlayerCount(count);
    // Reset player names when player count changes
    setPlayerNames(Array(count).fill('').map((_, i) => `Player ${i + 1}`));
  };

  // Initialize game when component mounts
  useEffect(() => {
    // This is just to initialize state, actual game starts after player interaction
    const config = DIFFICULTY_CONFIG[difficulty];
    const characterSet = getCurrentCharacters();
    const initialCharacters = characterSet.slice(0, config.pairs);
    setCharacters(initialCharacters);
  }, [difficulty, getCurrentCharacters]);

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
              gameTitle={gameTitle}
              handleThemeSelect={handleThemeSelect}
              handleDifficultySelect={handleDifficultySelect}
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
              gameTheme={gameTheme}
              playerCount={playerCount}
              handlePlayerCountSelect={handlePlayerCountSelect}
              setGamePhase={setGamePhase}
              handleStartGame={handleStartGame}
              playerNames={playerNames}
              setPlayerNames={setPlayerNames}
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
              matchedBy={matchedBy} // Pass the matchedBy object to GameBoard
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
              setGamePhase={setGamePhase}
              playerNames={playerNames}
              gameTheme={gameTheme}
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
              initializeGame={initializeGame}
              setGamePhase={setGamePhase}
              playerNames={playerNames}
              gameTheme={gameTheme}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Get the correct background image based on theme
  const backgroundImage = gameTheme === "dragonball" ? dragonballBackgroundImage : pokemonBackgroundImage;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2 sm:p-4 bg-gray-900 relative overflow-hidden">
      {/* Background image - now dynamic based on theme */}
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