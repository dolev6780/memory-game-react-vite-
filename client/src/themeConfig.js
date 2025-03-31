// src/themeConfig.js
// Central configuration file for all theme and language settings

// Import theme assets - update these paths according to your project structure
import dragonballBackgroundImage from "./assets/dragonBallBackground.jpg";
import pokemonBackgroundImage from "./assets/pokemonBackground.jpg";

// Import character images for Dragon Ball
import goku from "./assets/dragonball/goku.jpg";
import vegeta from "./assets/dragonball/vegeta.jpg";
import piccolo from "./assets/dragonball/piccolo.jpg";
import gohan from "./assets/dragonball/gohan.jpeg";
import trunks from "./assets/dragonball/trunks.jpg";
import frieza from "./assets/dragonball/frieza.jpg";
import cell from "./assets/dragonball/cell.jpg";
import buu from "./assets/dragonball/buu.jpg";
import krillin from "./assets/dragonball/krillin.jpg";
import tien from "./assets/dragonball/tien.jpg";
import yamcha from "./assets/dragonball/yamcha.png";
import chiaotzu from "./assets/dragonball/chiaotzu.png";
import android18 from "./assets/dragonball/android18.jpg";
import android17 from "./assets/dragonball/android17.jpg";
import bulma from "./assets/dragonball/bulma.jpg";
import masterRoshi from "./assets/dragonball/masterroshi.jpg";
import mrSatan from "./assets/dragonball/mrsatan.jpg";
import videl from "./assets/dragonball/videl.jpg";
import bardock from "./assets/dragonball/bardock.jpg";
import whis from "./assets/dragonball/whis.jpg";

// Import character images for Pokemon
import arceus from "./assets/pokemon/arceus.png";
import pikachu from "./assets/pokemon/pikachu.jpg";
import charizard from "./assets/pokemon/charizard.jpg";
import bulbasaur from "./assets/pokemon/bulbasaur.jpg";
import dialga from "./assets/pokemon/dialga.png";
import dragonite from "./assets/pokemon/dragonite.png";
import eevee from "./assets/pokemon/eevee.jpg";
import garchomp from "./assets/pokemon/garchomp.png";
import gengar from "./assets/pokemon/gengar.jpg";
import greninja from "./assets/pokemon/greninja.png";
import gyarados from "./assets/pokemon/gyarados.png";
import jigglypuff from "./assets/pokemon/Jigglypuff.png";
import lucario from "./assets/pokemon/lucario.png";
import mew from "./assets/pokemon/mew.png";
import mewtwo from "./assets/pokemon/mewtwo.png";
import psyduck from "./assets/pokemon/psyduck.png";
import rayquaza from "./assets/pokemon/rayquaza.png";
import snorlax from "./assets/pokemon/snorlax.png";
import suicune from "./assets/pokemon/suicune.png";
import wartortle from "./assets/pokemon/wartortle.png";
import zoroark from "./assets/pokemon/zoroark.png";
import ash from "./assets/pokemon/ash.jpg";
import brock from "./assets/pokemon/brock.jpg";
import misty from "./assets/pokemon/misty.jpg";

// Player icons
import one from "./assets/one.png";
import two from "./assets/two.png";
import three from "./assets/three.png";
import four from "./assets/four.png";
import pokeball from "./assets/pokeball.png";

// Define Dragon Ball characters with multilingual support
const dragonballCharacters = [
  { id: 1, name: { en: "Goku", he: "גוקו" }, image: goku },
  { id: 2, name: { en: "Vegeta", he: "וג'יטה" }, image: vegeta },
  { id: 3, name: { en: "Piccolo", he: "פיקולו" }, image: piccolo },
  { id: 4, name: { en: "Gohan", he: "גוהאן" }, image: gohan },
  { id: 5, name: { en: "Trunks", he: "טראנקס" }, image: trunks },
  { id: 6, name: { en: "Frieza", he: "פריזה" }, image: frieza },
  { id: 7, name: { en: "Cell", he: "סל" }, image: cell },
  { id: 8, name: { en: "Majin Buu", he: "מג'ין בו" }, image: buu },
  { id: 9, name: { en: "Krillin", he: "קרילין" }, image: krillin },
  { id: 10, name: { en: "Tien", he: "טיאן" }, image: tien },
  { id: 11, name: { en: "Yamcha", he: "יאמצ'ה" }, image: yamcha },
  { id: 12, name: { en: "Chiaotzu", he: "צ'יאוצו" }, image: chiaotzu },
  { id: 13, name: { en: "Android 18", he: "אנדרואיד 18" }, image: android18 },
  { id: 14, name: { en: "Android 17", he: "אנדרואיד 17" }, image: android17 },
  { id: 15, name: { en: "Bulma", he: "בולמה" }, image: bulma },
  {
    id: 16,
    name: { en: "Master Roshi", he: "מאסטר רושי" },
    image: masterRoshi,
  },
  { id: 17, name: { en: "Mr. Satan", he: "מר. סאטן" }, image: mrSatan },
  { id: 18, name: { en: "Videl", he: "וידל" }, image: videl },
  { id: 19, name: { en: "Bardock", he: "ברדוק" }, image: bardock },
  { id: 20, name: { en: "Whis", he: "וויס" }, image: whis },
];

