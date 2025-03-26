// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // In production, restrict to your app domain
    methods: ["GET", "POST"]
  }
});

// Game rooms storage
const gameRooms = new Map();

// Add a simple heartbeat system to keep connections alive
setInterval(() => {
  io.emit('ping', { timestamp: new Date().getTime() });
}, 25000);

// Cleanup stale rooms every hour
setInterval(() => {
  const now = new Date().getTime();
  let deletedRooms = 0;
  
  for (const [roomId, room] of gameRooms.entries()) {
    // Delete rooms older than 2 hours or empty rooms
    if ((room.createdAt && (now - room.createdAt > 2 * 60 * 60 * 1000)) || 
        room.players.length === 0) {
      gameRooms.delete(roomId);
      deletedRooms++;
    }
  }
  
  if (deletedRooms > 0) {
    console.log(`Cleaned up ${deletedRooms} stale rooms`);
  }
}, 60 * 60 * 1000);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Respond to heartbeat
  socket.on('pong', (data) => {
    // Client responded to ping, connection is alive
  });

  // Create a new game room
  socket.on('createRoom', ({ playerName, difficulty, gameTheme }) => {
    console.log(`Creating room for ${playerName} with difficulty ${difficulty} and theme ${gameTheme}`);
    
    // Generate a short, uppercase room code
    const roomId = uuidv4().substring(0, 6).toUpperCase();
    
    // Verify room ID is unique
    if (gameRooms.has(roomId)) {
      console.log(`Room ID collision detected: ${roomId}. Generating new ID.`);
      // Try again with a different ID
      socket.emit('createRoom', { playerName, difficulty, gameTheme });
      return;
    }
    
    console.log(`New room created: ${roomId}`);
    
    // Initialize game room
    gameRooms.set(roomId, {
      id: roomId,
      host: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        isHost: true,
        score: 0,
        moves: 0
      }],
      gameState: {
        difficulty,
        gameTheme,
        cards: [],
        flippedIndices: [],
        matchedPairs: [],
        matchedBy: {},
        currentPlayerIndex: 0,
        status: 'waiting' // waiting, playing, finished
      },
      maxPlayers: 4,
      messages: [],
      createdAt: new Date().getTime() // Add creation timestamp
    });
    
    socket.join(roomId);
    
    // Send room info back to creator
    socket.emit('roomCreated', {
      roomId,
      ...gameRooms.get(roomId)
    });
    
    // Send updated room list to all clients in lobby
    sendRoomList();
  });
  
  // Join existing room
  socket.on('joinRoom', ({ roomId, playerName, gameTheme }) => {
    console.log(`Attempting to join room: ${roomId} with theme ${gameTheme}`);
    
    // Standardize room ID format (uppercase and trim)
    const formattedRoomId = roomId.toUpperCase().trim();
    
    // Check if room exists
    const room = gameRooms.get(formattedRoomId);
    
    if (!room) {
      console.log(`Room not found: ${formattedRoomId}`);
      console.log(`Available rooms: ${Array.from(gameRooms.keys()).join(', ')}`);
      socket.emit('roomError', { message: 'Room not found' });
      return;
    }
    
    // Check theme compatibility if the room has a theme and the client provided one
    if (room.gameState.gameTheme && gameTheme && room.gameState.gameTheme !== gameTheme) {
      console.log(`Theme mismatch: room=${room.gameState.gameTheme}, client=${gameTheme}`);
      socket.emit('roomError', { 
        message: `Theme mismatch: room has ${room.gameState.gameTheme} theme but you're using ${gameTheme}` 
      });
      return;
    }
    
    if (room.players.length >= room.maxPlayers) {
      socket.emit('roomError', { message: 'Room is full' });
      return;
    }
    
    if (room.gameState.status !== 'waiting') {
      socket.emit('roomError', { message: 'Game already in progress' });
      return;
    }
    
    // Add player to room
    room.players.push({
      id: socket.id,
      name: playerName,
      isHost: false,
      score: 0,
      moves: 0
    });
    
    socket.join(formattedRoomId);
    
    // Notify room about new player
    io.to(formattedRoomId).emit('playerJoined', {
      roomId: formattedRoomId,
      players: room.players,
      message: `${playerName} joined the game`
    });
    
    // Send room info to joining player
    socket.emit('roomJoined', {
      roomId: formattedRoomId,
      gameTheme: room.gameState.gameTheme, // Make sure to send the room's theme
      ...room
    });
    
    // Send updated room list to all clients in lobby
    sendRoomList();
  });
  
  // Start game
  socket.on('startGame', ({ roomId, cards, layoutConfig, gameTheme, difficulty }) => {
    console.log(`Starting game in room: ${roomId}`);
    
    const room = gameRooms.get(roomId);
    
    if (!room) {
      console.log(`Room not found: ${roomId}`);
      socket.emit('roomError', { message: 'Room not found' });
      return;
    }
    
    if (socket.id !== room.host) {
      console.log(`Non-host tried to start game: ${socket.id}`);
      socket.emit('roomError', { message: 'Only the host can start the game' });
      return;
    }
    
    // Store all the game configuration from the host
    room.gameState.cards = cards;
    room.gameState.status = 'playing';
    room.gameState.currentPlayerIndex = 0;
    
    // Store additional configuration
    if (layoutConfig) {
      room.gameState.layoutConfig = layoutConfig;
      console.log(`Storing layout config: ${layoutConfig.cols}x${layoutConfig.rows}`);
    }
    
    if (gameTheme && gameTheme !== room.gameState.gameTheme) {
      room.gameState.gameTheme = gameTheme;
      console.log(`Updating game theme to: ${gameTheme}`);
    }
    
    if (difficulty && difficulty !== room.gameState.difficulty) {
      room.gameState.difficulty = difficulty;
      console.log(`Updating difficulty to: ${difficulty}`);
    }
    
    console.log(`Game started with ${cards.length} cards in room ${roomId}`);
    
    // Notify all players that game has started with the SAME configuration
    io.to(roomId).emit('gameStarted', {
      roomId,
      gameState: room.gameState,
      gameTheme: room.gameState.gameTheme,
      difficulty: room.gameState.difficulty,
      layoutConfig: room.gameState.layoutConfig, // Forward layout config to all clients
      message: 'Game has started!'
    });
  });
  
  // Handle card click
  socket.on('cardClick', ({ roomId, cardIndex }) => {
    const room = gameRooms.get(roomId);
    
    if (!room || room.gameState.status !== 'playing') {
      return;
    }
    
    // Find player index
    const playerIndex = room.players.findIndex(player => player.id === socket.id);
    
    // Check if it's player's turn
    if (playerIndex !== room.gameState.currentPlayerIndex) {
      socket.emit('roomError', { message: "It's not your turn" });
      return;
    }
    
    // Handle card click logic
    const { gameState } = room;
    
    // Prevent clicking if already flipped or matched
    if (
      gameState.flippedIndices.includes(cardIndex) ||
      gameState.matchedPairs.includes(gameState.cards[cardIndex].id) ||
      gameState.flippedIndices.length >= 2
    ) {
      return;
    }
    
    // Update flipped indices
    gameState.flippedIndices = [...gameState.flippedIndices, cardIndex];
    
    // Increment player moves
    room.players[playerIndex].moves += 1;
    
    console.log(`Player ${playerIndex} flipped card at index ${cardIndex}`);
    
    // Broadcast card flip to all players
    io.to(roomId).emit('cardFlipped', {
      roomId,
      gameState: gameState,
      players: room.players,
      flippedIndex: cardIndex,
      flippedBy: playerIndex
    });
    
    // Check for match if two cards are flipped
    if (gameState.flippedIndices.length === 2) {
      const [firstIndex, secondIndex] = gameState.flippedIndices;
      
      if (gameState.cards[firstIndex].id === gameState.cards[secondIndex].id) {
        // Match found!
        const cardId = gameState.cards[firstIndex].id;
        gameState.matchedPairs = [...gameState.matchedPairs, cardId];
        gameState.matchedBy[cardId] = playerIndex;
        
        // Update player score
        room.players[playerIndex].score += 1;
        
        console.log(`Match found! Player ${playerIndex} found a pair. Score: ${room.players[playerIndex].score}`);
        
        // Reset flipped indices after delay
        setTimeout(() => {
          gameState.flippedIndices = [];
          
          // Check if game is over
          if (gameState.matchedPairs.length === gameState.cards.length / 2) {
            console.log(`Game over in room ${roomId}`);
            gameState.status = 'finished';
            
            io.to(roomId).emit('gameOver', {
              roomId,
              gameState,
              players: room.players,
              message: 'Game Over!'
            });
          } else {
            // Continue the game, keep the same player's turn after a match
            io.to(roomId).emit('turnUpdate', {
              roomId,
              gameState,
              players: room.players,
              currentPlayer: playerIndex
            });
          }
        }, 1000);
      } else {
        // No match
        console.log(`No match. Player ${playerIndex} missed. Switching turns.`);
        
        // Reset flipped indices after delay and switch player
        setTimeout(() => {
          gameState.flippedIndices = [];
          
          // Move to next player
          gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % room.players.length;
          
          io.to(roomId).emit('turnUpdate', {
            roomId,
            gameState,
            players: room.players,
            currentPlayer: gameState.currentPlayerIndex
          });
        }, 1000);
      }
    }
  });
  
  // Play again request
  socket.on('playAgain', ({ roomId }) => {
    console.log(`Play again request for room ${roomId}`);
    
    const room = gameRooms.get(roomId);
    
    if (!room) {
      socket.emit('roomError', { message: 'Room not found' });
      return;
    }
    
    if (socket.id !== room.host) {
      socket.emit('roomError', { message: 'Only the host can restart the game' });
      return;
    }
    
    // Reset game state
    room.gameState.flippedIndices = [];
    room.gameState.matchedPairs = [];
    room.gameState.matchedBy = {};
    room.gameState.cards = [];
    room.gameState.status = 'waiting';
    
    // Reset player scores
    room.players.forEach(player => {
      player.score = 0;
      player.moves = 0;
    });
    
    console.log(`Game reset in room ${roomId}`);
    
    // Notify all players about restart
    io.to(roomId).emit('gameReset', {
      roomId,
      gameState: room.gameState,
      players: room.players,
      message: 'Game has been reset'
    });
  });
  
  // Chat message
  socket.on('sendMessage', ({ roomId, message }) => {
    const room = gameRooms.get(roomId);
    
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    
    if (!player) return;
    
    const chatMessage = {
      senderId: socket.id,
      senderName: player.name,
      text: message,
      timestamp: new Date().toISOString()
    };
    
    room.messages.push(chatMessage);
    
    console.log(`Message in room ${roomId} from ${player.name}: ${message}`);
    
    io.to(roomId).emit('newMessage', {
      roomId,
      message: chatMessage
    });
  });
  
  // Handle player leaving
  socket.on('leaveRoom', ({ roomId }) => {
    console.log(`Player ${socket.id} is leaving room ${roomId}`);
    handlePlayerLeaving(socket, roomId);
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find rooms where player is
    for (const [roomId, room] of gameRooms.entries()) {
      if (room.players.some(player => player.id === socket.id)) {
        console.log(`Player ${socket.id} was in room ${roomId}, handling departure`);
        handlePlayerLeaving(socket, roomId);
      }
    }
  });
  
  // Request available rooms
  socket.on('getRooms', () => {
    console.log(`Room list requested by ${socket.id}`);
    sendRoomList(socket);
  });
});

