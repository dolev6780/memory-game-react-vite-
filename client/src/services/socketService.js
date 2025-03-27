// src/services/socketService.js - With backward compatibility layer
import { io } from "socket.io-client";

// The URL of your Socket.io server
const SOCKET_URL = "http://localhost:3001";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.roomId = null;
    this.gameTheme = null;
    this.difficulty = null;
    this.layoutConfig = null;
    this.connecting = false;
    
    // Mapping of event names to arrays of callback functions
    this.eventListeners = new Map();
    
    // Flag to track if socket is initialized
    this.initialized = false;
    
    // Legacy callbacks for backward compatibility
    this.legacyCallbacks = {};
  }

  /**
   * Initialize the socket connection
   * This should be called once at app startup
   */
  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Create socket but don't connect yet
    this.setupSocket();
    
    // Log setup completion
    console.log("Socket service initialized but not connected");
  }
  
  /**
   * Set up the socket object and its base event handlers
   * @private
   */
  setupSocket() {
    // Close any existing socket
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    // Create new socket but don't connect yet
    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling'],
      autoConnect: false // Don't connect automatically
    });
    
    // Set up basic event handlers
    this.socket.on("connect", () => {
      console.log("Socket connected with ID:", this.socket.id);
      this.connected = true;
      this.connecting = false;
      this.notifyListeners("connect");
      if (this.legacyCallbacks["connect"]) this.legacyCallbacks["connect"]();
    });
    
    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.connecting = false;
      this.notifyListeners("connect_error", error);
      if (this.legacyCallbacks["connect_error"]) this.legacyCallbacks["connect_error"](error);
    });
    
    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.connected = false;
      this.connecting = false;
      this.notifyListeners("disconnect", reason);
      if (this.legacyCallbacks["disconnect"]) this.legacyCallbacks["disconnect"](reason);
    });
    
    // Set up event handlers for room-related events
    this.setupRoomEvents();
    this.setupGameEvents();
  }
  
  /**
   * Set up event handlers for room-related events
   * @private
   */
  setupRoomEvents() {
    if (!this.socket) return;
    
    // Room created event
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
      
      this.notifyListeners("roomCreated", data);
      if (this.legacyCallbacks["roomCreated"]) this.legacyCallbacks["roomCreated"](data);
    });
    
    // Room joined event
    this.socket.on("roomJoined", (data) => {
      console.log("Room joined:", data);
      this.roomId = data.roomId;
      
      // Store the game theme
      if (data.gameTheme) {
        this.gameTheme = data.gameTheme;
      }
      
      // Store difficulty
      if (data.difficulty) {
        console.log("Setting difficulty from server:", data.difficulty);
        this.difficulty = data.difficulty;
      }
      
      this.notifyListeners("roomJoined", data);
      if (this.legacyCallbacks["roomJoined"]) this.legacyCallbacks["roomJoined"](data);
    });
    
    // Room error event
    this.socket.on("roomError", (data) => {
      console.error("Room error:", data);
      this.notifyListeners("roomError", data);
      if (this.legacyCallbacks["roomError"]) this.legacyCallbacks["roomError"](data);
    });
    
    // Player joined event
    this.socket.on("playerJoined", (data) => {
      this.notifyListeners("playerJoined", data);
      if (this.legacyCallbacks["playerJoined"]) this.legacyCallbacks["playerJoined"](data);
    });
    
    // Player left event
    this.socket.on("playerLeft", (data) => {
      this.notifyListeners("playerLeft", data);
      if (this.legacyCallbacks["playerLeft"]) this.legacyCallbacks["playerLeft"](data);
    });
    
    // Room list event
    this.socket.on("roomList", (data) => {
      console.log("Received room list with", data.rooms?.length || 0, "rooms");
      this.notifyListeners("roomList", data);
      if (this.legacyCallbacks["roomList"]) this.legacyCallbacks["roomList"](data);
    });
    
    // New message event
    this.socket.on("newMessage", (data) => {
      this.notifyListeners("newMessage", data);
      if (this.legacyCallbacks["newMessage"]) this.legacyCallbacks["newMessage"](data);
    });
  }
  
  /**
   * Set up event handlers for game-related events
   * @private
   */
  setupGameEvents() {
    if (!this.socket) return;
    
    // Game started event
    this.socket.on("gameStarted", (data) => {
      console.log("Game started event received");
      
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
        console.log("Setting layout config from server");
        this.layoutConfig = data.layoutConfig;
      }
      
      // Ensure all cards have theme information
      if (data.gameState && data.gameState.cards && this.gameTheme) {
        data.gameState.cards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: data.gameTheme || this.gameTheme
        }));
      }
      
      this.notifyListeners("gameStarted", data);
      if (this.legacyCallbacks["gameStarted"]) this.legacyCallbacks["gameStarted"](data);
    });
    
    // Card flipped event
    this.socket.on("cardFlipped", (data) => {
      // Ensure all cards have theme information
      if (data.gameState && data.gameState.cards && this.gameTheme) {
        data.gameState.cards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || this.gameTheme
        }));
      }
      
      this.notifyListeners("cardFlipped", data);
      if (this.legacyCallbacks["cardFlipped"]) this.legacyCallbacks["cardFlipped"](data);
    });
    
    // Turn update event
    this.socket.on("turnUpdate", (data) => {
      // Ensure all cards have theme information
      if (data.gameState && data.gameState.cards && this.gameTheme) {
        data.gameState.cards = data.gameState.cards.map(card => ({
          ...card,
          cardTheme: card.cardTheme || this.gameTheme
        }));
      }
      
      this.notifyListeners("turnUpdate", data);
      if (this.legacyCallbacks["turnUpdate"]) this.legacyCallbacks["turnUpdate"](data);
    });
    
    // Game over event
    this.socket.on("gameOver", (data) => {
      this.notifyListeners("gameOver", data);
      if (this.legacyCallbacks["gameOver"]) this.legacyCallbacks["gameOver"](data);
    });
    
    // Game reset event
    this.socket.on("gameReset", (data) => {
      this.notifyListeners("gameReset", data);
      if (this.legacyCallbacks["gameReset"]) this.legacyCallbacks["gameReset"](data);
    });
    
    // Difficulty updated event
    this.socket.on("difficultyUpdated", (data) => {
      if (data.difficulty) {
        console.log(`Updating difficulty from server event: ${this.difficulty} -> ${data.difficulty}`);
        this.difficulty = data.difficulty;
      }
      this.notifyListeners("difficultyUpdated", data);
      if (this.legacyCallbacks["difficultyUpdated"]) this.legacyCallbacks["difficultyUpdated"](data);
    });
  }
  
  /**
   * Connect to the socket server
   * This should be called when entering online mode
   */
  connect() {
    console.log("Socket service connect called");
    if (this.connected) {
      console.log("Socket already connected, skipping connect call");
      return;
    }
    
    if (this.connecting) {
      console.log("Socket already connecting, skipping connect call");
      return;
    }
    
    // Make sure socket is set up
    if (!this.socket) {
      this.setupSocket();
    }
    
    // Connect to the server
    console.log("Connecting socket...");
    this.connecting = true;
    this.socket.connect();
  }
  
  /**
   * Disconnect from the socket server
   * This should be called when exiting online mode
   */
  disconnect() {
    console.log("Socket service disconnect called");
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.connected = false;
      this.connecting = false;
    }
    
    // Reset all state
    this.resetState();
  }
  
  /**
   * Reset the socket service state
   * This doesn't disconnect, just clears the state
   */
  resetState() {
    console.log("Resetting socket service state");
    this.roomId = null;
    this.gameTheme = null;
    this.difficulty = null;
    this.layoutConfig = null;
    
    // Clear all event listeners except basic connection ones
    const connectListeners = this.eventListeners.get("connect") || [];
    const connectErrorListeners = this.eventListeners.get("connect_error") || [];
    const disconnectListeners = this.eventListeners.get("disconnect") || [];
    
    this.eventListeners.clear();
    
    this.eventListeners.set("connect", connectListeners);
    this.eventListeners.set("connect_error", connectErrorListeners);
    this.eventListeners.set("disconnect", disconnectListeners);
  }
  
  /**
   * BACKWARD COMPATIBILITY METHOD
   * Legacy 'on' method for registering event callbacks
   * @param {string} event - Event name
   * @param {Function|null} callback - Callback function or null to remove
   */
  on(event, callback) {
    console.log(`Legacy 'on' method called for event: ${event}`);
    
    // If callback is null, it's a request to remove the listener
    if (callback === null) {
      delete this.legacyCallbacks[event];
      return;
    }
    
    // Store the callback for our internal use
    this.legacyCallbacks[event] = callback;
    
    // Make sure socket is connected if needed
    if (["gameStarted", "cardFlipped", "turnUpdate", "gameOver"].includes(event) && !this.isConnected()) {
      this.connect();
    }
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {string} componentId - Unique identifier for the component (for cleanup)
   */
  addEventListener(event, callback, componentId) {
    if (!callback || typeof callback !== 'function') return;
    
    // Get existing listeners for this event
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    const listeners = this.eventListeners.get(event);
    
    // Add new listener with component ID
    listeners.push({
      callback,
      componentId
    });
    
    console.log(`Added "${event}" listener for component "${componentId}"`);
  }
  
  /**
   * Remove all event listeners for a component
   * @param {string} componentId - Unique identifier for the component
   */
  removeEventListeners(componentId) {
    console.log(`Removing all listeners for component "${componentId}"`);
    
    // Go through all events and remove listeners for this component
    this.eventListeners.forEach((listeners, event) => {
      const remainingListeners = listeners.filter(
        listener => listener.componentId !== componentId
      );
      
      if (remainingListeners.length !== listeners.length) {
        console.log(`Removed ${listeners.length - remainingListeners.length} "${event}" listeners for component "${componentId}"`);
      }
      
      this.eventListeners.set(event, remainingListeners);
    });
  }
  
  /**
   * Notify all listeners for an event
   * @private
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  notifyListeners(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    
    if (listeners.length > 0) {
      // console.log(`Notifying ${listeners.length} listeners for "${event}" event`);
      
      listeners.forEach(listener => {
        try {
          listener.callback(data);
        } catch (error) {
          console.error(`Error in "${event}" listener for component "${listener.componentId}":`, error);
        }
      });
    }
  }
  
  /**
   * Check if socket is connected
   * @returns {boolean} - True if socket is connected
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }
  
  /**
   * Create a room
   * @param {Object} data - Room data
   */
  createRoom(data) {
    console.log("Creating room with data:", data);
    if (!this.connected) {
      this.connect();
      
      // Wait for connection before sending
      setTimeout(() => {
        if (this.isConnected()) {
          // Store the game theme when creating a room
          if (data.gameTheme) {
            this.gameTheme = data.gameTheme;
          }
          
          // Store difficulty
          if (data.difficulty) {
            this.difficulty = data.difficulty;
          }
          
          this.socket.emit("createRoom", data);
        } else {
          console.error("Failed to connect to server when creating room");
          this.notifyListeners("roomError", { message: "Could not connect to server" });
          if (this.legacyCallbacks["roomError"]) this.legacyCallbacks["roomError"]({ message: "Could not connect to server" });
        }
      }, 1000);
      
      return;
    }
    
    // Store the game theme when creating a room
    if (data.gameTheme) {
      this.gameTheme = data.gameTheme;
    }
    
    // Store difficulty
    if (data.difficulty) {
      this.difficulty = data.difficulty;
    }
    
    this.socket.emit("createRoom", data);
  }
  
  /**
   * Join a room
   * @param {Object} data - Room data
   */
  joinRoom(data) {
    console.log("Joining room with data:", data);
    
    // Format room ID consistently (uppercase)
    const formattedData = {
      ...data,
      roomId: data.roomId.toUpperCase().trim()
    };
    
    if (!this.connected) {
      this.connect();
      
      // Wait for connection before sending
      setTimeout(() => {
        if (this.isConnected()) {
          this.socket.emit("joinRoom", formattedData);
        } else {
          console.error("Failed to connect to server when joining room");
          this.notifyListeners("roomError", { message: "Could not connect to server" });
          if (this.legacyCallbacks["roomError"]) this.legacyCallbacks["roomError"]({ message: "Could not connect to server" });
        }
      }, 1000);
      
      return;
    }
    
    this.socket.emit("joinRoom", formattedData);
  }
  
  /**
   * Leave a room
   * @param {Object} data - Room data
   */
  leaveRoom(data) {
    console.log("Leaving room:", data);
    if (this.socket && this.connected) {
      this.socket.emit("leaveRoom", data);
    }
    
    // Reset room-related state
    this.roomId = null;
  }
  
  /**
   * Start a game
   * @param {Object} data - Game data
   */
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
  
  /**
   * Send a card click event
   * @param {Object} data - Card click data
   */
  cardClick(data) {
    if (this.socket && this.connected) {
      this.socket.emit("cardClick", {
        ...data,
        gameTheme: this.gameTheme, // Always include theme when clicking cards
        difficulty: this.difficulty // Include difficulty
      });
    }
  }
  
  /**
   * Send a play again event
   * @param {Object} data - Play again data
   */
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
  
  /**
   * Send a message
   * @param {Object} data - Message data
   */
  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.emit("sendMessage", data);
    }
  }
  
  /**
   * Get room list
   */
  getRooms() {
    console.log("Getting room list");
    if (!this.connected) {
      this.connect();
      
      // Wait for connection before sending
      setTimeout(() => {
        if (this.isConnected()) {
          this.socket.emit("getRooms");
        }
      }, 1000);
      
      return;
    }
    
    this.socket.emit("getRooms");
  }
  
  /**
   * Get the current game theme
   * @returns {string|null} - Current game theme
   */
  getGameTheme() {
    return this.gameTheme;
  }
  
  /**
   * Get the current difficulty
   * @returns {string|null} - Current difficulty
   */
  getDifficulty() {
    return this.difficulty;
  }
  
  /**
   * Get the current layout config
   * @returns {Object|null} - Current layout config
   */
  getLayoutConfig() {
    return this.layoutConfig;
  }
}

// Create singleton instance
const socketService = new SocketService();

// Initialize on service creation
socketService.initialize();

export default socketService;