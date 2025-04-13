import React, { createContext, useContext } from 'react';
import useGameState from '../hooks/useGameState';
import useThemeLanguage from '../hooks/useThemeLanguage';
import useGamePhases from '../hooks/useGamePhases';
import useTimer from '../hooks/useTimer';
import useGameLayout from '../hooks/useGameLayout';
import useMultiplayer from '../hooks/useMultiplayer';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  // Initialize state and hooks
  const themeLanguage = useThemeLanguage('animals', 'he');
  const { gameTheme, language } = themeLanguage;
  
  // Game phase management
  const phaseManager = useGamePhases('splash');
  
  // Online/offline state
  const [isOnline, setIsOnline] = React.useState(false);
  
  // Difficulty setting
  const [difficulty, setDifficulty] = React.useState('medium');
  
  // Player count for local games
  const [playerCount, setPlayerCount] = React.useState(1);
  
  // Game state management
  const gameState = useGameState({
    gameTheme,
    language,
    difficulty,
    playerCount,
    isOnline
  });
  
  // Timer functionality
  const timer = useTimer();
  
  // Layout calculations
  const layout = useGameLayout({
    difficulty,
    cards: gameState.cards,
    isOnline
  });
  
  // Multiplayer functionality
  const multiplayer = useMultiplayer({
    isOnline,
    gameTheme,
    setGameTheme: themeLanguage.setGameTheme,
    language,
    difficulty,
    setDifficulty,
    gameState,
    gamePhase: phaseManager.gamePhase,
    setGamePhaseWithCleanup: phaseManager.setGamePhaseWithCleanup,
    gameTime: timer.gameTime
  });
  
  // Combine everything into the context value
  const contextValue = {
    ...themeLanguage,
    ...phaseManager,
    ...gameState,
    ...timer,
    ...layout,
    ...multiplayer,
    isOnline,
    setIsOnline,
    difficulty,
    setDifficulty,
    playerCount,
    setPlayerCount
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

/**
 * Custom hook to use the game context
 */
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export default GameContext;