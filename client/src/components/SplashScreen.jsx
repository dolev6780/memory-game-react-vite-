import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getText } from "../themeConfig";
import splashBackground from '../assets/splashBackground.png';

const SplashScreen = ({ onComplete, language = "he" }) => {
  const [progress, setProgress] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const progressTimerRef = useRef(null);
  const completeTimerRef = useRef(null);
  const theme = "default";
  
  const colors = {
    primary: "#22c55e",   
    secondary: "#16a34a",  
    accent: "#3b82f6",     
    highlight: "#2563eb", 
    background: "#0f172a", 
    dark: "#0f172a",      
    light: "#f8fafc",      
  };

  // Optimize progress animation with useCallback and better timing
  const updateProgress = useCallback(() => {
    setProgress(prev => {
      // Increment by 2% at a time for better performance
      const newProgress = Math.min(prev + 2, 100);
      
      // When we reach 100%, schedule the transition
      if (newProgress >= 100 && !completeTimerRef.current) {
        completeTimerRef.current = setTimeout(() => {
          setShowSplash(false);
          
          // Notify parent after exit animation completes
          setTimeout(() => {
            onComplete(); 
          }, 500);
        }, 500);
      }
      return newProgress;
    });
  }, [onComplete]);

  // Start and manage the progress animation with proper cleanup
  useEffect(() => {
    progressTimerRef.current = setInterval(updateProgress, 80);
    
    // Cleanup timers to prevent memory leaks
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    };
  }, [updateProgress]);

  // Memoize the loading phrases to avoid recreating on each render
  const loadingPhrases = [
    "Shuffling cards...",
    "Powering up...",
    "Preparing challenges...",
    "Getting ready..."
  ];

  // Get current loading phrase based on progress
  const getCurrentPhrase = useCallback(() => {
    try {
      const phrases = [
        getText(theme, language, "shufflingText"),
        getText(theme, language, "loading", "common"),
        getText(theme, language, "shufflingText"),
        getText(theme, language, "loading", "common")
      ];
      const index = Math.min(Math.floor(progress / 25), phrases.length - 1);
      return phrases[index] || loadingPhrases[index];
    } catch (e) {
      // Fallback to English phrases if getText fails
      const index = Math.min(Math.floor(progress / 25), loadingPhrases.length - 1);
      return loadingPhrases[index];
    }
  }, [progress, language]);

  return (
    <AnimatePresence mode="wait">
      {showSplash && (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
          style={{
            background: `linear-gradient(to bottom right, #1e293b, ${colors.dark})` 
          }}
        >
          {/* Animated background overlay */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 transition-all duration-500"
              style={{ backgroundImage: `url(${splashBackground})` }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-8 max-w-md w-full">
            {/* Main title with enhanced animations */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                damping: 12, 
                delay: 0.2,
                duration: 0.8
              }}
              className="mb-8"
            >
              <div className="flex flex-col items-center justify-center">
                {/* Animated title with glow effect */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    textShadow: [
                      `0 0 8px rgba(34, 197, 94, 0.5)`,
                      `0 0 16px rgba(34, 197, 94, 0.8)`,
                      `0 0 8px rgba(34, 197, 94, 0.5)`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                  className="text-5xl sm:text-6xl font-bold text-white"
                >
                  Memory Game
                </motion.div>
                
                {/* Subtitle with animated reveal */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-xl sm:text-2xl mt-2 font-medium"
                  style={{ color: "#86efac" }} // Light green color for better contrast
                >
                  Challenge Your Brain
                </motion.div>
              </div>
            </motion.div>

            {/* IMPROVED PROGRESS BAR */}
            <div className="w-full max-w-sm mb-6">
              {/* Progress label above bar */}
              <div className="flex justify-between items-center mb-1 px-1">
                <div className="text-sm font-semibold text-gray-300">Loading...</div>
                <div className="text-sm font-medium text-gray-300">{progress}%</div>
              </div>
              
              {/* Progress bar container */}
              <div className="relative h-3 w-full">
                {/* Background track */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                ></div>
                
                {/* Glowing trail effect */}
                <motion.div 
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ 
                    width: `${progress}%`,
                    background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`,
                    boxShadow: `0 0 10px rgba(34, 197, 94, 0.5), 0 0 5px rgba(34, 197, 94, 0.8) inset`,
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                ></motion.div>
                
                {/* Animated highlight effect */}
                <motion.div 
                  className="absolute inset-y-0 left-0 rounded-full h-full opacity-80"
                  style={{
                    background: "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                    width: `${progress}%`,
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
                ></motion.div>
                
                {/* Animated segments effect */}
                <div className="absolute inset-0 overflow-hidden">
                  {Array.from({ length: 20 }).map((_, idx) => (
                    <motion.div
                      key={idx}
                      className="absolute top-0 bottom-0 w-1 opacity-20 bg-white"
                      style={{
                        left: `${idx * 5}%`,
                        display: progress >= idx * 5 ? 'block' : 'none'
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: idx * 0.02 }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Tips or info with enhanced animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-sm mt-6 px-6 py-4 rounded-lg backdrop-blur-md bg-white/5"
            >
              <p className="text-gray-300">Match pairs of cards to test your memory skills</p>
              <p className="mt-2 text-xs text-gray-400">Tip: Test your memory with increasing difficulty levels</p>
            </motion.div>

            {/* Enhanced animated cards with proper gradients */}
            <div className="absolute w-full h-full pointer-events-none overflow-hidden">
              {[...Array(6)].map((_, index) => {
                // Generate different colors and positions for variety
                const isEven = index % 2 === 0;
                const gradientStart = isEven ? colors.primary : colors.accent;
                const gradientEnd = isEven ? colors.secondary : colors.highlight;
                
                return (
                  <motion.div
                    key={index}
                    className="absolute rounded-lg shadow-xl"
                    style={{
                      width: index % 3 === 0 ? "64px" : "56px",
                      height: index % 3 === 0 ? "80px" : "70px",
                      left: `${10 + (index * 15)}%`,
                      top: `${5 + (index * 10)}%`,
                      background: `linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd})`,
                      border: "2px solid rgba(255,255,255,0.1)",
                    }}
                    initial={{ 
                      x: Math.random() * -150 - 50, 
                      y: Math.random() * -150 - 50, 
                      rotate: Math.random() * -180 - 90, 
                      opacity: 0 
                    }}
                    animate={{ 
                      x: 0, 
                      y: 0, 
                      rotate: 0, 
                      opacity: 0.8 
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.2 + (index * 0.1),
                      type: "spring",
                      damping: 12
                    }}
                    // Add subtle float animation
                    whileInView={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0, -5, 0],
                      transition: {
                        delay: 1 + index * 0.2,
                        duration: 5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                  >
                    {/* Card content */}
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      <span className="text-xs opacity-80">
                        {isEven ? "?" : "!"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-4 text-gray-500 text-xs px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm"
          >
            Created by C.A.I Software Solutions • Memory Match Game 2025
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;