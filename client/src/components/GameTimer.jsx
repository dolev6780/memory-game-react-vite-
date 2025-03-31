import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getText } from "../themeConfig";

const GameTimer = ({
  gameTheme = "dragonball",
  language = "en",
  isActive = false,
  onTimeUpdate = null,
  resetKey = 0,
  size = "medium", // small, medium, large
  isOnline = false // Add isOnline prop
}) => {
  // State for tracking time
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(0); // Keep track of last time we updated parent
  
  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-orange-900/30",
      text: "text-yellow-400",
      icon: "text-orange-400",
      border: "border-orange-800/50",
      onlineIndicator: "bg-orange-600"
    },
    pokemon: {
      container: "bg-blue-900/30",
      text: "text-blue-400",
      icon: "text-yellow-400",
      border: "border-blue-800/50",
      onlineIndicator: "bg-blue-600"
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;
  
  // Size-based classes
  const sizeClasses = {
    small: "text-xs py-1 px-2",
    medium: "text-sm py-1.5 px-3",
    large: "text-base py-2 px-4"
  };
  
  // Format seconds into mm:ss
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle external time updates (for online sync)
  useEffect(() => {
    // If we receive a non-zero time update from parent (via props)
    // and it's different from our current time, update local state
    if (typeof onTimeUpdate === 'function' && onTimeUpdate.externalTime !== undefined &&
        onTimeUpdate.externalTime !== seconds && onTimeUpdate.externalTime > 0) {
      setSeconds(onTimeUpdate.externalTime);
    }
  }, [onTimeUpdate, seconds]);
  
  // Start/stop timer based on isActive prop
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          
          // Only update parent at most once per second to reduce unnecessary renders
          const now = Date.now();
          if (now - lastUpdateRef.current >= 1000) {
            lastUpdateRef.current = now;
            
            // Make sure to call onTimeUpdate only if it exists and is a function
            if (onTimeUpdate && typeof onTimeUpdate === 'function') {
              onTimeUpdate(newSeconds);
            }
          }
          return newSeconds;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Cleanup on unmount or when isActive changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, onTimeUpdate]);
  
  // Reset timer when resetKey changes
  useEffect(() => {
    setSeconds(0);
    lastUpdateRef.current = 0;
    
    // Update parent component with reset value
    if (onTimeUpdate && typeof onTimeUpdate === 'function') {
      onTimeUpdate(0);
    }
  }, [resetKey, onTimeUpdate]);
  
  return (
    <motion.div 
      className={`rounded-lg ${currentTheme.container} ${currentTheme.border} border shadow-md inline-flex items-center ${sizeClasses[size]}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className={`font-mono ${currentTheme.icon} mr-1.5`}>⏱</span>
      <span className={`font-medium ${currentTheme.text}`}>
        {getText(gameTheme, language, "time", "common") || "Time"}: {formatTime(seconds)}
      </span>
      
      {/* Add online indicator dot if in online mode */}
      {isOnline && (
        <span className={`ml-1 w-2 h-2 rounded-full ${currentTheme.onlineIndicator}`}></span>
      )}
    </motion.div>
  );
};

export default GameTimer;