// src/hooks/useSocket.js
import { useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

/**
 * Custom hook for using the socket service in components
 * @param {string} componentId - Unique identifier for the component
 * @param {boolean} autoConnect - Whether to automatically connect to the socket
 * @returns {Object} - Socket-related utilities
 */
const useSocket = (componentId, autoConnect = false) => {
  // Use a ref to track if the component is mounted
  const isMountedRef = useRef(true);
  
  // Connect to socket
  const connect = useCallback(() => {
    if (isMountedRef.current) {
      socketService.connect();
    }
  }, []);
  
  // Add an event listener
  const addEventListener = useCallback((event, callback) => {
    if (isMountedRef.current && typeof callback === 'function') {
      socketService.addEventListener(event, callback, componentId);
    }
  }, [componentId]);
  
  // Remove all event listeners for this component
  const removeEventListeners = useCallback(() => {
    if (componentId) {
      socketService.removeEventListeners(componentId);
    }
  }, [componentId]);
  
  // Reset socket state
  const resetState = useCallback(() => {
    socketService.resetState();
  }, []);
  
  // Set up auto-connect and cleanup
  useEffect(() => {
    // Track component mounted state
    isMountedRef.current = true;
    
    // Auto-connect if requested
    if (autoConnect) {
      connect();
    }
    
    // Clean up on unmount
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Remove all event listeners for this component
      removeEventListeners();
    };
  }, [connect, autoConnect, removeEventListeners]);
  
  // Return socket-related utilities
  return {
    // Connection utilities
    connect,
    disconnect: socketService.disconnect.bind(socketService),
    isConnected: socketService.isConnected.bind(socketService),
    resetState,
    
    // Event utilities
    addEventListener,
    removeEventListeners,
    
    // Room actions
    createRoom: socketService.createRoom.bind(socketService),
    joinRoom: socketService.joinRoom.bind(socketService),
    leaveRoom: socketService.leaveRoom.bind(socketService),
    getRooms: socketService.getRooms.bind(socketService),
    
    // Add the new requestPlayerList method
    requestPlayerList: socketService.requestPlayerList.bind(socketService),
    
    // Game actions
    startGame: socketService.startGame.bind(socketService),
    cardClick: socketService.cardClick.bind(socketService),
    playAgain: socketService.playAgain.bind(socketService),
    sendMessage: socketService.sendMessage.bind(socketService),
    
    // Getters
    getGameTheme: socketService.getGameTheme.bind(socketService),
    getDifficulty: socketService.getDifficulty.bind(socketService),
    getLayoutConfig: socketService.getLayoutConfig.bind(socketService)
  };
};

export default useSocket;