import React from "react";
import { motion } from "framer-motion";
import paw from '../assets/paw.png';
import earth from '../assets/earth.png';

const GameCard = ({
  card,
  index,
  isFlipped,
  isMatched,
  handleCardClick,
  styles,
  gameTheme = "animals",
  language = "he",
  matchedByText = "Matched by",
}) => {
  // Define theme-specific styles with updated themes
  const cardStyles = {
    animals: {
      cardGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      cardBorder: "2px solid #15803d",
      circleBg: "bg-green-600",
      matchedBadgeBg: "bg-green-500 bg-opacity-70",
      logo: paw,
      logoAlt: "Paw",
      imageFit: "object-cover" // Fill the card for animals (may crop)
    },
    flags: {
      cardGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      cardBorder: "2px solid #1e40af",
      circleBg: "bg-blue-600",
      matchedBadgeBg: "bg-blue-600 bg-opacity-70",
      logo: earth,
      logoAlt: "Earth",
      imageFit: "object-contain" // Show entire flag without cropping
    },
  };

  const cardTheme = card.cardTheme || gameTheme;

  // Get current theme styles with proper fallback
  const currentTheme = cardStyles[cardTheme] || cardStyles.animals;

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
            overflow: "hidden" // Add this to contain the shine effect
          }}
        >
          {/* Card shine effect */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "40%",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0))",
            borderRadius: "8px 8px 0 0"
          }} />
          
          {/* Logo container */}
          <div
            className={`rounded-full ${currentTheme.circleBg} flex items-center justify-center shadow-inner`}
            style={{
              width: "60%",
              height: "60%",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
              padding: "12%",
              zIndex: 2
            }}
          >
            {/* Theme logo instead of initials */}
            <img 
              src={currentTheme.logo} 
              alt={currentTheme.logoAlt}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Card Back (Character) */}
        <div
          style={{
            ...cardFaceStyles,
            backgroundColor: cardTheme === "flags" ? "#f8fafc" : "#000", // Light background for flags, dark for animals
            transform: "rotateY(180deg)",
            border: "2px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          {/* Image with darkened overlay for matched cards */}
          <div className="relative w-full h-full">
            {/* Image with theme-specific fitting */}
            <div className="w-full h-full flex items-center justify-center bg-white">
              <img
                src={card.image}
                alt={displayName}
                className={`w-full h-full ${currentTheme.imageFit} ${
                  isMatched ? "brightness-75" : ""
                }`}
                style={{
                  padding: cardTheme === "flags" ? "10px" : "0", // Add padding for flags
                  backgroundColor: cardTheme === "flags" ? "white" : "transparent" // White background for flags
                }}
              />
            </div>

            {/* Card name at the bottom */}
            <div
              className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent text-white text-center py-1 px-1"
              style={{
                fontSize: styles.fontSize?.name || "0.75rem",
                direction: language === "he" ? "rtl" : "ltr", // Fixed direction based on language
              }}
            >
              {displayName}
            </div>

            {/* Matched indicator with player name */}
            {isMatched && card.matchedBy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`${currentTheme.matchedBadgeBg} text-white  rounded-md shadow-lg text-center font-bold px-2 py-1`}
                  style={{
                    fontSize: styles.fontSize?.name || "0.75rem",
                    direction: language === "he" ? "rtl" : "ltr",
                  }}
                >
                  {/* Add the "Matched by" text before the player name */}
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