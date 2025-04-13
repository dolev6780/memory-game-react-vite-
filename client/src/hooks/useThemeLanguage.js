import { useState, useCallback } from 'react';
import { animalsBackgroundImage, flagsBackgroundImage } from '../themeConfig';

const useThemeLanguage = (initialTheme = 'animals', initialLanguage = 'he') => {
  // State
  const [gameTheme, setGameTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);
  
  // Toggle language function
  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === "en" ? "he" : "en");
  }, []);

  // Get current background image based on theme
  const getBackgroundImage = useCallback(() => {
    return gameTheme === "animals" ? animalsBackgroundImage : flagsBackgroundImage;
  }, [gameTheme]);

  // Handle theme selection
  const handleThemeSelect = useCallback((theme) => {
    if (theme && (theme === 'animals' || theme === 'flags')) {
      setGameTheme(theme);
    }
  }, []);

  return {
    gameTheme,
    setGameTheme,
    language,
    setLanguage,
    toggleLanguage,
    getBackgroundImage,
    handleThemeSelect
  };
};

export default useThemeLanguage;