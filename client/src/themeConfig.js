// src/themeConfig.js
// Central configuration file for all theme and language settings

// Import theme assets - update these paths according to your project structure
import animalsBackgroundImage from "./assets/animalsBackgroundImage.png";
import flagsBackgroundImage from "./assets/flagsBackgroundImage.png";

// Import animal images
import rabbit from "./assets/animals/rabbit.jpg";
import peacock from "./assets/animals/peacock.jpg";
import parrot from "./assets/animals/parrot.jpg";
import owl from "./assets/animals/owl.jpg";
import monkey from "./assets/animals/monkey.jpg";
import lion from "./assets/animals/lion.jpg";
import horse from "./assets/animals/horse.jpg";
import hedgehog from "./assets/animals/hedgehog.jpg";
import elephant from "./assets/animals/elephant.jpg";
import eagle from "./assets/animals/eagle.jpg";
import dolphine from "./assets/animals/dolphine.jpg";
import dog from "./assets/animals/dog.jpg";
import deer from "./assets/animals/deer.jpg";
import crocodile from "./assets/animals/crocodile.jpg";
import chameleon from "./assets/animals/chameleon.jpg";
import cat from "./assets/animals/cat.jpg";
import wolf from "./assets/animals/wolf.jpg";
import tiger2 from "./assets/animals/tiger2.jpg";
import tiger from "./assets/animals/tiger.jpg";
import swan from "./assets/animals/swan.jpg";
import squirrel from "./assets/animals/squirrel.jpg";
import snake from "./assets/animals/snake.jpg";
import rooster from "./assets/animals/rooster.jpg";

// Import flag images
import finland from "./assets/flags/finland.png";
import denmark from "./assets/flags/denmark.png";
import czechRepublic from "./assets/flags/czech-republic.png";
import cuba from "./assets/flags/cuba.png";
import costaRica from "./assets/flags/costa-rica.png";
import colombia from "./assets/flags/colombia.png";
import china from "./assets/flags/china.png";
import chad from "./assets/flags/chad.png";
import canada from "./assets/flags/canada.png";
import bulgaria from "./assets/flags/bulgaria.png";
import brazil from "./assets/flags/brazil.png";
import benin from "./assets/flags/benin.png";
import belgium from "./assets/flags/belgium.png";
import austria from "./assets/flags/austria.png";
import estonia from "./assets/flags/estonia.png";
import luxembourg from "./assets/flags/luxembourg.png";
import lithuania from "./assets/flags/lithuania.png";
import libya from "./assets/flags/libya.png";
import japan from "./assets/flags/japan.png";
import jamaica from "./assets/flags/jamaica.png";
import italy from "./assets/flags/italy.png";
import israel from "./assets/flags/israel.png";
import ireland from "./assets/flags/ireland.png";
import india from "./assets/flags/india.png";
import iceland from "./assets/flags/iceland.png";
import hungary from "./assets/flags/hungary.png";
import honduras from "./assets/flags/honduras.png";
import guinea from "./assets/flags/guinea.png";
import greece from "./assets/flags/greece.png";



// Define Animals characters with multilingual support
const animalCharacters = [
  { id: 1, name: { en: "Rabbit", he: "ארנב" }, image: rabbit },
  { id: 2, name: { en: "Peacock", he: "טווס" }, image: peacock },
  { id: 3, name: { en: "Parrot", he: "תוכי" }, image: parrot },
  { id: 4, name: { en: "Owl", he: "ינשוף" }, image: owl },
  { id: 5, name: { en: "Monkey", he: "קוף" }, image: monkey },
  { id: 6, name: { en: "Lion", he: "אריה" }, image: lion },
  { id: 7, name: { en: "Horse", he: "סוס" }, image: horse },
  { id: 8, name: { en: "Hedgehog", he: "קיפוד" }, image: hedgehog },
  { id: 9, name: { en: "Elephant", he: "פיל" }, image: elephant },
  { id: 10, name: { en: "Eagle", he: "נשר" }, image: eagle },
  { id: 11, name: { en: "Dolphin", he: "דולפין" }, image: dolphine },
  { id: 12, name: { en: "Dog", he: "כלב" }, image: dog },
  { id: 13, name: { en: "Deer", he: "אייל" }, image: deer },
  { id: 14, name: { en: "Crocodile", he: "תנין" }, image: crocodile },
  { id: 15, name: { en: "Chameleon", he: "זיקית" }, image: chameleon },
  { id: 16, name: { en: "Cat", he: "חתול" }, image: cat },
  { id: 17, name: { en: "Wolf", he: "זאב" }, image: wolf },
  { id: 18, name: { en: "Tiger", he: "נמר" }, image: tiger },
  { id: 19, name: { en: "Swan", he: "ברבור" }, image: swan },
  { id: 20, name: { en: "Squirrel", he: "סנאי" }, image: squirrel },
];

