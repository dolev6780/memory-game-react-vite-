import React from "react";
import { motion } from "framer-motion";
import { getText, themeStyles } from "../themeConfig";

const LanguageToggle = ({ language, toggleLanguage, gameTheme }) => {

  const currentTheme = themeStyles[gameTheme] || themeStyles.animals;
  
  const buttonText = getText(gameTheme, language, "languageToggle", "common");

  return (
    <motion.button
      onClick={toggleLanguage}
      className={`px-3 py-1.5 bg-${currentTheme.colors.primary}
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