// Define Pokemon characters with multilingual support
const pokemonCharacters = [
  { id: 1, name: { en: "Pikachu", he: "פיקאצ'ו" }, image: pikachu },
  { id: 2, name: { en: "Charizard", he: "חריזארד" }, image: charizard },
  { id: 3, name: { en: "Bulbasaur", he: "בולבאזאור" }, image: bulbasaur },
  { id: 4, name: { en: "Wartortle", he: "וורטורטל" }, image: wartortle },
  { id: 5, name: { en: "Jigglypuff", he: "ג'יגליפאף" }, image: jigglypuff },
  { id: 6, name: { en: "Eevee", he: "איווי" }, image: eevee },
  { id: 7, name: { en: "Mewtwo", he: "מיוטו" }, image: mewtwo },
  { id: 8, name: { en: "Snorlax", he: "סנורלקס" }, image: snorlax },
  { id: 9, name: { en: "Gengar", he: "גנגאר" }, image: gengar },
  { id: 10, name: { en: "Gyarados", he: "גיירדוס" }, image: gyarados },
  { id: 11, name: { en: "Dragonite", he: "דרגונייט" }, image: dragonite },
  { id: 12, name: { en: "Mew", he: "מיו" }, image: mew },
  { id: 13, name: { en: "Dialga", he: "דיאלגה" }, image: dialga },
  { id: 14, name: { en: "Rayquaza", he: "ריקוואזה" }, image: rayquaza },
  { id: 15, name: { en: "Garchomp", he: "גארצ'ומפ" }, image: garchomp },
  { id: 16, name: { en: "Greninja", he: "גרנינג'ה" }, image: greninja },
  { id: 17, name: { en: "Arceus", he: "ארסאוס" }, image: arceus },
  { id: 18, name: { en: "Suicune", he: "סויקון" }, image: suicune },
  { id: 19, name: { en: "Psyduck", he: "פסיידאק" }, image: psyduck },
  { id: 20, name: { en: "Zoroark", he: "זורוארק" }, image: zoroark },
  { id: 21, name: { en: "Ash", he: "אש" }, image: ash },
  { id: 22, name: { en: "Brock", he: "ברוק" }, image: brock },
  { id: 23, name: { en: "Misty", he: "מיסטי" }, image: misty },
  { id: 24, name: { en: "Lucario", he: "לוקאריו" }, image: lucario },
];

