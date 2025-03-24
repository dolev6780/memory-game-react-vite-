// Enhanced utility functions for the Dragon Ball Memory Game

/**
 * Get a readable name for each difficulty level
 * @param {string} difficulty - The difficulty level (easy, medium, hard)
 * @returns {string} The formatted difficulty name
 */
export const getDifficultyName = (difficulty) => {
    const difficultyMap = {
      easy: "Easy (6 Pairs)",
      medium: "Medium (10 Pairs)",
      hard: "Hard (15 Pairs)",
    };
    
    return difficultyMap[difficulty] || "Unknown Difficulty";
  };
  
  /**
   * Calculate score based on moves and pair count
   * @param {number} moves - Total number of moves made
   * @param {number} pairs - Number of pairs in the game
   * @returns {object} Score information including rating and performance text
   */
  export const calculateScore = (moves, pairs) => {
    // Perfect score would be exactly pairs*2 moves (minimum possible)
    const minPossibleMoves = pairs * 2;
    const movesRatio = minPossibleMoves / moves;
    
    let rating, performanceText;
    
    if (movesRatio >= 0.85) {
      rating = 5; // Excellent (close to minimum possible moves)
      performanceText = "Memory Master!";
    } else if (movesRatio >= 0.7) {
      rating = 4; // Very good
      performanceText = "Excellent Memory!";
    } else if (movesRatio >= 0.5) {
      rating = 3; // Good
      performanceText = "Good Job!";
    } else if (movesRatio >= 0.35) {
      rating = 2; // Okay
      performanceText = "Getting There!";
    } else {
      rating = 1; // Could improve
      performanceText = "Keep Practicing!";
    }
    
    return {
      rating,
      performanceText,
      movesRatio,
      perfectMoves: minPossibleMoves
    };
  };
  
  /**
   * Format time in seconds to MM:SS format
   * @param {number} seconds - Time in seconds
   * @returns {string} Formatted time string
   */
  export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Apply custom animation class based on match result
   * @param {boolean} isMatched - Whether cards were matched
   * @returns {string} CSS animation class name
   */
  export const getMatchAnimation = (isMatched) => {
    return isMatched ? "animate-match-success" : "animate-match-fail";
  };
  
  /**
   * Get responsive dimensions for the game grid
   * @param {string} difficulty - Difficulty level
   * @param {object} windowSize - Current window dimensions
   * @returns {object} Responsive layout configuration
   */
  export const getResponsiveLayout = (difficulty, windowSize) => {
    // Difficulty config with columns and rows
    const difficultyConfig = {
      easy: { pairs: 6, cols: 4, rows: 3 },
      medium: { pairs: 10, cols: 5, rows: 4 },
      hard: { pairs: 15, cols: 6, rows: 5 }
    };
    
    const config = difficultyConfig[difficulty];
    const isSmallScreen = windowSize.width < 640;
    const isMediumScreen = windowSize.width >= 640 && windowSize.width < 1024;
    
    // Adjust columns for small screens to improve mobile usability
    if (isSmallScreen && difficulty === 'hard') {
      config.cols = 5; // Reduce columns on small screens for hard difficulty
      config.rows = 6; // Adjust rows to maintain pair count
    } else if (isSmallScreen && difficulty === 'medium') {
      config.cols = 4; // Reduce columns on small screens for medium difficulty
      config.rows = 5; // Adjust rows to maintain pair count
    }
    
    // Calculate card dimensions based on available screen space
    let cardWidth, cardHeight, gapSize;
    
    if (isSmallScreen) {
      const availableWidth = Math.min(windowSize.width - 32, 400);
      cardWidth = Math.floor((availableWidth - (config.cols - 1) * 8) / config.cols);
      cardHeight = Math.floor(cardWidth * 1.4);
      gapSize = 8;
    } else if (isMediumScreen) {
      const availableWidth = Math.min(windowSize.width - 48, 700);
      cardWidth = Math.floor((availableWidth - (config.cols - 1) * 10) / config.cols);
      cardHeight = Math.floor(cardWidth * 1.4);
      gapSize = 10;
    } else {
      const availableWidth = Math.min(windowSize.width - 64, 900);
      cardWidth = Math.floor((availableWidth - (config.cols - 1) * 12) / config.cols);
      cardHeight = Math.floor(cardWidth * 1.4);
      gapSize = 12;
    }
    
    return {
      ...config,
      cardWidth,
      cardHeight,
      gapSize,
      gridWidth: cardWidth * config.cols + (config.cols - 1) * gapSize,
      gridHeight: cardHeight * config.rows + (config.rows - 1) * gapSize
    };
  };
  
  export default {
    getDifficultyName,
    calculateScore,
    formatTime,
    getMatchAnimation,
    getResponsiveLayout
  };