// Helper function to send room list to clients
function sendRoomList(socket = null) {
  const availableRooms = [];
  
  console.log(`Total rooms: ${gameRooms.size}`);
  
  for (const [roomId, room] of gameRooms.entries()) {
    console.log(`Room ${roomId}: status=${room.gameState.status}, players=${room.players.length}/${room.maxPlayers}`);
    
    // Clean up old rooms (over 2 hours)
    const now = new Date().getTime();
    if (room.createdAt && (now - room.createdAt > 2 * 60 * 60 * 1000)) {
      console.log(`Removing stale room: ${roomId}`);
      gameRooms.delete(roomId);
      continue;
    }
    
    if (room.gameState.status === 'waiting' && room.players.length < room.maxPlayers) {
      availableRooms.push({
        roomId,
        hostName: room.players.find(p => p.isHost)?.name || "Host",
        playerCount: room.players.length,
        maxPlayers: room.maxPlayers,
        difficulty: room.gameState.difficulty,
        gameTheme: room.gameState.gameTheme
      });
    }
  }
  
  const response = { rooms: availableRooms };
  console.log(`Sending room list: ${JSON.stringify(response)}`);
  
  if (socket) {
    // Send to specific client
    socket.emit('roomList', response);
  } else {
    // Broadcast to all clients
    io.emit('roomList', response);
  }
}