// Define Flags characters with multilingual support
const flagCharacters = [
  { id: 1, name: { en: "Finland", he: "פינלנד" }, image: finland },
  { id: 2, name: { en: "Denmark", he: "דנמרק" }, image: denmark },
  { id: 3, name: { en: "Czech Republic", he: "צ'כיה" }, image: czechRepublic },
  { id: 4, name: { en: "Cuba", he: "קובה" }, image: cuba },
  { id: 5, name: { en: "Costa Rica", he: "קוסטה ריקה" }, image: costaRica },
  { id: 6, name: { en: "Colombia", he: "קולומביה" }, image: colombia },
  { id: 7, name: { en: "China", he: "סין" }, image: china },
  { id: 8, name: { en: "Chad", he: "צ'אד" }, image: chad },
  { id: 9, name: { en: "Canada", he: "קנדה" }, image: canada },
  { id: 10, name: { en: "Bulgaria", he: "בולגריה" }, image: bulgaria },
  { id: 11, name: { en: "Brazil", he: "ברזיל" }, image: brazil },
  { id: 12, name: { en: "Benin", he: "בנין" }, image: benin },
  { id: 13, name: { en: "Belgium", he: "בלגיה" }, image: belgium },
  { id: 14, name: { en: "Austria", he: "אוסטריה" }, image: austria },
  { id: 15, name: { en: "Estonia", he: "אסטוניה" }, image: estonia },
  { id: 16, name: { en: "Luxembourg", he: "לוקסמבורג" }, image: luxembourg },
  { id: 17, name: { en: "Lithuania", he: "ליטא" }, image: lithuania },
  { id: 18, name: { en: "Japan", he: "יפן" }, image: japan },
  { id: 19, name: { en: "Jamaica", he: "ג'מייקה" }, image: jamaica },
  { id: 20, name: { en: "Italy", he: "איטליה" }, image: italy },
  { id: 21, name: { en: "Israel", he: "ישראל" }, image: israel },
  { id: 22, name: { en: "Ireland", he: "אירלנד" }, image: ireland },
  { id: 23, name: { en: "India", he: "הודו" }, image: india },
  { id: 24, name: { en: "Iceland", he: "איסלנד" }, image: iceland },
];

