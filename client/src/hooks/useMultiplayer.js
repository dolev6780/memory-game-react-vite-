import { useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { getCharacterName } from '../themeConfig';

const useMultiplayer = ({ 
  isOnline,
  gameTheme, 
  setGameTheme,
  language,
  difficulty, 
  setDifficulty,
  gameState,
  gamePhase,
  setGamePhaseWithCleanup,
  gameTime
}) => {
  // Destructure gameState props
  const {
    setCards,
    setFlippedIndices,
    setMatchedPairs,
    setMatchedBy,
    setPlayerScores,
    setPlayerNames,
    setTimerActive,
    setLayoutConfig,
    setGameTime,
    timerActive,
    setTimerResetKey
  } = gameState;

  // Ref to prevent infinite update loops
  const themeSynchronizedRef = useRef(false);
  const difficultyListenerRef = useRef(false);

  // Online multiplayer state
  const [multiplayerData, setMultiplayerData] = useState({
    roomId: null,
    isHost: false,
    players: [],
    gameState: null,
    gameTheme: null
  });

  // Theme synchronization effect
  useEffect(() => {
    // Only synchronize if not already done and if we have a theme to sync
    if (!themeSynchronizedRef.current && multiplayerData.gameTheme && multiplayerData.gameTheme !== gameTheme) {
      // Mark as synchronized
      themeSynchronizedRef.current = true;
      // Use a slight delay to ensure all components update properly
      const timerId = setTimeout(() => {
        setGameTheme(multiplayerData.gameTheme);
      }, 50);
      return () => clearTimeout(timerId);
    }
  }, [multiplayerData.gameTheme, gameTheme, setGameTheme]);

  // Difficulty synchronization effect
  useEffect(() => {
    // Skip if we've already set up this listener
    if (difficultyListenerRef.current) return;
    difficultyListenerRef.current = true;

    const handleDifficultyUpdate = (data) => {
      if (data.difficulty && data.difficulty !== difficulty) {
        setDifficulty(data.difficulty);
      }
    };

    socketService.on("difficultyUpdated", handleDifficultyUpdate);
    
    return () => {
      socketService.on("difficultyUpdated", null);
      difficultyListenerRef.current = false;
    };
  }, [difficulty, setDifficulty]);

  // Timer synchronization effect
  useEffect(() => {
    // Only the host should sync time to the server
    if (isOnline && timerActive && multiplayerData.isHost) {
      // Create a timer to sync game time every second
      const syncInterval = setInterval(() => {
        socketService.syncGameTime({
          roomId: multiplayerData.roomId,
          gameTime: gameTime
        });
      }, 1000);
      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [isOnline, timerActive, multiplayerData.isHost, multiplayerData.roomId, gameTime]);

  // Main socket listener setup
  useEffect(() => {
    if (!isOnline) return;
    
    // Clean up any existing listeners to prevent duplicates
    socketService.on("gameStarted", null);
    socketService.on("cardFlipped", null);
    socketService.on("turnUpdate", null);
    socketService.on("gameOver", null);
    socketService.on("gameReset", null);
    
    // Game started event
    socketService.on("gameStarted", (data) => {
      console.log("Game started event:", data);
      
      // If the server provided layout configuration, use it
      if (data.layoutConfig) {
        console.log("Using layout config from server:", data.layoutConfig);
        setLayoutConfig(data.layoutConfig);
      }
      
      // Make sure we're using the server's game state
      setFlippedIndices(data.gameState?.flippedIndices || []);
      setMatchedPairs(data.gameState?.matchedPairs || []);
      
      // Update matchedBy from server data
      if (data.gameState?.matchedBy) {
        console.log("Updating matchedBy from server:", data.gameState.matchedBy);
        setMatchedBy(data.gameState.matchedBy);
      } else {
        setMatchedBy({});
      }
      
      // If cards have theme information, update the local cards
      if (data.gameState && data.gameState.cards) {
        // Ensure cards have proper display names based on current language
        const updatedCards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || data.gameTheme || gameTheme,
          displayName: getCharacterName(card, language)
        }));
        setCards(updatedCards);
      }
      
      // Update difficulty if provided by server
      if (data.difficulty && data.difficulty !== difficulty) {
        console.log(`Updating difficulty: ${difficulty} -> ${data.difficulty}`);
        setDifficulty(data.difficulty);
      }
      
      // Update player information
      if (data.players && data.players.length > 0) {
        console.log("Updating player data from server:", data.players);
        
        // Update player scores
        setPlayerScores(data.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          moves: player.moves || 0
        })));
        
        // Update player names
        setPlayerNames(data.players.map(player => player.name));
      }
      
      // Reset and start timer for online game
      setGameTime(0);
      setTimerResetKey(prev => prev + 1);
      setTimerActive(true);
    });
    
    // Card flipped event
    socketService.on("cardFlipped", (data) => {
      // Make sure we're using the server's game state
      setFlippedIndices(data.gameState.flippedIndices);
      setMatchedPairs(data.gameState.matchedPairs);
      
      // Update matchedBy from server data
      if (data.gameState.matchedBy) {
        console.log("Updating matchedBy from cardFlipped:", data.gameState.matchedBy);
        setMatchedBy(data.gameState.matchedBy);
      }
      
      // If cards have theme information, update the local cards
      if (data.gameState.cards) {
        const updatedCards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || data.gameTheme || gameTheme,
          displayName: getCharacterName(card, language)
        }));
        setCards(updatedCards);
      }
      
      // Update player scores and names
      if (data.players && data.players.length > 0) {
        setPlayerScores(data.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          moves: player.moves || 0
        })));
        
        // Update player names
        setPlayerNames(data.players.map(player => player.name));
      }
      
      // Sync game time if provided
      if (data.gameTime !== undefined) {
        setGameTime(data.gameTime);
      }
    });
    
    // Turn update event
    socketService.on("turnUpdate", (data) => {
      // Update with server's game state
      setFlippedIndices(data.gameState.flippedIndices);
      setMatchedPairs(data.gameState.matchedPairs);
      
      // Update matchedBy from server data
      if (data.gameState.matchedBy) {
        console.log("Updating matchedBy from turnUpdate:", data.gameState.matchedBy);
        setMatchedBy(data.gameState.matchedBy);
      }
      
      // If cards have theme information, update the local cards
      if (data.gameState.cards) {
        const updatedCards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || data.gameTheme || gameTheme,
          displayName: getCharacterName(card, language)
        }));
        setCards(updatedCards);
      }
      
      // Update player scores and names
      if (data.players && data.players.length > 0) {
        setPlayerScores(data.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          moves: player.moves || 0
        })));
        
        // Update player names
        setPlayerNames(data.players.map(player => player.name));
      }
      
      // Sync game time if provided
      if (data.gameTime !== undefined) {
        setGameTime(data.gameTime);
      }
    });
    
    // Game over event
    socketService.on("gameOver", (data) => {
      // Update final game state
      setFlippedIndices(data.gameState.flippedIndices);
      setMatchedPairs(data.gameState.matchedPairs);
      
      // Update matchedBy from server data
      if (data.gameState.matchedBy) {
        console.log("Final matchedBy from gameOver:", data.gameState.matchedBy);
        setMatchedBy(data.gameState.matchedBy);
      }
      
      // If cards have theme information, update the local cards
      if (data.gameState.cards) {
        const updatedCards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || data.gameTheme || gameTheme,
          displayName: getCharacterName(card, language)
        }));
        setCards(updatedCards);
      }
      
      // Update player scores one last time
      if (data.players && data.players.length > 0) {
        setPlayerScores(data.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          moves: player.moves || 0
        })));
        
        // Update player names
        setPlayerNames(data.players.map(player => player.name));
      }
      
      // Sync final game time if provided
      if (data.gameTime !== undefined) {
        setGameTime(data.gameTime);
      }
      
      // Stop the timer
      setTimerActive(false);
      
      // Move to game over screen
      setTimeout(() => {
        setGamePhaseWithCleanup("game_over");
      }, 1000);
    });
    
    // Game reset event
    socketService.on("gameReset", (data) => {
      console.log("Game reset event received:", data);
      
      // Reset all game state
      setFlippedIndices([]);
      setMatchedPairs([]);
      setMatchedBy({});
      setCards([]);
      
      // Reset time
      setGameTime(0);
      setTimerResetKey(prev => prev + 1);
      setTimerActive(false);
      
      // Update player information
      if (data.players && data.players.length > 0) {
        console.log("Updating player data after reset:", data.players);
        
        // Update player scores
        setPlayerScores(data.players.map(player => ({
          id: player.id,
          name: player.name,
          score: player.score || 0,
          moves: player.moves || 0
        })));
        
        // Update player names
        setPlayerNames(data.players.map(player => player.name));
      }
      
      // Update difficulty if provided
      if (data.difficulty && data.difficulty !== difficulty) {
        console.log(`Updating difficulty after reset: ${difficulty} -> ${data.difficulty}`);
        setDifficulty(data.difficulty);
      }
      
      // Update theme if provided
      if (data.gameTheme && data.gameTheme !== gameTheme) {
        console.log(`Updating theme after reset: ${gameTheme} -> ${data.gameTheme}`);
        setGameTheme(data.gameTheme);
      }
    });
    
    // Clean up on component unmount
    return () => {
      socketService.on("gameStarted", null);
      socketService.on("cardFlipped", null);
      socketService.on("turnUpdate", null);
      socketService.on("gameOver", null);
      socketService.on("gameReset", null);
    };
  }, [
    isOnline, 
    difficulty, 
    gameTheme, 
    language, 
    setGamePhaseWithCleanup,
    setCards,
    setFlippedIndices,
    setMatchedPairs,
    setMatchedBy,
    setPlayerScores,
    setPlayerNames,
    setTimerActive,
    setLayoutConfig,
    setGameTime,
    setTimerResetKey,
    setDifficulty,
    setGameTheme
  ]);

  // Handle card click for online games
  const handleOnlineCardClick = (index) => {
    socketService.cardClick({
      roomId: multiplayerData.roomId,
      cardIndex: index,
      gameTime: gameTime
    });
  };

  return {
    multiplayerData,
    setMultiplayerData,
    handleOnlineCardClick,
  };
};

export default useMultiplayer;