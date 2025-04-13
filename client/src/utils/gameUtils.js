import { v4 as uuidv4 } from 'uuid';
import { animalCharacters, flagCharacters, getCharacterName } from '../themeConfig';
import { DIFFICULTY_CONFIG } from '../constants';

export const initializeGame = ({
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
}) => {
  setGameTime(0);
  setTimerResetKey(prev => prev + 1);
  setTimerActive(false);

  setShuffling(true);
  setGamePhaseWithCleanup("shuffling");
  setFlippedIndices([]);
  setMatchedPairs([]);
  setMatchedBy({});
  setMoves(0);

  // Get the appropriate character set
  const characterSet = gameTheme === "animals" ? animalCharacters : flagCharacters;

  // Select characters based on difficulty
  const config = DIFFICULTY_CONFIG[difficulty];
  const shuffledCharacters = [...characterSet].sort(() => Math.random() - 0.5);
  const selectedCharacters = shuffledCharacters.slice(0, config.pairs);
  setCharacters(selectedCharacters);

  // Create card pairs with theme information
  const cardPairs = selectedCharacters.flatMap((character) => [
    { 
      ...character, 
      uniqueId: uuidv4(), 
      cardTheme: gameTheme,
      displayName: getCharacterName(character, language)
    },
    { 
      ...character, 
      uniqueId: uuidv4(), 
      cardTheme: gameTheme,
      displayName: getCharacterName(character, language)
    },
  ]);

  // Shuffle cards
  const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
  setCards(shuffledCards);

  // Initialize player scores for multiplayer
  if (playerCount > 1) {
    initializePlayers();
  }

  // Start game after a delay
  setTimeout(() => {
    setShuffling(false);
    setGamePhaseWithCleanup("game_board");
    
    // Start timer after transition
    setTimeout(() => {
      setTimerActive(true);
    }, 500);
  }, 1500);

  return {
    cards: shuffledCards,
    characters: selectedCharacters
  };
};


export const handleLocalCardClick = ({
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
}) => {
  if (moves === 0 && !timerActive) {
    setTimerActive(true);
  }

  // Need to ensure cards array is valid before proceeding
  if (!cards || !cards[index]) {
    console.error("Invalid cards array or index", index);
    return;
  }

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
      const newMatchedPairs = [...matchedPairs, cardId];
      setMatchedPairs(newMatchedPairs);
      
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
      if (newMatchedPairs.length === characters.length) {
        setTimerActive(false);
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
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};


export const getGameRating = ({ moves, difficulty, language }) => {
  const ratings = {
    easy: {
      excellent: 8,
      good: 10,
      average: 13,
    },
    medium: {
      excellent: 14,
      good: 18,
      average: 22,
    },
    hard: {
      excellent: 20,
      good: 26,
      average: 32,
    }
  };

  const thresholds = ratings[difficulty];
  
  if (moves <= thresholds.excellent) {
    return language === 'en' ? 'Memory Master!' : 'אלוף הזיכרון!';
  } else if (moves <= thresholds.good) {
    return language === 'en' ? 'Excellent Memory!' : 'זיכרון מצוין!';
  } else if (moves <= thresholds.average) {
    return language === 'en' ? 'Good Job!' : 'עבודה טובה!';
  } else {
    return language === 'en' ? 'Keep Practicing!' : 'המשיכו להתאמן!';
  }
};