// Define UI text translations for both themes
const uiText = {
  dragonball: {
    en: {
      gameTitle: "Dragon Ball Memory Game",
      themeTitle: "Dragon Ball",
      tagline: "Test your memory with Dragon Ball characters!",
      difficultyEasy: "Easy (6 Pairs)",
      difficultyMedium: "Medium (10 Pairs)",
      difficultyHard: "Hard (15 Pairs)",
      footerText: "Find the matching Dragon Ball characters!",
      shufflingText: "Preparing a Dragon Ball memory challenge...",
      buttonStart: "Start Game",
      buttonBack: "Back",
      buttonRestart: "Restart",
      buttonPlayAgain: "Play Again",
      playerTurn: "'s Turn",
      matchedBy: "Matched by",
      pairsFound: "Pairs Found",
      moves: "Moves",
      cardInitials: "DB",
      localPlay: "Local Play",
      onlinePlay: "Online Multiplayer",
      localPlayDesc: "Play on this device",
      onlinePlayDesc: "Play with friends",
      gameOver: "Game Over!",
      winner: "Winner!",
      itsATie: "It's a tie!",
      yourResults: "Your Results",
      completed: "Completed in",
      roomCode: "Room",
      playAgain: "Play Again",
      backToMenu: "Home",
      backToLobby: "Back to Lobby",
      createRoom: "Create Room",
      joinRoom: "Join Game",
      enterRoomCode: "Enter room code",
      enterYourName: "Enter your name",
      availableRooms: "Available Rooms",
      noRoomsAvailable: "No Dragon Ball rooms available. Create one!",
      players: "Players",
      waitingForHost: "Waiting for the host to start the game...",
      hostStartPrompt:
        "You're the host! Start the game when everyone is ready.",
      difficulty: "Difficulty",
      startTutorial:
        "Find matching pairs of Dragon Ball characters by flipping cards.",
      memoryMaster: "Memory Master!",
      excellentMemory: "Excellent Memory!",
      goodJob: "Good Job!",
      gettingThere: "Getting There!",
      keepPracticing: "Keep Practicing!",
      waitingRoom: "Waiting Room",
      host: "Host",
      player: "Player",
      leave: "Leave",
      send: "Send",
      typeMessage: "Type a message...",
      noMessages: "No messages yet. Say hello!",
      gameReset: "Game has been reset. Ready for a new game!",
      chooseTheme: "Choose Your Theme",
      selectPlayMode: "Select Play Mode",
      continuePrompt: "Choose your theme and play mode to continue",
      gameSetup: "Game Setup",
      setupLocal: "Set up your local game",
      selectDifficulty: "Select Difficulty",
      numberPlayers: "Number of Players",
      enterPlayerNames: "Please enter names for all players",
      nameRequired: "Player name is required",
      enterName: "Please enter a name",
      restart: "Restart",
      return: "Return",
      home: "Home",
      lobby: "Lobby",
      online: "ONLINE",
      room: "Room",
      timeLeft: "Time Left",
      roomExpired: "Room has expired due to inactivity",
      timerReset: "Room timer reset",
      difficultyChanged: "Difficulty changed",
      needMorePlayers: "Need at least 2 players to start",
      resettingGame: "Resetting game...",
      
    },
    he: {
      gameTitle: "משחק זיכרון דרגון בול",
      themeTitle: "דרגון בול",
      tagline: "!בחנו את הזיכרון שלכם עם דמויות מדרגון בול",
      difficultyEasy: "קל (6 זוגות)",
      difficultyMedium: "בינוני (10 זוגות)",
      difficultyHard: "קשה (15 זוגות)",
      footerText: "!מצאו את הזוגות של דמויות דרגון בול",
      shufflingText: "מכינים אתגר זיכרון דרגון בול...",
      buttonStart: "התחל משחק",
      buttonBack: "חזור",
      buttonRestart: "התחל מחדש",
      buttonPlayAgain: "שחק שוב",
      playerTurn: " תורו של",
      matchedBy: "הותאם על ידי",
      pairsFound: "זוגות שנמצאו",
      moves: "מהלכים",
      cardInitials: "דב",
      localPlay: "משחק מקומי",
      onlinePlay: "משחק מקוון",
      localPlayDesc: "שחק במכשיר זה",
      onlinePlayDesc: "שחק עם חברים",
      gameOver: "!המשחק נגמר",
      winner: "!מנצח",
      itsATie: "תיקו!",
      yourResults: "התוצאות שלך",
      completed: "הושלם ב-",
      roomCode: "חדר",
      playAgain: "שחק שוב",
      backToMenu: "בית",
      backToLobby: "חזרה ללובי",
      createRoom: "צור חדר",
      joinRoom: "הצטרף למשחק",
      enterRoomCode: "הכנס קוד חדר",
      enterYourName: "הכנס את שמך",
      availableRooms: "חדרים זמינים",
      noRoomsAvailable: "אין חדרי דרגון בול זמינים. צור חדר חדש!",
      players: "שחקנים",
      waitingForHost: "מחכים למארח להתחיל את המשחק...",
      hostStartPrompt: "אתה המארח! התחל את המשחק כשכולם מוכנים.",
      difficulty: "רמת קושי",
      startTutorial: "מצאו זוגות של דמויות דרגון בול על ידי הפיכת קלפים.",
      memoryMaster: "אלוף הזיכרון!",
      excellentMemory: "זיכרון מצוין!",
      goodJob: "עבודה טובה!",
      gettingThere: "אתם מתקדמים!",
      keepPracticing: "המשיכו להתאמן!",
      waitingRoom: "חדר המתנה",
      host: "מארח",
      player: "שחקן",
      leave: "יציאה",
      send: "שלח",
      typeMessage: "הקלד הודעה...",
      noMessages: "אין הודעות עדיין. אמור שלום!",
      gameReset: "המשחק אופס. מוכן למשחק חדש!",
      chooseTheme: "בחר נושא",
      selectPlayMode: "בחר מצב משחק",
      continuePrompt: "בחר נושא ומצב משחק כדי להמשיך",
      gameSetup: "הגדרת משחק",
      setupLocal: "הגדר את המשחק המקומי שלך",
      selectDifficulty: "בחר רמת קושי",
      numberPlayers: "מספר שחקנים",
      enterPlayerNames: "אנא הזן שמות לכל השחקנים",
      nameRequired: "נדרש שם שחקן",
      enterName: "אנא הזן שם",
      restart: "התחל מחדש",
      return: "חזור",
      home: "בית",
      lobby: "לובי",
      online: "מקוון",
      room: "חדר",
      timeLeft: "זמן שנותר",
      roomExpired: "החדר פג בגלל חוסר פעילות",
      timerReset: "טיימר החדר אופס",
      difficultyChanged: "הקושי שונה",
      needMorePlayers: "צריך לפחות 2 שחקנים כדי להתחיל",
      resettingGame: "מאפס את המשחק...",
    },
  },
  pokemon: {
    en: {
      gameTitle: "Pokémon Memory Game",
      themeTitle: "Pokémon",
      tagline: "Test your memory with Pokémon characters!",
      difficultyEasy: "Easy (6 Pairs)",
      difficultyMedium: "Medium (10 Pairs)",
      difficultyHard: "Hard (15 Pairs)",
      footerText: "Gotta match 'em all!",
      shufflingText: "Preparing a Pokémon memory challenge...",
      buttonStart: "Start Game",
      buttonBack: "Back",
      buttonRestart: "Restart",
      buttonPlayAgain: "Play Again",
      playerTurn: "'s Turn",
      matchedBy: "Matched by",
      pairsFound: "Pairs Found",
      moves: "Moves",
      cardInitials: "PK",
      localPlay: "Local Play",
      onlinePlay: "Online Multiplayer",
      localPlayDesc: "Play on this device",
      onlinePlayDesc: "Play with friends",
      gameOver: "Game Over!",
      winner: "Winner!",
      itsATie: "It's a tie!",
      yourResults: "Your Results",
      completed: "Completed in",
      roomCode: "Room",
      playAgain: "Play Again",
      backToMenu: "Home",
      backToLobby: "Back to Lobby",
      createRoom: "Create Room",
      joinRoom: "Join Game",
      enterRoomCode: "Enter room code",
      enterYourName: "Enter your name",
      availableRooms: "Available Rooms",
      noRoomsAvailable: "No Pokémon rooms available. Create one!",
      players: "Players",
      waitingForHost: "Waiting for the host to start the game...",
      hostStartPrompt:
        "You're the host! Start the game when everyone is ready.",
      difficulty: "Difficulty",
      startTutorial: "Find matching pairs of Pokémon by flipping cards.",
      memoryMaster: "Memory Master!",
      excellentMemory: "Excellent Memory!",
      goodJob: "Good Job!",
      gettingThere: "Getting There!",
      keepPracticing: "Keep Practicing!",
      chooseTheme: "Choose Your Theme",
      selectPlayMode: "Select Play Mode",
      continuePrompt: "Choose your theme and play mode to continue",
      gameSetup: "Game Setup",
      setupLocal: "Set up your local game",
      selectDifficulty: "Select Difficulty",
      numberPlayers: "Number of Players",
      enterPlayerNames: "Please enter names for all players",
      nameRequired: "Player name is required",
      enterName: "Please enter a name",
      restart: "Restart",
      return: "Return",
      home: "Home",
      lobby: "Lobby",
      online: "ONLINE",
      room: "Room",
      timeLeft: "Time Left",
      roomExpired: "Room has expired due to inactivity",
      timerReset: "Room timer reset",
      difficultyChanged: "Difficulty changed", 
      needMorePlayers: "Need at least 2 players to start",
      resettingGame: "Resetting game...",
      
    },
    he: {
      gameTitle: "משחק זיכרון פוקימון",
      themeTitle: "פוקימון",
      tagline: "!בחנו את הזיכרון שלכם עם דמויות פוקימון",
      difficultyEasy: "קל (6 זוגות)",
      difficultyMedium: "בינוני (10 זוגות)",
      difficultyHard: "קשה (15 זוגות)",
      footerText: "תפסו את כולם!",
      shufflingText: "מכינים אתגר זיכרון פוקימון...",
      buttonStart: "התחל משחק",
      buttonBack: "חזור",
      buttonRestart: "התחל מחדש",
      buttonPlayAgain: "שחק שוב",
      playerTurn: " תורו של",
      matchedBy: "הותאם על ידי",
      pairsFound: "זוגות שנמצאו",
      moves: "מהלכים",
      cardInitials: "פק",
      localPlay: "משחק מקומי",
      onlinePlay: "משחק מקוון",
      localPlayDesc: "שחק במכשיר זה",
      onlinePlayDesc: "שחק עם חברים",
      gameOver: "!המשחק נגמר",
      winner: "!מנצח",
      itsATie: "תיקו!",
      yourResults: "התוצאות שלך",
      completed: "הושלם ב-",
      roomCode: "חדר",
      playAgain: "שחק שוב",
      backToMenu: "בית",
      backToLobby: "חזרה ללובי",
      createRoom: "צור חדר",
      joinRoom: "הצטרף למשחק",
      enterRoomCode: "הכנס קוד חדר",
      enterYourName: "הכנס את שמך",
      availableRooms: "חדרים זמינים",
      noRoomsAvailable: "אין חדרי פוקימון זמינים. צור חדר חדש!",
      players: "שחקנים",
      waitingForHost: "מחכים למארח להתחיל את המשחק...",
      hostStartPrompt: "אתה המארח! התחל את המשחק כשכולם מוכנים.",
      difficulty: "רמת קושי",
      startTutorial: "מצאו זוגות של פוקימונים על ידי הפיכת קלפים.",
      memoryMaster: "אלוף הזיכרון!",
      excellentMemory: "זיכרון מצוין!",
      goodJob: "עבודה טובה!",
      gettingThere: "אתם מתקדמים!",
      keepPracticing: "המשיכו להתאמן!",
      chooseTheme: "בחר נושא",
      selectPlayMode: "בחר מצב משחק",
      continuePrompt: "בחר נושא ומצב משחק כדי להמשיך",
      gameSetup: "הגדרת משחק",
      setupLocal: "הגדר את המשחק המקומי שלך",
      selectDifficulty: "בחר רמת קושי",
      numberPlayers: "מספר שחקנים",
      enterPlayerNames: "אנא הזן שמות לכל השחקנים",
      nameRequired: "נדרש שם שחקן",
      enterName: "אנא הזן שם",
      restart: "התחל מחדש",
      return: "חזור",
      home: "בית",
      lobby: "לובי",
      online: "מקוון",
      room: "חדר",
      timeLeft: "זמן שנותר",
      roomExpired: "החדר פג בגלל חוסר פעילות",
      timerReset: "טיימר החדר אופס",
      difficultyChanged: "הקושי שונה",
      needMorePlayers: "צריך לפחות 2 שחקנים כדי להתחיל",
      resettingGame: "מאפס את המשחק...",
    },
  },
  common: {
    en: {
      languageToggle: "עברית",
      loading: "Loading...",
      warning: "Warning",
      error: "Error",
      success: "Success",
      confirm: "Confirm",
      cancel: "Cancel",
      leave: "Leave",
      send: "Send",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      player: "player",
      players: "players",
      time: "Time",
    },
    he: {
      languageToggle: "English", 
      loading: "טוען...",
      warning: "אזהרה",
      error: "שגיאה",
      success: "הצלחה",
      confirm: "אישור",
      cancel: "ביטול",
      leave: "יציאה",
      send: "שלח",
      easy: "קל",
      medium: "בינוני",
      hard: "קשה",
      player: "שחקן",
      players: "שחקנים",
      time: "זמן",
    },
  },
};

