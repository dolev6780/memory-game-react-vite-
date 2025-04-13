import { useState, useCallback, useRef } from 'react';
import { getCharacterName } from '../themeConfig';

const useGameState = ({ language, playerCount }) => {
  // Game state
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
  const [gameTime, setGameTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [layoutConfig, setLayoutConfig] = useState(null);
  
  // Ref to prevent infinite update loops when updating card names
  const languageUpdateRef = useRef(false);

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

  // Update card names when language changes
  const updateCardNames = useCallback(() => {
    // Skip if we're in the middle of an update already or no cards
    if (languageUpdateRef.current || cards.length === 0) return;
    
    // Set flag to prevent concurrent updates
    languageUpdateRef.current = true;
    
    // Create a safe shallow copy to work with
    const currentCards = [...cards];
    
    // Update card names when language changes
    const updatedCards = currentCards.map(card => ({
      ...card,
      displayName: getCharacterName(card, language)
    }));
    
    // Schedule update for next render cycle
    setTimeout(() => {
      setCards(updatedCards);
      // Reset flag after update
      languageUpdateRef.current = false;
    }, 0);
  }, [cards, language]);

  // Reset all game state
  const resetGameState = useCallback(() => {
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMatchedBy({});
    setMoves(0);
    setGameTime(0);
    setTimerResetKey(prev => prev + 1);
    setTimerActive(false);
    setShuffling(false);
  }, []);

  return {
    // State
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
    gameTime,
    setGameTime,
    timerActive,
    setTimerActive,
    timerResetKey,
    setTimerResetKey,
    layoutConfig,
    setLayoutConfig,
    
    // Actions
    initializePlayers,
    switchPlayer,
    updateCardNames,
    resetGameState,
    languageUpdateRef
  };
};

export default useGameState;