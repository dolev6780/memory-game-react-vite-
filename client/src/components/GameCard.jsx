import React from "react";
import { motion } from "framer-motion";
import { themeStyles } from "../themeConfig";

const GameCard = ({
  card,
  index,
  isFlipped,
  isMatched,
  handleCardClick,
  styles,
  gameTheme = "dragonball",
  language = "he",
  matchedByText = "Matched by",
}) => {
  // Get theme styles from centralized config
  const currentThemeConfig = themeStyles[gameTheme] || themeStyles.dragonball;

  // Define theme-specific styles
  const cardStyles = {
    dragonball: {
      cardGradient: "linear-gradient(135deg, #ff9800, #e65100)",
      cardBorder: "2px solid #e65100",
      circleBg: "bg-orange-600",
      matchedBadgeBg: "bg-orange-500 bg-opacity-70",
      initials: "DB"
    },
    pokemon: {
      cardGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      cardBorder: "2px solid #1e40af",
      circleBg: "bg-yellow-500",
      matchedBadgeBg: "bg-blue-600 bg-opacity-70",
      initials: "PK"
    },
  };

  // IMPORTANT: Use the card's theme if available, otherwise fall back to the game theme
  // This ensures cards are rendered with their intended theme regardless of client settings
  const cardTheme = card.cardTheme || gameTheme;

  // Get current theme styles
  const currentTheme = cardStyles[cardTheme] || cardStyles.dragonball;

  // Card styling with 3D flip effect
  const cardInnerStyles = {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
    transform: isFlipped || isMatched ? "rotateY(180deg)" : "",
  };

  // Common styles for both card faces
  const cardFaceStyles = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  };

  // Get the appropriate display name based on language
  const displayName =
    card.displayName ||
    (language === "en" ? card.name?.en : card.name?.he) ||
    card.name ||
    "";

  return (
    <motion.div
      style={styles.card}
      initial={{ scale: 0, rotateY: 0 }}
      animate={{
        scale: 1,
        rotateY: 0,
        transition: { delay: index * 0.01, duration: 0.2 },
      }}
      whileHover={{ scale: isFlipped || isMatched ? 1 : 1.03 }}
      whileTap={{ scale: isFlipped || isMatched ? 1 : 0.97 }}
      onClick={handleCardClick}
      className={isMatched ? "opacity-90" : ""}
    >
      <div style={cardInnerStyles}>
        {/* Card Front (Hidden side) */}
        <div
          style={{
            ...cardFaceStyles,
            background: currentTheme.cardGradient,
            border: currentTheme.cardBorder,
          }}
        >
          <div
            className={`rounded-full ${currentTheme.circleBg} flex items-center justify-center font-bold text-white shadow-inner`}
            style={{
              width: "50%",
              height: "50%",
              fontSize: styles.fontSize?.title || "1rem",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {currentTheme.initials}
          </div>
        </div>

        {/* Card Back (Character) */}
        <div
          style={{
            ...cardFaceStyles,
            backgroundColor: "#f5f5f5",
            transform: "rotateY(180deg)",
            border: "2px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          {/* Image with darkened overlay for matched cards */}
          <div className="relative w-full h-full">
            <img
              src={card.image}
              alt={displayName}
              className={`w-full h-full object-cover ${
                isMatched ? "brightness-75" : ""
              }`}
            />

            {/* Card name at the bottom */}
            <div
              className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent text-white text-center py-1 px-1"
              style={{
                fontSize: styles.fontSize?.name || "0.75rem",
                direction: "ltr",
              }}
            >
              {displayName}
            </div>

            {/* Matched indicator with player name */}
            {isMatched && card.matchedBy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`${currentTheme.matchedBadgeBg} text-white px-3 py-1.5 rounded-md shadow-lg text-center font-bold`}
                  style={{
                    fontSize: styles.fontSize?.name || "0.75rem",
                    direction: "ltr",
                  }}
                >
                 {card.matchedBy}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;