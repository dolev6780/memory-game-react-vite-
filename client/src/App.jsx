import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameBoard from "./components/GameBoard";
import IntroScreen from "./components/IntroScreen";
import PlayerSelectScreen from "./components/PlayerSelectScreen";
import ShufflingScreen from "./components/ShufflingScreen";
import GameOverScreen from "./components/GameOverScreen";
import OnlineLobby from "./components/OnlineLobby";
import WaitingRoom from "./components/WaitingRoom";
import SplashScreen from "./components/SplashScreen";
import LanguageToggle from "./components/LanguageToggle";
import { GameProvider, useGameContext } from "./context/GameContext";
import { initializeGame, handleLocalCardClick } from "./utils/gameUtils";

const GameContent = () => {
  const {
    // Game phases
    gamePhase,
    setGamePhaseWithCleanup,
    handleSplashComplete,
    handleOnlineSelect,
    
    // Theme and language
    gameTheme,
    handleThemeSelect,
    language,
    toggleLanguage,
    getBackgroundImage,
    
    // Game configuration
    difficulty,
    setDifficulty,
    playerCount,
    setPlayerCount,
    isOnline,
    setIsOnline,
    
    // Game state
    cards,
    setCards,
    characters,
    setCharacters,
    flippedIndices,
    setFlippedIndices,
    matchedPairs,
    setMatchedPairs,
    matchedBy,
    setMatchedBy,
    currentPlayer,
    setCurrentPlayer,
    playerScores,
    setPlayerScores,
    playerMoves,
    setPlayerMoves,
    moves,
    setMoves,
    showPlayerTurn,
    setShowPlayerTurn,
    shuffling,
    setShuffling,
    playerNames,
    setPlayerNames,
    initializePlayers,
    switchPlayer,
    
    // Timer
    gameTime,
    setGameTime,
    timerActive,
    setTimerActive,
    timerResetKey,
    setTimerResetKey,
    formatTime,
    
    // Layout
    calculateStyles,
    
    // Multiplayer
    multiplayerData,
    setMultiplayerData,
    handleOnlineCardClick,
    layoutConfig
  } = useGameContext();

  // Handle card click (delegating to online or local handler)
  const handleCardClick = (index) => {
    if (isOnline) {
      // For online games, just send to server
      handleOnlineCardClick(index);
    } else {
      // For local games, handle locally
      handleLocalCardClick({
        index,
        cards,
        flippedIndices,
        matchedPairs,
        characters,
        moves,
        playerCount,
        playerMoves,
        currentPlayer,
        playerScores,
        setFlippedIndices,
        setMatchedPairs,
        setMatchedBy,
        setMoves,
        setPlayerMoves,
        setPlayerScores,
        switchPlayer,
        setTimerActive,
        timerActive,
        setGamePhaseWithCleanup
      });
    }
  };

  // Initialize local game
  const initializeLocalGame = () => {
    initializeGame({
      gameTheme,
      difficulty,
      language,
      playerCount,
      playerNames,
      setShuffling,
      setGamePhaseWithCleanup,
      setFlippedIndices,
      setMatchedPairs,
      setMatchedBy,
      setMoves,
      setGameTime,
      setTimerResetKey,
      setTimerActive,
      setCards,
      setCharacters,
      initializePlayers
    });
  };

  // Handle player selection and game start
  const handleStartGame = (names) => {
    setPlayerNames(names);
    initializeLocalGame();
  };

  // Phase controller - determine which component to show based on current phase
  const phaseController = () => {
    switch (gamePhase) {
      case "splash":
        return (
          <SplashScreen 
            onComplete={(theme) => handleSplashComplete(theme, handleThemeSelect)}
            initialTheme={gameTheme}
            language={language}
          />
        );
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
              language={language}
              toggleLanguage={toggleLanguage}
              handleThemeSelect={handleThemeSelect}
              handleOnlineSelect={(online) => handleOnlineSelect(online, setIsOnline)}
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
              setDifficulty={setDifficulty}
              playerCount={playerCount}
              handlePlayerCountSelect={setPlayerCount}
              setGamePhase={setGamePhaseWithCleanup}
              handleStartGame={handleStartGame}
              playerNames={playerNames}
              setPlayerNames={setPlayerNames}
              gameTheme={gameTheme}
              language={language}
              toggleLanguage={toggleLanguage}
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
              setGameTheme={handleThemeSelect}
              language={language}
              toggleLanguage={toggleLanguage}
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
                setGameTheme={handleThemeSelect}
                difficulty={difficulty}
                setDifficulty={setDifficulty}
                setCards={setCards}
                setMatchedPairs={setMatchedPairs}
                setFlippedIndices={setFlippedIndices}
                setPlayerScores={setPlayerScores}
                setCurrentPlayer={setCurrentPlayer}
                setPlayerNames={setPlayerNames}
                setMatchedBy={setMatchedBy}
                setShowPlayerTurn={setShowPlayerTurn}
                language={language}
                toggleLanguage={toggleLanguage}
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
              styles={calculateStyles()}
              gameTheme={gameTheme}
              language={language}
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
              styles={calculateStyles()}
              difficulty={difficulty}
              playerCount={playerCount}
              moves={moves}
              playerScores={playerScores}
              currentPlayer={currentPlayer}
              showPlayerTurn={showPlayerTurn}
              initializeGame={initializeLocalGame}
              characters={characters}
              setGamePhase={setGamePhaseWithCleanup}
              playerNames={playerNames}
              gameTheme={gameTheme}
              setGameTheme={handleThemeSelect}
              isOnline={isOnline}
              layoutConfig={layoutConfig}
              language={language}
              toggleLanguage={toggleLanguage}
              timerActive={timerActive}
              timerResetKey={timerResetKey}
              onTimeUpdate={setGameTime}
              roomId={multiplayerData.roomId}
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
              initializeGame={isOnline ? () => setGamePhaseWithCleanup("waiting_room") : initializeLocalGame}
              setGamePhase={setGamePhaseWithCleanup}
              playerNames={playerNames}
              gameTheme={gameTheme}
              isOnline={isOnline}
              roomId={multiplayerData.roomId}
              language={language}
              toggleLanguage={toggleLanguage}
              completionTime={gameTime}
            />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Get the current background image based on theme
  const backgroundImage = getBackgroundImage();

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-2 sm:p-4 bg-gray-900 relative overflow-hidden ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Language toggle in fixed position */}
      {gamePhase !== "splash" && gamePhase !== "game_board" && (
        <div className="fixed top-3 right-3 z-50">
          <LanguageToggle 
            language={language} 
            toggleLanguage={toggleLanguage} 
            gameTheme={gameTheme}
          />
        </div>
      )}
      
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

/**
 * App Component (wraps with context provider)
 */
const App = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default App;