// Define UI text translations for both themes
const uiText = {
  animals: {
    en: {
      gameTitle: "Animal Memory Game",
      themeTitle: "Animals",
      tagline: "Test your memory with animal characters!",
      difficultyEasy: "Easy (6 Pairs)",
      difficultyMedium: "Medium (10 Pairs)",
      difficultyHard: "Hard (15 Pairs)",
      footerText: "Find the matching animals!",
      shufflingText: "Preparing an animal memory challenge...",
      buttonStart: "Start Game",
      buttonBack: "Back",
      buttonRestart: "Restart",
      buttonPlayAgain: "Play Again",
      playerTurn: "'s Turn",
      matchedBy: "Matched by",
      pairsFound: "Pairs Found",
      moves: "Moves",
      cardInitials: "AN",
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
      noRoomsAvailable: "No animal rooms available. Create one!",
      players: "Players",
      waitingForHost: "Waiting for the host to start the game...",
      hostStartPrompt:
        "You're the host! Start the game when everyone is ready.",
      difficulty: "Difficulty",
      startTutorial:
        "Find matching pairs of animals by flipping cards.",
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
      gameTitle: "משחק זיכרון בעלי חיים",
      themeTitle: "בעלי חיים",
      tagline: "!בחנו את הזיכרון שלכם עם דמויות בעלי חיים",
      difficultyEasy: "קל (6 זוגות)",
      difficultyMedium: "בינוני (10 זוגות)",
      difficultyHard: "קשה (15 זוגות)",
      footerText: "!מצאו את הזוגות של בעלי החיים",
      shufflingText: "מכינים אתגר זיכרון בעלי חיים...",
      buttonStart: "התחל משחק",
      buttonBack: "חזור",
      buttonRestart: "התחל מחדש",
      buttonPlayAgain: "שחק שוב",
      playerTurn: " תורו של",
      matchedBy: "הותאם על ידי",
      pairsFound: "זוגות שנמצאו",
      moves: "מהלכים",
      cardInitials: "בח",
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
      noRoomsAvailable: "אין חדרי בעלי חיים זמינים. צור חדר חדש!",
      players: "שחקנים",
      waitingForHost: "מחכים למארח להתחיל את המשחק...",
      hostStartPrompt: "אתה המארח! התחל את המשחק כשכולם מוכנים.",
      difficulty: "רמת קושי",
      startTutorial: "מצאו זוגות של בעלי חיים על ידי הפיכת קלפים.",
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
  flags: {
    en: {
      gameTitle: "Flags Memory Game",
      themeTitle: "Flags",
      tagline: "Test your geography knowledge with flags!",
      difficultyEasy: "Easy (6 Pairs)",
      difficultyMedium: "Medium (10 Pairs)",
      difficultyHard: "Hard (15 Pairs)",
      footerText: "Match the flags of the world!",
      shufflingText: "Preparing a flags memory challenge...",
      buttonStart: "Start Game",
      buttonBack: "Back",
      buttonRestart: "Restart",
      buttonPlayAgain: "Play Again",
      playerTurn: "'s Turn",
      matchedBy: "Matched by",
      pairsFound: "Pairs Found",
      moves: "Moves",
      cardInitials: "FL",
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
      noRoomsAvailable: "No flags rooms available. Create one!",
      players: "Players",
      waitingForHost: "Waiting for the host to start the game...",
      hostStartPrompt:
        "You're the host! Start the game when everyone is ready.",
      difficulty: "Difficulty",
      startTutorial: "Find matching pairs of flags by flipping cards.",
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
      gameTitle: "משחק זיכרון דגלים",
      themeTitle: "דגלים",
      tagline: "!בחנו את הידע הגיאוגרפי שלכם עם דגלים",
      difficultyEasy: "קל (6 זוגות)",
      difficultyMedium: "בינוני (10 זוגות)",
      difficultyHard: "קשה (15 זוגות)",
      footerText: "התאימו את דגלי העולם!",
      shufflingText: "מכינים אתגר זיכרון דגלים...",
      buttonStart: "התחל משחק",
      buttonBack: "חזור",
      buttonRestart: "התחל מחדש",
      buttonPlayAgain: "שחק שוב",
      playerTurn: " תורו של",
      matchedBy: "הותאם על ידי",
      pairsFound: "זוגות שנמצאו",
      moves: "מהלכים",
      cardInitials: "דג",
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
      noRoomsAvailable: "אין חדרי דגלים זמינים. צור חדר חדש!",
      players: "שחקנים",
      waitingForHost: "מחכים למארח להתחיל את המשחק...",
      hostStartPrompt: "אתה המארח! התחל את המשחק כשכולם מוכנים.",
      difficulty: "רמת קושי",
      startTutorial: "מצאו זוגות של דגלים על ידי הפיכת קלפים.",
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
  animals: {
    // Color schemes
    colors: {
      primary: "green-500",
      secondary: "emerald-500",
      accent: "lime-400",
      highlight: "green-600",
      background: "green-500/20",
      container: "bg-green-500/20 border-white/20",
      cardGradient: "linear-gradient(135deg, #4ade80, #10b981)",
      cardBorder: "2px solid #16a34a",
      buttonColor: "from-green-500 to-emerald-600",
    },
    // Text classes
    text: {
      title: "text-green-400",
      subtitle: "text-lime-400",
      content: "text-gray-200",
    },
    // Component-specific styles
    components: {
      playerTurn: "from-green-600 to-emerald-500",
      playerHighlight: "bg-green-500",
      playerCard: "bg-green-900/60",
      difficultyEasy: "bg-lime-600",
      difficultyMedium: "bg-green-600",
      difficultyHard: "bg-red-600",
      buttonHover: "hover:bg-green-700",
      circleBg: "bg-green-600",
      matchedBadgeBg: "bg-green-500 bg-opacity-70",
    },
    // Animation configurations
    animations: {
      glow: "rgba(74, 222, 128, 0.5)",
      titlePulse: [
        "0 0 8px rgba(74,222,128,0.5)",
        "0 0 16px rgba(74,222,128,0.8)",
        "0 0 8px rgba(74,222,128,0.5)",
      ],
    },
    // Player icons
    playerIcons: [1, 2, 3, 4],
  },
  flags: {
    // Color schemes
    colors: {
      primary: "blue-500",
      secondary: "blue-500",
      accent: "yellow-400",
      highlight: "blue-600",
      background: "blue-500/20",
      container: "bg-blue-500/20 border-white/20",
      cardGradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
      cardBorder: "2px solid #1e40af",
      buttonColor: "from-blue-500 to-blue-500",
    },
    // Text classes
    text: {
      title: "text-blue-400",
      subtitle: "text-yellow-400",
      content: "text-gray-200",
    },
    // Component-specific styles
    components: {
      playerTurn: "from-blue-600 to-red-500",
      playerHighlight: "bg-blue-500",
      playerCard: "bg-blue-900/60",
      difficultyEasy: "bg-green-600",
      difficultyMedium: "bg-blue-600",
      difficultyHard: "bg-red-600",
      buttonHover: "hover:bg-blue-700",
      circleBg: "bg-red-500",
      matchedBadgeBg: "bg-blue-600 bg-opacity-70",
    },
    // Animation configurations
    animations: {
      glow: "rgba(59, 130, 246, 0.5)",
      titlePulse: [
        "0 0 8px rgba(59,130,246,0.5)",
        "0 0 16px rgba(59,130,246,0.8)",
        "0 0 8px rgba(59,130,246,0.5)",
      ],
    },
    // Player icons
    playerIcons: [1, 2, 3, 4],
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
  animalsBackgroundImage,
  flagsBackgroundImage,

  // Character collections
  animalCharacters,
  flagCharacters,

  // Style configurations
  themeStyles,

  // UI text by theme and language
  uiText,
};

// Default export for easy importing
export default {
  backgrounds: {
    animals: animalsBackgroundImage,
    flags: flagsBackgroundImage,
  },
  characters: {
    animals: animalCharacters,
    flags: flagCharacters,
  },
  styles: themeStyles,
  text: uiText,
  getCharacterName,
  getText,
  getDifficultyName,
};
