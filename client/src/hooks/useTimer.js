import { useState, useEffect, useRef } from 'react';

const useTimer = (initialTime = 0) => {
  const [gameTime, setGameTime] = useState(initialTime);
  const [timerActive, setTimerActive] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  
  // Ref to store interval ID
  const timerRef = useRef(null);

  // Start/stop timer based on active state
  useEffect(() => {
    if (timerActive) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start a new timer
      timerRef.current = setInterval(() => {
        setGameTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (timerRef.current) {
      // Stop the timer
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timerResetKey]);

  // Format time for display (mm:ss)
  const formatTime = () => {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset timer
  const resetTimer = () => {
    setGameTime(0);
    setTimerResetKey(prev => prev + 1);
  };

  return {
    gameTime,
    setGameTime,
    timerActive,
    setTimerActive,
    timerResetKey,
    setTimerResetKey,
    formatTime,
    resetTimer
  };
};

export default useTimer;