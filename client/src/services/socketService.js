// src/services/socketService.js
import { io } from "socket.io-client";

// The URL of your Socket.io server
const SOCKET_URL = "http://localhost:3001";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.roomId = null;
    this.callbacks = {};
    this.gameTheme = null; // Theme property
    this.difficulty = null; // Difficulty property
    this.layoutConfig = null; // Layout configuration property
  }

  connect() {
    if (this.socket && this.connected) return;
    
    // Close existing socket if it exists but isn't connected
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Create new socket connection with explicit timeout and reconnection settings
    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'] // Try WebSocket first, fall back to polling
    });
    
    // Log connection events for debugging
    this.socket.on("connect", () => {
      console.log("Connected to socket server with ID:", this.socket.id);
      this.connected = true;
      if (this.callbacks["connect"]) this.callbacks["connect"]();
    });
    
    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      if (this.callbacks["connect_error"]) this.callbacks["connect_error"](error);
    });
    
    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      this.connected = false;
      if (this.callbacks["disconnect"]) this.callbacks["disconnect"](reason);
    });
    
    // Room events
    this.socket.on("roomCreated", (data) => {
      console.log("Room created:", data);
      this.roomId = data.roomId;
      
      // Store the game theme
      if (data.gameTheme) {
        this.gameTheme = data.gameTheme;
      }
      
      // Store difficulty
      if (data.difficulty) {
        console.log("Setting difficulty (created room):", data.difficulty);
        this.difficulty = data.difficulty;
      }
      
      if (this.callbacks["roomCreated"]) this.callbacks["roomCreated"](data);
    });
    
    this.socket.on("roomJoined", (data) => {
      console.log("Room joined:", data);
      this.roomId = data.roomId;
      
      // Store the game theme
      if (data.gameTheme) {
        this.gameTheme = data.gameTheme;
      }
      
      // Store difficulty from the server
      if (data.difficulty) {
        console.log("Setting difficulty from server:", data.difficulty);
        this.difficulty = data.difficulty;
      }
      
      if (this.callbacks["roomJoined"]) this.callbacks["roomJoined"](data);
    });
    
    this.socket.on("roomError", (data) => {
      console.error("Room error:", data);
      if (this.callbacks["roomError"]) this.callbacks["roomError"](data);
    });
    
    this.socket.on("playerJoined", (data) => {
      if (this.callbacks["playerJoined"]) this.callbacks["playerJoined"](data);
    });
    
    this.socket.on("playerLeft", (data) => {
      if (this.callbacks["playerLeft"]) this.callbacks["playerLeft"](data);
    });
    
    // Game events
    this.socket.on("gameStarted", (data) => {
      console.log("Game started with data:", data);
      
      // Store the game theme from the server
      if (data.gameTheme) {
        console.log("Setting theme from server:", data.gameTheme);
        this.gameTheme = data.gameTheme;
      }
      
      // Store the difficulty from the server
      if (data.difficulty) {
        console.log("Setting difficulty from server:", data.difficulty);
        this.difficulty = data.difficulty;
      }
      
      // Store the layout configuration from the server
      if (data.layoutConfig) {
        console.log("Setting layout config from server:", data.layoutConfig);
        this.layoutConfig = data.layoutConfig;
      }
      
      // Ensure all cards have theme information
      if (data.gameState && data.gameState.cards) {
        data.gameState.cards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: data.gameTheme || this.gameTheme
        }));
      }
      
      if (this.callbacks["gameStarted"]) this.callbacks["gameStarted"](data);
    });
    
    this.socket.on("cardFlipped", (data) => {
      // Ensure all cards have theme information
      if (data.gameState && data.gameState.cards && this.gameTheme) {
        data.gameState.cards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || this.gameTheme
        }));
      }
      
      if (this.callbacks["cardFlipped"]) this.callbacks["cardFlipped"](data);
    });
    
    this.socket.on("turnUpdate", (data) => {
      // Ensure all cards have theme information
      if (data.gameState && data.gameState.cards && this.gameTheme) {
        data.gameState.cards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || this.gameTheme
        }));
      }
      
      if (this.callbacks["turnUpdate"]) this.callbacks["turnUpdate"](data);
    });
    
    this.socket.on("gameOver", (data) => {
      if (this.callbacks["gameOver"]) this.callbacks["gameOver"](data);
    });
    
    this.socket.on("gameReset", (data) => {
      if (this.callbacks["gameReset"]) this.callbacks["gameReset"](data);
    });
    
    // Chat events
    this.socket.on("newMessage", (data) => {
      if (this.callbacks["newMessage"]) this.callbacks["newMessage"](data);
    });
    
    // Room list
    this.socket.on("roomList", (data) => {
      console.log("Received room list:", data);
      if (this.callbacks["roomList"]) this.callbacks["roomList"](data);
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.roomId = null;
      this.gameTheme = null;
      this.difficulty = null;
      this.layoutConfig = null; // Reset layout config
    }
  }
  
  // Register event callbacks
  on(event, callback) {
    this.callbacks[event] = callback;
  }
  
  // Room actions
  createRoom(data) {
    console.log("Creating room with data:", data);
    if (!this.connected) this.connect();
    
    // Store the game theme when creating a room
    if (data.gameTheme) {
      this.gameTheme = data.gameTheme;
    }
    
    // Store difficulty
    if (data.difficulty) {
      this.difficulty = data.difficulty;
    }
    
    // Ensure the socket is connected before emitting
    if (this.socket && this.connected) {
      this.socket.emit("createRoom", data);
    } else {
      console.error("Socket not connected when trying to create room");
      this.connect(); // Try reconnecting
      // Add to a queue to retry after connection
      setTimeout(() => {
        if (this.socket && this.connected) {
          this.socket.emit("createRoom", data);
        }
      }, 1000);
    }
  }
  
  joinRoom(data) {
    console.log("Joining room with data:", data);
    if (!this.connected) this.connect();
    
    // Format room ID consistently (uppercase)
    const formattedData = {
      ...data,
      roomId: data.roomId.toUpperCase().trim()
    };
    
    // Ensure the socket is connected before emitting
    if (this.socket && this.connected) {
      this.socket.emit("joinRoom", formattedData);
    } else {
      console.error("Socket not connected when trying to join room");
      this.connect(); // Try reconnecting
      // Add to a queue to retry after connection
      setTimeout(() => {
        if (this.socket && this.connected) {
          this.socket.emit("joinRoom", formattedData);
        }
      }, 1000);
    }
  }

  handleError(context, error) {
    console.error(`Socket error in ${context}:`, error);
    
    // Notify any error callbacks
    if (this.callbacks["error"]) {
      this.callbacks["error"]({
        context,
        message: error.message || "An unknown error occurred",
        timestamp: new Date().toISOString()
      });
    }
    
    // For critical operations, try to reconnect if needed
    if (!this.connected) {
      console.log("Attempting to reconnect...");
      this.connect();
    }
  }
  
  leaveRoom(data) {
    console.log("Leaving room:", data);
    if (this.socket && this.connected) {
      this.socket.emit("leaveRoom", data);
      this.roomId = null;
      this.gameTheme = null;
      this.difficulty = null;
      this.layoutConfig = null; // Reset layout config when leaving room
    }
  }
  
  // Game actions
  startGame(data) {
    console.log("Starting game:", data);
    if (this.socket && this.connected) {
      // Always include the game theme, difficulty, and layout config when starting a game
      const gameData = {
        ...data,
        gameTheme: this.gameTheme || data.gameTheme,
        difficulty: this.difficulty || data.difficulty,
        layoutConfig: data.layoutConfig // Include the layout configuration
      };
      
      // Ensure all cards have theme information
      if (gameData.cards) {
        gameData.cards = gameData.cards.map(card => ({
          ...card,
          cardTheme: gameData.gameTheme
        }));
      }
      
      this.socket.emit("startGame", gameData);
    }
  }
  
  cardClick(data) {
    if (this.socket && this.connected) {
      this.socket.emit("cardClick", {
        ...data,
        gameTheme: this.gameTheme, // Always include theme when clicking cards
        difficulty: this.difficulty // Include difficulty
      });
    }
  }
  
  playAgain(data) {
    console.log("Playing again:", data);
    if (this.socket && this.connected) {
      this.socket.emit("playAgain", {
        ...data,
        gameTheme: this.gameTheme, // Include theme when playing again
        difficulty: this.difficulty // Include difficulty
      });
    }
  }
  
  // Chat
  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.emit("sendMessage", data);
    }
  }
  
  // Get room list
  getRooms() {
    console.log("Getting room list");
    if (!this.connected) this.connect();
    
    if (this.socket && this.connected) {
      this.socket.emit("getRooms");
    } else {
      // Try reconnecting and then get rooms
      this.connect();
      setTimeout(() => {
        if (this.socket && this.connected) {
          this.socket.emit("getRooms");
        }
      }, 1000);
    }
  }
  
  // Check if socket is connected
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
  
  // Get the current game theme
  getGameTheme() {
    return this.gameTheme;
  }
  
  // Get the current difficulty
  getDifficulty() {
    return this.difficulty;
  }
  
  // Get the current layout config
  getLayoutConfig() {
    return this.layoutConfig;
  }
}

export default new SocketService(); // Export as singleton