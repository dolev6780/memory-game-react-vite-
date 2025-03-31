import React from "react";
import { motion } from "framer-motion";
import { getText, themeStyles } from "../themeConfig";

const LanguageToggle = ({ language, toggleLanguage, gameTheme }) => {
  // Get the appropriate theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;
  
  // Get the button text (which is the opposite language name)
  const buttonText = getText(gameTheme, language, "languageToggle", "common");

  return (
    <motion.button
      onClick={toggleLanguage}
      className={`px-3 py-1.5 bg-gradient-to-r ${currentTheme.colors.buttonGradient} 
                 text-white font-medium rounded-lg shadow-md text-sm`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle Language"
    >
      {buttonText}
    </motion.button>
  );
};

export default LanguageToggle;