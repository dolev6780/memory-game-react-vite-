import React from "react";
import { motion } from "framer-motion";
import { getText } from "../themeConfig";
import paw from '../assets/paw.png';
import earth from '../assets/earth.png';

const ShufflingScreen = ({ 
  characters, 
  shuffling, 
  styles, 
  gameTheme = "animals",
  language = "en"
}) => {
  // Define theme-specific styles with improved colors and better fallbacks
  const themeStyles = {
    animals: {
      container: "bg-green-950/80 border-green-800/50",
      title: "text-green-400",
      subtitle: "text-green-300",
      cardGradient: "linear-gradient(135deg, #22c55e, #16a34a)",
      cardBorder: "2px solid #15803d",
      circleBg: "bg-green-600",
      textColor: "text-white",
      logo: paw
    },
    flags: {
      container: "bg-blue-950/80 border-blue-800/50",
      title: "text-blue-400",
      subtitle: "text-blue-300",
      cardGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      cardBorder: "2px solid #1e40af",
      circleBg: "bg-blue-600",
      textColor: "text-white",
      logo: earth
    }
  };

  // Get current theme styles with fallback to animals theme
  const currentTheme = themeStyles[gameTheme] || themeStyles.animals;

  // Enhanced card animation variants for smoother shuffling
  const cardVariants = {
    shuffle: (index) => ({
      rotateY: [0, 180, 360],
      rotateZ: [0, index % 2 === 0 ? 5 : -5, 0],
      y: [0, -15, 0],
      scale: [1, 1.08, 0.95, 1],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        repeatType: "loop",
        delay: index * 0.08,
        ease: "easeInOut"
      },
    }),
    idle: {
      rotateY: 0,
      rotateZ: 0,
      y: 0,
      scale: 1,
    },
  };

  const getThemeName = () => {
    try {
      return getText(gameTheme, language, "themeTitle");
    } catch (e) {
      return gameTheme === "animals" ? "Animals" : "Flags";
    }
  };
  
  const themeName = getThemeName();

  // Improved shuffling text with better fallbacks
  const getShufflingText = () => {
    try {
      return getText(gameTheme, language, "shufflingText") || 
        `Preparing ${themeName} memory challenge...`;
    } catch (e) {
      return `Shuffling cards...`;
    }
  };

  // Get difficulty text with card count
  const getDifficultyText = () => {
    const pairCount = characters.length;
    let difficultyLevel = "";
    
    if (pairCount <= 6) {
      difficultyLevel = language === "en" ? "Easy" : "קל";
    } else if (pairCount <= 10) {
      difficultyLevel = language === "en" ? "Medium" : "בינוני";
    } else {
      difficultyLevel = language === "en" ? "Hard" : "קשה";
    }
    
    return language === "en" 
      ? `${difficultyLevel} mode - ${pairCount} pairs`
      : `מצב ${difficultyLevel} - ${pairCount} זוגות`;
  };

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${currentTheme.container} rounded-xl backdrop-blur-md shadow-2xl border max-w-4xl mx-auto`}>
      <motion.h2
        className={`text-xl sm:text-2xl font-bold ${currentTheme.title} mb-4`}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
          textShadow: [
            "0 0 5px rgba(255,255,255,0.1)",
            "0 0 10px rgba(255,255,255,0.3)",
            "0 0 5px rgba(255,255,255,0.1)"
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {getShufflingText()}
      </motion.h2>
      
      {/* Difficulty indicator */}
      <motion.div
        className={`mb-4 text-sm ${currentTheme.subtitle} font-medium px-3 py-1 rounded-full bg-black/20`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {getDifficultyText()}
      </motion.div>

      {/* Card grid - using exact number of cards based on difficulty */}
      <div style={{...styles.container, padding: "1rem", borderRadius: "0.75rem"}}>
        <div style={styles.cardGrid}>
          {/* Use the full number of cards (characters * 2) */}
          {Array.from({ length: characters.length * 2 }).map((_, index) => (
            <motion.div
              key={index}
              style={styles.card}
              variants={cardVariants}
              animate={shuffling ? "shuffle" : "idle"}
              custom={index}
              whileHover={{ scale: 1.05, zIndex: 10 }}
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
                  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  position: "relative",
                  overflow: "hidden"
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

                {/* Card content with logo image instead of initials */}
                <div
                  className={`rounded-full ${currentTheme.circleBg} flex items-center justify-center ${currentTheme.textColor} shadow-inner`}
                  style={{
                    width: "60%",
                    height: "60%",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)",
                    zIndex: 2,
                    padding: "12%"
                  }}
                >
                  {/* Logo image */}
                  <motion.img 
                    src={currentTheme.logo} 
                    alt={gameTheme === "animals" ? "Paw" : "Earth"}
                    className="w-full h-full object-contain"
                    animate={{
                      rotate: shuffling ? [0, 360] : 0
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Theme icon and text */}
      <motion.div
        className={`mt-6 flex items-center gap-2 ${currentTheme.subtitle} text-center px-4`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <img 
          src={currentTheme.logo} 
          alt={gameTheme === "animals" ? "Paw" : "Earth"} 
          className="w-5 h-5 opacity-80"
        />
        <LoadingText text={`${themeName} memory challenge`} />
      </motion.div>
    </div>
  );
};

// Loading text component with animated dots
const LoadingText = ({ text }) => {
  return (
    <div className="flex justify-center items-center space-x-1">
      <span>{text}</span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, repeatType: "loop" }}
      >
        .
      </motion.span>
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, repeatType: "loop" }}
      >
        .
      </motion.span>
    </div>
  );
};

export default ShufflingScreen;