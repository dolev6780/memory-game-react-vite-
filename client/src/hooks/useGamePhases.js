import { useState, useCallback } from 'react';
import socketService from '../services/socketService';

const useGamePhases = (initialPhase = 'splash') => {
  // Current game phase
  const [gamePhase, setGamePhase] = useState(initialPhase);

  // Define a cleanup function to handle phase transitions
  const cleanupPhaseTransition = useCallback((oldPhase, newPhase) => {
    console.log(`Phase transition: ${oldPhase} -> ${newPhase}`);
    
    // Clean up based on the phase we're leaving
    if (oldPhase === "online_lobby" || oldPhase === "waiting_room") {
      // If we're leaving any online screen without going to another online screen
      if (newPhase !== "online_lobby" && newPhase !== "waiting_room" && newPhase !== "game_board" && newPhase !== "game_over") {
        socketService.resetState();
      }
    }
  }, []);

  // Change phase with proper cleanup
  const setGamePhaseWithCleanup = useCallback((newPhase, { 
    setTimerActive = null, 
    setGameTime = null, 
    setTimerResetKey = null,
    setFlippedIndices = null,
    setMatchedPairs = null,
    setMatchedBy = null
  } = {}) => {
    cleanupPhaseTransition(gamePhase, newPhase);
    
    // Stop timer when leaving game board
    if (gamePhase === "game_board" && newPhase !== "game_board") {
      if (setTimerActive) setTimerActive(false);
    }
    
    // Reset timer when returning to intro/lobby from game over
    if (gamePhase === "game_over" && (newPhase === "intro" || newPhase === "online_lobby")) {
      if (setTimerResetKey) setTimerResetKey(prev => prev + 1);
      if (setGameTime) setGameTime(0);
    }
    
    // Special handling for game_over to waiting_room transition (play again)
    if (gamePhase === "game_over" && newPhase === "waiting_room") {
      if (setFlippedIndices) setFlippedIndices([]);
      if (setMatchedPairs) setMatchedPairs([]);
      if (setMatchedBy) setMatchedBy({});
      if (setGameTime) setGameTime(0);
      if (setTimerResetKey) setTimerResetKey(prev => prev + 1);
      if (setTimerActive) setTimerActive(false);
    }
  
    setGamePhase(newPhase);
  }, [gamePhase, cleanupPhaseTransition]);

  // Handle splash screen completion
  const handleSplashComplete = useCallback((selectedTheme, setGameTheme) => {
    if (selectedTheme && setGameTheme) {
      setGameTheme(selectedTheme);
    }
    setGamePhase("intro");
  }, []);

  // Handle online/offline mode selection
  const handleOnlineSelect = useCallback((online, setIsOnline) => {
    setIsOnline(online);
    setGamePhaseWithCleanup(online ? "online_lobby" : "player_select");
  }, [setGamePhaseWithCleanup]);

  return {
    gamePhase,
    setGamePhase,
    setGamePhaseWithCleanup,
    handleSplashComplete,
    handleOnlineSelect
  };
};

export default useGamePhases;