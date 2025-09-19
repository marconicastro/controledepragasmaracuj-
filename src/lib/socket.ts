import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

// Socket.io server configuration
export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    };
  };
};

// Setup Socket.IO server
export const setupSocket = (io: Server) => {
  console.log('Setting up Socket.IO server...');

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join room based on user ID or session
    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room: ${roomId}`);
    });

    // Handle custom events
    socket.on('user-action', (data) => {
      console.log('User action:', data);
      // Broadcast to all clients in the room
      socket.to(data.roomId).emit('user-action', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

// Socket.io client configuration
export const socketConfig = {
  path: '/api/socket',
  transports: ['websocket', 'polling'] as const,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
};