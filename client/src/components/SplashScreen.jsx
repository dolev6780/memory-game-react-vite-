import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dragonballBackgroundImage, pokemonBackgroundImage, getText, themeStyles } from "../themeConfig";

const SplashScreen = ({ onComplete, initialTheme = "dragonball", language = "he" }) => {
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState(initialTheme);
  const [showSplash, setShowSplash] = useState(true);
  const progressTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  // Get theme-specific styles from the central configuration
  const currentThemeStyles = themeStyles[theme] || themeStyles.dragonball;
  
  // Create theme elements from our centralized config
  const themeElements = {
    dragonball: {
      background: dragonballBackgroundImage,
      primaryColor: `from-${currentThemeStyles.colors.primary} to-${currentThemeStyles.colors.secondary}`,
      secondaryColor: `from-${currentThemeStyles.colors.accent} to-${currentThemeStyles.colors.highlight}`,
      primaryText: currentThemeStyles.text.title,
      secondaryText: currentThemeStyles.text.subtitle,
      logoText: getText(theme, language, "themeTitle"),
      footerText: getText(theme, language, "footerText"),
    },
    pokemon: {
      background: pokemonBackgroundImage,
      primaryColor: `from-${currentThemeStyles.colors.primary} to-${currentThemeStyles.colors.secondary}`,
      secondaryColor: `from-${currentThemeStyles.colors.accent} to-${currentThemeStyles.colors.highlight}`,
      primaryText: currentThemeStyles.text.title,
      secondaryText: currentThemeStyles.text.subtitle,
      logoText: getText(theme, language, "themeTitle"),
      footerText: getText(theme, language, "footerText"),
    }
  };

  const currentTheme = themeElements[theme] || themeElements.dragonball;

  // Optimize progress animation with useCallback and better timing
  const updateProgress = useCallback(() => {
    setProgress(prev => {
      // Increment by 5% at a time for better performance
      const newProgress = Math.min(prev + 5, 100);
      
      // When we reach 100%, schedule the transition
      if (newProgress >= 100 && !completeTimerRef.current) {
        completeTimerRef.current = setTimeout(() => {
          setShowSplash(false);
          
          // Notify parent after exit animation completes
          setTimeout(() => {
            onComplete(theme); // Pass the final theme to parent
          }, 500);
        }, 500);
      }
      
      return newProgress;
    });
  }, [onComplete, theme]);

  // Start and manage the progress animation with proper cleanup
  useEffect(() => {
    // Use a slower interval (80ms vs 30ms) for better performance
    progressTimerRef.current = setInterval(updateProgress, 80);
    
    // Cleanup timers to prevent memory leaks
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [updateProgress]);

  // Allow theme switching during splash for fun
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === "dragonball" ? "pokemon" : "dragonball");
  }, []);

  // Memoize the loading phrases to avoid recreating on each render
  const loadingPhrases = [
    "Shuffling cards...",
    "Powering up...",
    "Preparing challenges...",
    "Getting ready..."
  ];

  // Get current loading phrase based on progress with translations
  const getCurrentPhrase = useCallback(() => {
    const phrases = [
      getText(theme, language, "shufflingText"),
      getText(theme, language, "loading", "common"),
      getText(theme, language, "shufflingText"),
      getText(theme, language, "loading", "common")
    ];
    const index = Math.min(Math.floor(progress / 25), phrases.length - 1);
    return phrases[index];
  }, [progress, theme, language]);

  return (
    <AnimatePresence mode="wait">
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
        >
          {/* Background image - optimized with CSS classes instead of inline styles */}
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 z-0 transition-all duration-500`}
            style={{ backgroundImage: `url(${currentTheme.background})` }}
          />

          <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md w-full">
            {/* Logo animation - optimized animation config */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                damping: 12, 
                delay: 0.2,
                duration: 0.8
              }}
              onClick={toggleTheme}
              className="cursor-pointer mb-8"
            >
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className={`text-5xl sm:text-6xl font-bold ${currentTheme.primaryText}`}
                >
                  Memory Match
                </motion.div>
                <div className={`text-3xl sm:text-4xl font-semibold ${currentTheme.secondaryText} mt-2 transition-colors duration-300`}>
                  {currentTheme.logoText} Edition
                </div>
              </div>
            </motion.div>

            {/* Loading progress - simplified animation */}
            <div className="w-full max-w-xs mb-4">
              <div className="relative">
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-700 shadow-inner">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "tween", ease: "easeOut" }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${currentTheme.primaryColor}`}
                  />
                </div>
                <motion.div 
                  className="absolute -top-1 h-6 w-6 rounded-full bg-white"
                  style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
                  animate={{ 
                    boxShadow: [
                      `0 0 10px ${theme === "dragonball" ? "#ef4444" : "#3b82f6"}`,
                      `0 0 15px ${theme === "dragonball" ? "#ef4444" : "#3b82f6"}`,
                      `0 0 10px ${theme === "dragonball" ? "#ef4444" : "#3b82f6"}`
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                />
              </div>
              <div className="text-center mt-2 text-gray-300 transition-all duration-200">
                {progress}% • {getCurrentPhrase()}
              </div>
            </div>

            {/* Tips or info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-gray-400 text-sm mt-6"
            >
              <p>{currentTheme.footerText}</p>
              <p className="mt-2 text-xs">Tip: Test your memory with increasing difficulty</p>
            </motion.div>

            {/* Animated cards - optimized rendering with reduced elements */}
            <div className="absolute w-full h-full pointer-events-none overflow-hidden">
              {[...Array(4)].map((_, index) => (
                <motion.div
                  key={index}
                  className={`absolute w-16 h-20 rounded-lg bg-gradient-to-br ${
                    index % 2 === 0 ? currentTheme.primaryColor : currentTheme.secondaryColor
                  }`}
                  style={{
                    left: `${15 + (index * 18)}%`,
                    top: `${10 + (index * 12)}%`,
                  }}
                  initial={{ 
                    x: -100, 
                    y: -100, 
                    rotate: -180, 
                    opacity: 0 
                  }}
                  animate={{ 
                    x: 0, 
                    y: 0, 
                    rotate: 0, 
                    opacity: 0.6 
                  }}
                  transition={{
                    duration: 1,
                    delay: 0.1 * index,
                    type: "spring",
                    damping: 10
                  }}
                />
              ))}
            </div>
          </div>

          {/* Created by text */}
          <div className="absolute bottom-4 text-gray-500 text-xs">
            Created with ♥ • Memory Match Game 2025
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;