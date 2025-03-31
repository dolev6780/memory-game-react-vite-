import React from "react";
import { motion } from "framer-motion";
import { getText } from "../themeConfig"; // Import the getText function

const ShufflingScreen = ({ 
  characters, 
  shuffling, 
  styles, 
  gameTheme = "dragonball",
  language = "en" // Add language prop with default value
}) => {
  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-black/80 border-orange-900/50",
      title: "text-yellow-400",
      subtitle: "text-orange-300",
      cardGradient: "linear-gradient(135deg, #ff9800, #e65100)",
      cardBorder: "2px solid #e65100",
      circleBg: "bg-orange-600",
      textColor: "text-white",
      initials: getText(gameTheme, language, "cardInitials") || "DB"
    },
    pokemon: {
      container: "bg-blue-950/80 border-blue-800/50",
      title: "text-yellow-300",
      subtitle: "text-blue-300",
      cardGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      cardBorder: "2px solid #1e40af",
      circleBg: "bg-yellow-500",
      textColor: "text-blue-900",
      initials: getText(gameTheme, language, "cardInitials") || "PK"
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  // Card animation variants
  const cardVariants = {
    shuffle: (index) => ({
      rotateY: [0, 180, 0],
      rotateZ: [0, index % 2 === 0 ? 5 : -5, 0],
      y: [0, -10, 0],
      scale: [1, 1.05, 0.95, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop",
        delay: index * 0.05,
      },
    }),
    idle: {
      rotateY: 0,
      rotateZ: 0,
      y: 0,
      scale: 1,
    },
  };

  // Get the theme name for display
  const themeName = gameTheme === "dragonball" ? 
    getText(gameTheme, language, "themeTitle") : 
    getText("pokemon", language, "themeTitle");

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${currentTheme.container} rounded-xl backdrop-blur-md shadow-2xl border`}>
      <motion.h2
        className={`text-xl sm:text-2xl font-bold ${currentTheme.title} mb-6`}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {getText(gameTheme, language, "shufflingText", null) || "Shuffling Cards..."}
      </motion.h2>

      <div style={styles.container}>
        <div style={styles.cardGrid}>
          {Array.from({ length: characters.length * 2 }).map((_, index) => (
            <motion.div
              key={index}
              style={styles.card}
              variants={cardVariants}
              animate={shuffling ? "shuffle" : "idle"}
              custom={index}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: currentTheme.cardGradient,
                  border: currentTheme.cardBorder,
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  className={`rounded-full ${currentTheme.circleBg} flex items-center justify-center ${currentTheme.textColor} font-bold shadow-inner`}
                  style={{
                    width: "40%",
                    height: "40%",
                    fontSize: styles.fontSize.title,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  {currentTheme.initials}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className={`mt-6 text-sm ${currentTheme.subtitle}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {getText(gameTheme, language, "shufflingText", null) || `Preparing an exciting ${themeName} memory challenge...`}
      </motion.div>
    </div>
  );
};

export default ShufflingScreen;