// Theme-specific styles for components
const themeStyles = {
  dragonball: {
    // Color schemes
    colors: {
      primary: "orange-500",
      secondary: "red-500",
      accent: "yellow-400",
      highlight: "orange-600",
      background: "orange-500/20",
      container: "bg-orange-500/20 border-white/20",
      cardGradient: "linear-gradient(135deg, #ff9800, #e65100)",
      cardBorder: "2px solid #e65100",
      buttonGradient: "from-orange-500 to-orange-600",
    },
    // Text classes
    text: {
      title: "text-red-400",
      subtitle: "text-yellow-400",
      content: "text-gray-200",
    },
    // Component-specific styles
    components: {
      playerTurn: "from-orange-600 to-orange-500",
      playerHighlight: "bg-red-500",
      playerCard: "bg-orange-900/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-orange-600",
      difficultyHard: "bg-red-600",
      buttonHover: "hover:bg-orange-700",
      circleBg: "bg-orange-600",
      matchedBadgeBg: "bg-orange-500 bg-opacity-70",
    },
    // Animation configurations
    animations: {
      glow: "rgba(255, 160, 0, 0.5)",
      titlePulse: [
        "0 0 8px rgba(255,0,0,0.5)",
        "0 0 16px rgba(255,0,0,0.8)",
        "0 0 8px rgba(255,0,0,0.5)",
      ],
    },
    // Player icons
    playerIcons: [one, two, three, four],
  },
  pokemon: {
    // Color schemes
    colors: {
      primary: "blue-500",
      secondary: "yellow-400",
      accent: "blue-400",
      highlight: "blue-600",
      background: "blue-500/20",
      container: "bg-blue-500/20 border-white/20",
      cardGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      cardBorder: "2px solid #1e40af",
      buttonGradient: "from-blue-500 to-yellow-500",
    },
    // Text classes
    text: {
      title: "text-blue-400",
      subtitle: "text-yellow-400",
      content: "text-gray-200",
    },
    // Component-specific styles
    components: {
      playerTurn: "from-blue-600 to-yellow-500",
      playerHighlight: "bg-blue-500",
      playerCard: "bg-blue-900/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-blue-600",
      difficultyHard: "bg-red-600",
      buttonHover: "hover:bg-blue-700",
      circleBg: "bg-yellow-500",
      matchedBadgeBg: "bg-blue-600 bg-opacity-70",
    },
    // Animation configurations
    animations: {
      glow: "rgba(96, 165, 250, 0.5)",
      titlePulse: [
        "0 0 8px rgba(0,0,255,0.5)",
        "0 0 16px rgba(0,0,255,0.8)",
        "0 0 8px rgba(0,0,255,0.5)",
      ],
    },
    // Player icons
    playerIcons: [pokeball, pokeball, pokeball, pokeball],
  },
};

