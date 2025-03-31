import React from "react";
import { motion } from "framer-motion";
import { 
  dragonballBackgroundImage, 
  pokemonBackgroundImage, 
  themeStyles, 
  getText 
} from "../themeConfig";

const IntroScreen = ({
  difficulty,
  gameTheme,
  handleThemeSelect,
  handleOnlineSelect,
  gameTitle,
  language = "he",
  toggleLanguage
}) => {
  // Get theme styles from centralized config
  const currentThemeConfig = themeStyles[gameTheme] || themeStyles.dragonball;

  // Create theme-specific styles for this component
  const currentTheme = {
    container: gameTheme === "dragonball" ? "bg-orange-950/60" : "bg-blue-950/60",
    title: currentThemeConfig.text.title,
    subTitle: currentThemeConfig.text.subtitle,
    button: currentThemeConfig.colors.buttonGradient,
    selected: gameTheme === "dragonball" ? "border-red-500" : "border-blue-500",
    onlineHover: gameTheme === "dragonball" ? "hover:bg-orange-700" : "hover:bg-blue-700",
    localHover: gameTheme === "dragonball" ? "hover:bg-yellow-700" : "hover:bg-yellow-700",
  };

  return (
    <div className={`${currentTheme.container} text-white p-4 sm:p-6 rounded-lg shadow-lg backdrop-blur-sm max-w-2xl mx-auto ${language === 'he' ? 'rtl' : 'ltr'}`}>
      {/* Language toggle button */}
      
      <div className="text-center mb-6">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${currentTheme.title}`}>
          {getText(gameTheme, language, "gameTitle")}
        </h1>
        <p className="text-lg opacity-90">
          {getText(gameTheme, language, "tagline")}
        </p>
      </div>

      {/* Theme Selection */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold mb-3 text-center ${currentTheme.subTitle}`}>
          {language === "en" ? "Choose Your Theme" : "בחר נושא"}
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleThemeSelect("dragonball")}
            className={`cursor-pointer rounded-lg overflow-hidden border-4 ${
              gameTheme === "dragonball"
                ? "border-red-500"
                : "border-transparent"
            } transition-all duration-200`}
          >
            <div className="relative h-32 sm:h-40">
              <img src={dragonballBackgroundImage} alt="" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
                <div className="absolute bottom-0 w-full p-2 text-center">
                  <h3 className="font-bold text-white">{getText("dragonball", language, "themeTitle")}</h3>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleThemeSelect("pokemon")}
            className={`cursor-pointer rounded-lg overflow-hidden border-4 ${
              gameTheme === "pokemon"
                ? "border-blue-500"
                : "border-transparent"
            } transition-all duration-200`}
          >
            <div className="relative h-32 sm:h-40">
              <img src={pokemonBackgroundImage} alt="" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
                <div className="absolute bottom-0 w-full p-2 text-center">
                  <h3 className="font-bold text-white">{getText("pokemon", language, "themeTitle")}</h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Play Mode Selection */}
      <div className="mb-4">
        <h2 className={`text-xl font-semibold mb-3 text-center ${currentTheme.subTitle}`}>
          {language === "en" ? "Select Play Mode" : "בחר מצב משחק"}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOnlineSelect(true)}
            className={`bg-gradient-to-b from-blue-600 to-blue-800 ${currentTheme.onlineHover} py-4 rounded-lg shadow-lg border-b-4 border-blue-900`}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span className="font-bold">{getText(gameTheme, language, "onlinePlay")}</span>
              <span className="text-xs opacity-90 mt-1">{getText(gameTheme, language, "onlinePlayDesc")}</span>
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOnlineSelect(false)}
            className={`bg-gradient-to-b from-yellow-600 to-yellow-800 ${currentTheme.localHover} py-4 rounded-lg shadow-lg border-b-4 border-yellow-900`}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
              <span className="font-bold">{getText(gameTheme, language, "localPlay")}</span>
              <span className="text-xs opacity-90 mt-1">{getText(gameTheme, language, "localPlayDesc")}</span>
            </div>
          </motion.button>
        </div>
      </div>
      
      <div className="text-center mt-6 text-gray-400 text-sm">
        <p>{language === "en" ? "Choose your theme and play mode to continue" : "בחר נושא ומצב משחק כדי להמשיך"}</p>
      </div>
    </div>
  );
};

export default IntroScreen;