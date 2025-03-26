import React from "react";
import { motion } from "framer-motion";
import {
  dragonballBackgroundImage,
  pokemonBackgroundImage,
} from "../constants";

const IntroScreen = ({
  difficulty,
  gameTheme,
  handleThemeSelect,
  handleDifficultySelect,
  gameTitle,
}) => {
  // Define theme-specific styles
  const themeStyles = {
    dragonball: {
      container: "bg-orange-950/60", // Orange-tinted glass container
      title: "text-red-500",         // Red title
      subTitle: "text-orange-400",   // Orange subtitle
      button: "from-red-600 to-orange-500", // Button gradient
      selected: "border-red-500"     // Selected item border
    },
    pokemon: {
      container: "bg-yellow-950/60", // Yellow-tinted glass container
      title: "text-blue-500",        // Blue title
      subTitle: "text-yellow-400",   // Yellow subtitle
      button: "from-blue-600 to-yellow-500", // Button gradient
      selected: "border-blue-500"    // Selected item border
    }
  };

  // Get current theme styles
  const currentTheme = themeStyles[gameTheme] || themeStyles.dragonball;

  return (
    <div className={`${currentTheme.container} text-white p-4 sm:p-6 rounded-lg shadow-lg backdrop-blur-sm max-w-2xl mx-auto`}>
      <div className="text-center mb-6">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${currentTheme.title}`}>
          {gameTitle} Memory Game
        </h1>
        <p className="text-lg opacity-90">
          Test your memory by matching pairs of cards!
        </p>
      </div>

      {/* Theme Selection */}
      <div className="mb-8">
        <h2 className={`text-xl font-semibold mb-3 text-center ${currentTheme.subTitle}`}>
          Choose Your Theme
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleThemeSelect("dragonball", "Dragon Ball")}
            className={`cursor-pointer rounded-lg overflow-hidden border-4 ${
              gameTheme === "dragonball"
                ? themeStyles.dragonball.selected
                : "border-transparent"
            } transition-all duration-200`}
          >
            <div className="relative h-32 sm:h-40">
              <img src={dragonballBackgroundImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
                <div className="absolute bottom-0 w-full p-2 text-center">
                  <h3 className="font-bold text-white">Dragon Ball</h3>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleThemeSelect("pokemon", "Pokemon")}
            className={`cursor-pointer rounded-lg overflow-hidden border-4 ${
              gameTheme === "pokemon"
                ? themeStyles.pokemon.selected
                : "border-transparent"
            } transition-all duration-200`}
          >
            <div className="relative h-32 sm:h-40">
              <img src={pokemonBackgroundImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70">
                <div className="absolute bottom-0 w-full p-2 text-center">
                  <h3 className="font-bold text-white">Pokémon</h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Difficulty Selection */}
      <div>
        <h2 className={`text-xl font-semibold mb-3 text-center ${currentTheme.subTitle}`}>
          Select Difficulty
        </h2>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {["easy", "medium", "hard"].map((level) => (
            <motion.button
              key={level}
              onClick={() => handleDifficultySelect(level)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-sm sm:text-base font-semibold uppercase transition-colors duration-200 ${
                difficulty === level
                  ? gameTheme === "dragonball" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                  : "bg-gray-700/70 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {level}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Game Start */}
      <div className="mt-8 text-center">
        <p className="text-sm opacity-80 mb-2">
          {difficulty === "easy"
            ? "6 pairs of cards (Easy)"
            : difficulty === "medium"
            ? "10 pairs of cards (Medium)"
            : "15 pairs of cards (Hard)"}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDifficultySelect(difficulty)}
          className={`bg-gradient-to-r ${currentTheme.button} text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200`}
        >
          Start Game
        </motion.button>
      </div>
    </div>
  );
};

export default IntroScreen;