// Helper function to handle player leaving a room
function handlePlayerLeaving(socket, roomId) {
  const room = gameRooms.get(roomId);
  
  if (!room) {
    console.log(`Room ${roomId} not found when player ${socket.id} was leaving`);
    return;
  }
  
  // Find player
  const playerIndex = room.players.findIndex(p => p.id === socket.id);
  
  if (playerIndex === -1) {
    console.log(`Player ${socket.id} not found in room ${roomId}`);
    return;
  }
  
  const player = room.players[playerIndex];
  console.log(`Player ${player.name} (${socket.id}) leaving room ${roomId}`);
  
  // Remove player from room
  room.players.splice(playerIndex, 1);
  
  // Leave the room
  socket.leave(roomId);
  
  // If no players left, delete the room
  if (room.players.length === 0) {
    console.log(`Room ${roomId} is empty, deleting it`);
    gameRooms.delete(roomId);
    sendRoomList();
    return;
  }
  
  // If host left, assign new host
  if (player.isHost && room.players.length > 0) {
    console.log(`Host left room ${roomId}, assigning new host: ${room.players[0].name}`);
    room.players[0].isHost = true;
    room.host = room.players[0].id;
  }
  
  // If it was the player's turn, move to next player
  if (room.gameState.status === 'playing' && room.gameState.currentPlayerIndex === playerIndex) {
    console.log(`It was ${player.name}'s turn, moving to next player`);
    room.gameState.currentPlayerIndex = room.gameState.currentPlayerIndex % room.players.length;
  } else if (room.gameState.status === 'playing' && room.gameState.currentPlayerIndex > playerIndex) {
    // Adjust current player index if a previous player left
    room.gameState.currentPlayerIndex--;
  }
  
  // Notify room about player leaving
  io.to(roomId).emit('playerLeft', {
    roomId,
    players: room.players,
    gameState: room.gameState,
    message: `${player.name} left the game`
  });
  
  // Update room list for lobby
  sendRoomList();
}

// Add some basic error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // In production, you might want to restart the server here
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    uptime: process.uptime(),
    roomCount: gameRooms.size,
    timestamp: new Date().toISOString()
  });
});