// Utility function to get translated text
export const getText = (theme, language, key, section = null) => {
  // For theme-specific text
  if (section === null) {
    return uiText[theme]?.[language]?.[key] || key;
  }
  // For common text
  if (section === "common") {
    return uiText.common[language]?.[key] || key;
  }
  // Fallback
  return key;
};

// Utility function to get a character's name in the current language
export const getCharacterName = (character, language) => {
  return character.name[language] || character.name.en || "Unknown";
};

// Function to get difficulty display name
export const getDifficultyName = (difficulty, theme, language) => {
  const difficultyKeys = {
    easy: "difficultyEasy",
    medium: "difficultyMedium",
    hard: "difficultyHard",
  };

  return uiText[theme]?.[language]?.[difficultyKeys[difficulty]] || difficulty;
};

// Export all theme assets and configurations
export {
  // Background images
  dragonballBackgroundImage,
  pokemonBackgroundImage,

  // Character collections
  dragonballCharacters,
  pokemonCharacters,

  // Player icons
  one,
  two,
  three,
  four,
  pokeball,

  // Style configurations
  themeStyles,

  // UI text by theme and language
  uiText,
};

// Default export for easy importing
export default {
  backgrounds: {
    dragonball: dragonballBackgroundImage,
    pokemon: pokemonBackgroundImage,
  },
  characters: {
    dragonball: dragonballCharacters,
    pokemon: pokemonCharacters,
  },
  styles: themeStyles,
  text: uiText,
  getCharacterName,
  getText,
  getDifficultyName,
};
