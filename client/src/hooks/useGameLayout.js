import { useState, useCallback, useEffect } from 'react';
import { DIFFICULTY_CONFIG } from '../constants';

const useGameLayout = ({ difficulty, cards, isOnline }) => {
  // Window size for responsive design
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Handle window resize
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

  // Calculate styles based on window size and game configuration
  const calculateStyles = useCallback(() => {
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
      } else if (totalCards > 0) {
        // Fallback - calculate a reasonable layout if number of cards doesn't match predefined layouts
        const cols = Math.ceil(Math.sqrt(totalCards));
        const rows = Math.ceil(totalCards / cols);
        config = {
          pairs: totalCards / 2,
          cols: cols,
          rows: rows
        };
      } else {
        // No cards yet, use difficulty-based default
        config = DIFFICULTY_CONFIG[difficulty];
      }
    } else {
      // For local games, use the difficulty-based configuration
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
  }, [difficulty, windowSize, isOnline, cards.length]);

  return {
    windowSize,
    calculateStyles
  };
};

export default useGameLayout;